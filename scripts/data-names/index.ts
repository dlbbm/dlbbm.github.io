/**
 * Every artist name read against MusicBrainz, and corrected one name at a time.
 *
 * A name here is hand-typed and nothing validates it, so `Death In Vegas` and
 * `Sebastien Tellier` sit in the data looking exactly as right as the 364 names that are.
 * MusicBrainz is the one free register of how an act spells itself, so the pass asks it
 * for each name and shows the two side by side wherever they are not identical character
 * for character.
 *
 * **It answers nothing.** MusicBrainz stylises — `SALEM`, `alt-J`, `halina heron` — writes
 * `and the` where this data writes `& The`, and its search scores a tribute band 100 for
 * the artist it covers. So a difference is a question, and keeping ours is a first-class
 * answer rather than a refusal.
 *
 * A candidate counts as the same act when `comparisonKey` folds the two names together —
 * the same test `data:check-duplicates` pairs records on, so an article, a conjunction or
 * a diacritic is not what makes two names differ. Anything it cannot fold is listed at the
 * end and never asked about: `Morgan` against `Paul Leonard-Morgan` is a different person,
 * not a typo.
 *
 * Slugs are left where they are. A slug is drawn once and belongs to the record, so a name
 * corrected here does not move an address — which is the whole point of drawing it once.
 */

import { existsSync } from 'node:fs'
import { appendFile, readFile, writeFile } from 'node:fs/promises'
import process from 'node:process'
import { confirm, input, select } from '@inquirer/prompts'
import { styles } from '@design-edito/tools/agnostic/misc/logs/styles/index.js'
import type { Artist } from '../../shared/types/index.js'
import { comparisonKey } from '../_check/index.js'
import { MUSICBRAINZ_FILE } from '../_config/index.js'
import { readDb, write, type Db } from '../_db/index.js'

/** MusicBrainz asks every client to say what it is and where to complain about it. */
const AGENT = 'dlbbm-data-names/1.0 ( https://dlbbm.github.io )'

// One request a second is the published limit, and it is enforced. The extra tenth is for
// a clock that rounds the wrong way.
const WAIT = 1100

const SCORE = 85

type Candidate = {
  name: string
  score: number
  type: string | null
  country: string | null
  disambiguation: string | null
  aliases: string[]
}

/** One lookup, kept with the name it was made for: a renamed artist is asked again. */
type Looked = {
  id: string
  name: string
  candidates: Candidate[]
}

const sleep = async (ms: number): Promise<void> =>
  await new Promise(resolve => setTimeout(resolve, ms))

