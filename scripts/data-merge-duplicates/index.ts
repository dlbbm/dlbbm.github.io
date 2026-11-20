/**
 * Walks the pairs `data:check-duplicates` found, artists and works alike, and merges the
 * ones that are one record entered twice.
 *
 * The report is read again after every merge rather than walked as a list taken at the
 * start: joining two artists can make two of their works look alike, and joining two works
 * can leave a pair of the list pointing at a record that has gone. So the count a question
 * carries is what is left to look at now, not a position in anything fixed. A merge whose
 * confirmation was declined is set aside for the run rather than offered again on the next
 * read; a pair left alone is set aside for good, in `reviewed-duplicate-pairs.ndjson`.
 *
 * The slug lines `data:import` wrote twice are dropped first, under one confirmation of
 * their own: they are a defect with nothing to decide, and the pairs are the questions.
 */

import { existsSync } from 'node:fs'
import { readFile, writeFile } from 'node:fs/promises'
import { confirm, select } from '@inquirer/prompts'
import { styles } from '@design-edito/tools/agnostic/misc/logs/styles/index.js'
import type { Slug } from '../../shared/types/index.js'
import { findDuplicates, type DuplicatePair } from '../_check/index.js'
import { REVIEWED_DUPLICATE_PAIRS_FILE } from '../_config/index.js'
import { readDb, write } from '../_db/index.js'
import {
  askingArtists,
  askingSongs,
  mergeArtists,
  mergeSongs,
  printPair,
  type Asking,
  type Pair
} from '../_merge/index.js'

console.log('')
console.log(styles.title('Merging duplicates...'))

/** What a pair is remembered by, so the two records in either order are one answer. */
function keyOf (pair: DuplicatePair): string {
  return `${pair.collection} ${[pair.one.id, pair.other.id].sort().join(' ')}`
}

/** A dismissed pair, kept readable by its names rather than by its key alone. */
type DismissedPair = {
  key: string
  names: [string, string]
}

function nameOf (record: DuplicatePair['one'] | DuplicatePair['other']): string {
  return 'name' in record ? record.name : record.title
}

async function readDismissedPairs (): Promise<DismissedPair[]> {
  if (!existsSync(REVIEWED_DUPLICATE_PAIRS_FILE)) return []
  const raw = await readFile(REVIEWED_DUPLICATE_PAIRS_FILE, { encoding: 'utf-8' })
  const dismissed: DismissedPair[] = []
  for (const line of raw.split('\n')) {
    const trimmed = line.trim()
    if (trimmed === '') continue
    try { dismissed.push(JSON.parse(trimmed) as DismissedPair) }
    catch { continue }
  }
  return dismissed
}

async function writeDismissedPairs (dismissed: DismissedPair[]): Promise<void> {
  await writeFile(
    REVIEWED_DUPLICATE_PAIRS_FILE,
    dismissed.map(entry => JSON.stringify(entry)).join('\n') + (dismissed.length === 0 ? '' : '\n'),
    { encoding: 'utf-8' }
  )
}

type Answer<T> = Pair<T> | 'leave' | 'stop'

/**
 * The survivor, or what to do instead.
 *
 * One question rather than two: whether a pair is one record is answered by saying which
 * record it is, and the confirmation each merge asks for is what guards the write.
 */
async function answerPair<T> (asking: Asking<T>, one: T, other: T): Promise<Answer<T>> {
  printPair(asking, one, other)
  console.log('')
  // Each answer carries a record rather than being one: a choice's value is compared by
  // identity, and a bare `T` beside two strings is a union the narrowing cannot split.
  const survives = [one, other].map(record => ({ kind: 'survives' as const, record }))
  const leave = { kind: 'leave' as const }
  const stop = { kind: 'stop' as const }
  const answer = await select<typeof survives[number] | typeof leave | typeof stop>({
    message: 'Survives',
    default: survives[1],
    choices: [
      ...survives.map(value => ({ name: asking.nameOf(value.record), value })),
      { name: 'leave them apart', value: leave },
      { name: 'stop', value: stop }
    ]
  })
  if (answer.kind !== 'survives') return answer.kind
  const into = answer.record
  return { from: into === one ? other : one, into }
}

/**
 * The slug lines written twice, dropped under one confirmation.
 *
 * A line repeated byte for byte is dead weight rather than a question: `findSlug` answers
 * with the first line it meets, so every one after it is a URL nothing serves. The first
 * of each is what stays, which is why dropping the rest changes no address. A slug string
 * two records answer to is a different thing and comes back as a pair.
 */
async function dropRepeatedSlugLines (): Promise<void> {
  const db = await readDb()
  const { slugLines } = findDuplicates(db)
  const over = slugLines.reduce((total, line) => total + line.times - 1, 0)
  if (over === 0) return

  const kept: Slug[] = []
  const seen = new Set<string>()
  for (const slug of db.slugs) {
    const at = `${slug.kind}/${slug.targetId}/${slug.slug}`
    if (seen.has(at)) continue
    seen.add(at)
    kept.push(slug)
  }

  console.log('')
  console.log(styles.info('Written twice'))
  console.log(styles.light(`> ${over} line${over === 1 ? '' : 's'} over, across ${slugLines.length} slug${slugLines.length === 1 ? '' : 's'}`))
  console.log(styles.light('> the first line of each stays, so no address moves'))

  console.log('')
  console.log(styles.danger('slugs.ndjson is rewritten whole.'))

  if (!await confirm({ message: 'Drop them?', default: false })) {
    console.log(styles.warning('Nothing dropped.'))
    return
  }

  await write('slugs', kept)
  console.log(styles.success(`${over} line${over === 1 ? '' : 's'} dropped, ${kept.length} left`))
}

await dropRepeatedSlugLines()

const dismissed = await readDismissedPairs()
const setAside = new Set(dismissed.map(entry => entry.key))

async function dismiss (pair: DuplicatePair): Promise<void> {
  const key = keyOf(pair)
  setAside.add(key)
  dismissed.push({ key, names: [nameOf(pair.one), nameOf(pair.other)] })
  await writeDismissedPairs(dismissed)
}

let merged = 0
let stopped = false

while (!stopped) {
  const db = await readDb()
  const pairs = findDuplicates(db).pairs.filter(pair => !setAside.has(keyOf(pair)))
  const pair = pairs[0]
  if (pair === undefined) break

  console.log('')
  console.log(styles.info(`${pairs.length} pair${pairs.length === 1 ? '' : 's'} left to answer, in ${pair.collection}`))
  console.log(styles.warning(`> ${pair.reason}`))

  if (pair.collection === 'artists') {
    const answer = await answerPair(askingArtists(db), pair.one, pair.other)
    if (answer === 'stop') { stopped = true; continue }
    if (answer === 'leave') { await dismiss(pair); continue }
    if (await mergeArtists(db, answer)) merged += 1
    else setAside.add(keyOf(pair))
  } else {
    const answer = await answerPair(askingSongs(db), pair.one, pair.other)
    if (answer === 'stop') { stopped = true; continue }
    if (answer === 'leave') { await dismiss(pair); continue }
    if (await mergeSongs(db, answer)) merged += 1
    else setAside.add(keyOf(pair))
  }
}

const left = findDuplicates(await readDb()).pairs.filter(pair => !setAside.has(keyOf(pair))).length

console.log('')
console.log(styles.title(stopped ? 'Stopped.' : 'Duplicates answered.'))
console.log(merged === 0
  ? styles.warning('Nothing merged.')
  : styles.success(`${merged} pair${merged === 1 ? '' : 's'} merged`))
if (left > 0) console.log(styles.light(`> ${left} pair${left === 1 ? '' : 's'} still look like one record`))
if (dismissed.length > 0) console.log(styles.light(`> ${dismissed.length} pair${dismissed.length === 1 ? '' : 's'} dismissed for good, in reviewed-duplicate-pairs.ndjson`))
console.log('')