/** Lucene reads the punctuation in a name as syntax, so it is escaped rather than dropped. */
function escapeQuery (name: string): string {
  return name.replace(/([\+\-\&\|\!\(\)\{\}\[\]\^"\~\*\?\:\\\/])/gv, '\\$1')
}

async function lookUp (name: string, attempt = 0): Promise<Candidate[]> {
  const url = 'https://musicbrainz.org/ws/2/artist'
    + `?query=artist:"${encodeURIComponent(escapeQuery(name))}"`
    + '&fmt=json&limit=5'
  const response = await fetch(url, {
    headers: { 'User-Agent': AGENT, Accept: 'application/json' }
  })
  if (response.status === 503 && attempt < 4) {
    await sleep(WAIT * 5 * (attempt + 1))
    return await lookUp(name, attempt + 1)
  }
  if (!response.ok) throw new Error(`musicbrainz answered ${response.status}`)
  const body = await response.json() as { artists?: Array<Record<string, unknown>> }
  return (body.artists ?? []).map(found => ({
    name: String(found.name ?? ''),
    score: Number(found.score ?? 0),
    type: typeof found.type === 'string' ? found.type : null,
    country: typeof found.country === 'string' ? found.country : null,
    disambiguation: typeof found.disambiguation === 'string' && found.disambiguation !== ''
      ? found.disambiguation
      : null,
    aliases: Array.isArray(found.aliases)
      ? found.aliases.map(alias => String((alias as { name?: unknown }).name ?? ''))
      : []
  }))
}

/**
 * What has already been asked, by artist id.
 *
 * The file is append-only and outside `data/`: it is not a record, it goes stale the day
 * MusicBrainz edits a name, and it exists so that a second run costs no requests. A line
 * whose `name` is no longer the artist's is dropped, which is what makes a correction
 * asked once.
 */
async function readCache (): Promise<Map<string, Looked>> {
  const cached = new Map<string, Looked>()
  if (!existsSync(MUSICBRAINZ_FILE)) return cached
  const raw = await readFile(MUSICBRAINZ_FILE, { encoding: 'utf-8' })
  for (const line of raw.split('\n')) {
    const trimmed = line.trim()
    if (trimmed === '') continue
    try {
      const looked = JSON.parse(trimmed) as Looked
      cached.set(looked.id, looked)
    } catch { continue }
  }
  return cached
}

const db: Db = await readDb()
const cached = await readCache()

const artists = [...db.artists].sort((one, other) => one.name.localeCompare(other.name))
const asking = artists.filter(artist => cached.get(artist.id)?.name !== artist.name)

console.log('')
console.log(styles.title('Reading the names against MusicBrainz...'))
console.log(styles.light(`> ${artists.length} artists, ${artists.length - asking.length} already looked up`))

if (asking.length > 0) {
  const minutes = Math.ceil(asking.length * WAIT / 60000)
  console.log(styles.light(`> ${asking.length} to ask, one a second, around ${minutes} minute${minutes === 1 ? '' : 's'}`))
  if (!existsSync(MUSICBRAINZ_FILE)) await writeFile(MUSICBRAINZ_FILE, '', { encoding: 'utf-8' })
  for (const [index, artist] of asking.entries()) {
    let candidates: Candidate[]
    try { candidates = await lookUp(artist.name) }
    catch (error) {
      console.log('')
      console.log(styles.error(`${artist.name}: ${error instanceof Error ? error.message : String(error)}`))
      console.log(styles.warning('> what was answered is kept, run it again to carry on'))
      break
    }
    const looked: Looked = { id: artist.id, name: artist.name, candidates }
    cached.set(artist.id, looked)
    await appendFile(MUSICBRAINZ_FILE, `${JSON.stringify(looked)}\n`, { encoding: 'utf-8' })
    if ((index + 1) % 25 === 0) console.log(styles.light(`> ${index + 1}/${asking.length}`))
    await sleep(WAIT)
  }
}

/** The candidate MusicBrainz offers for the same act, under whatever spelling. */
function sameAct (artist: Artist): Candidate | null {
  const key = comparisonKey(artist.name)
  const candidates = (cached.get(artist.id)?.candidates ?? []).filter(one => one.score >= SCORE)
  return candidates.find(one => comparisonKey(one.name) === key
    || one.aliases.some(alias => comparisonKey(alias) === key)) ?? null
}

type Differing = { artist: Artist, candidate: Candidate }

const differing: Differing[] = []
const unmatched: Artist[] = []

for (const artist of artists) {
  if (!cached.has(artist.id)) continue
  const candidate = sameAct(artist)
  if (candidate === null) { unmatched.push(artist); continue }
  if (candidate.name !== artist.name) differing.push({ artist, candidate })
}

const describe = (candidate: Candidate): string => [
  candidate.type,
  candidate.country,
  candidate.disambiguation
].filter(part => part !== null).join(', ')

const TYPE = 'type a name'
const STOP = 'stop'

const renames = new Map<string, string>()
let stopped = false

console.log('')
console.log(styles.info('Differing'))
console.log(styles.light(`> ${differing.length} name${differing.length === 1 ? '' : 's'} MusicBrainz spells otherwise`))

for (const { artist, candidate } of differing) {
  if (stopped) {
    console.log(styles.light(`  ${artist.name}`))
    continue
  }
  const told = describe(candidate)
  console.log('')
  if (told !== '') console.log(styles.light(`> ${told}`))
  const answer = await select<string>({
    message: 'name',
    default: artist.name,
    choices: [
      { name: artist.name, value: artist.name },
      { name: candidate.name, value: candidate.name },
      { name: TYPE, value: TYPE },
      { name: STOP, value: STOP }
    ]
  })
  if (answer === STOP) { stopped = true; continue }
  const named = answer === TYPE
    ? (await input({ message: 'name', default: artist.name })).trim()
    : answer
  if (named === '' || named === artist.name) continue
  renames.set(artist.id, named)
}

if (unmatched.length > 0) {
  console.log('')
  console.log(styles.info('No match'))
  console.log(styles.light(`> ${unmatched.length} name${unmatched.length === 1 ? '' : 's'} MusicBrainz answers nothing for, or answers somebody else for`))
  for (const artist of unmatched) console.log(styles.light(`  ${artist.name}`))
}

if (renames.size === 0) {
  console.log('')
  console.log(styles.title('Names read.'))
  console.log(styles.warning('Nothing renamed.'))
  console.log('')
  process.exit(0)
}

const renamed: Artist[] = db.artists.map(artist => {
  const named = renames.get(artist.id)
  return named === undefined ? artist : { ...artist, name: named }
})

console.log('')
console.log(styles.info('Renamed'))
for (const [id, named] of renames) {
  const artist = db.artists.find(candidate => candidate.id === id)
  console.log(`${styles.regular(artist?.name ?? id)} ${styles.important(`→ ${named}`)}`)
}
console.log(styles.light('> slugs are left alone, so no address moves'))

const collisions = [...renames.entries()].flatMap(([id, named]) => renamed
  .filter(artist => artist.id !== id && artist.name === named)
  .map(artist => `${named} (${id} and ${artist.id})`))
if (collisions.length > 0) {
  console.log('')
  console.log(styles.warning('Two records end up under one name:'))
  for (const collision of collisions) console.log(styles.light(`  ${collision}`))
  console.log(styles.light('> artist:merge is what joins them'))
}

console.log('')
console.log(styles.danger('artists.ndjson is rewritten whole.'))

if (!await confirm({ message: 'Rename?', default: false })) {
  console.log(styles.warning('Nothing written.'))
  console.log('')
  process.exit(0)
}

await write('artists', renamed)

console.log('')
console.log(styles.title('Names read.'))
console.log(styles.success(`${renames.size} artist${renames.size === 1 ? '' : 's'} renamed.`))
console.log('')
