/**
 * The artist names read against what MusicBrainz answered, and corrected one at a time.
 *
 * Nothing here asks MusicBrainz anything: the lookups were made once and stored in
 * `.musicbrainz.ndjson`, one line per artist, and this walks the two lists side by side.
 * A name whose stored line no longer matches it was renamed since the lookup, so it is
 * left out rather than compared against an answer about another name.
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
import { readFile } from 'node:fs/promises'
import process from 'node:process'
import { confirm, input, select } from '@inquirer/prompts'
import { styles } from '@design-edito/tools/agnostic/misc/logs/styles/index.js'
import type { Artist } from '../../shared/types/index.js'
import { comparisonKey } from '../_check/index.js'
import { MUSICBRAINZ_FILE } from '../_config/index.js'
import { readDb, write, type Db } from '../_db/index.js'

// Below it, a search hit is answering about somebody else.
const SCORE = 85

type Candidate = {
  name: string
  score: number
  type: string | null
  country: string | null
  disambiguation: string | null
  aliases: string[]
}

/** One stored lookup, kept with the name it was made for. */
type Looked = {
  id: string
  name: string
  candidates: Candidate[]
}

if (!existsSync(MUSICBRAINZ_FILE)) {
  console.log('')
  console.log(styles.error('No .musicbrainz.ndjson to read.'))
  console.log(styles.light('> one line per artist: { id, name, candidates }'))
  console.log('')
  process.exit(1)
}

const stored = new Map<string, Looked>()
for (const line of (await readFile(MUSICBRAINZ_FILE, { encoding: 'utf-8' })).split('\n')) {
  const trimmed = line.trim()
  if (trimmed === '') continue
  const looked = JSON.parse(trimmed) as Looked
  stored.set(looked.id, looked)
}

const db: Db = await readDb()
const artists = [...db.artists].sort((one, other) => one.name.localeCompare(other.name))

/** The candidate MusicBrainz offers for the same act, under whatever spelling. */
function sameAct (artist: Artist): Candidate | null {
  const looked = stored.get(artist.id)
  if (looked === undefined || looked.name !== artist.name) return null
  const key = comparisonKey(artist.name)
  return looked.candidates
    .filter(candidate => candidate.score >= SCORE)
    .find(candidate => comparisonKey(candidate.name) === key
      || candidate.aliases.some(alias => comparisonKey(alias) === key)) ?? null
}

type Differing = { artist: Artist, candidate: Candidate }

const differing: Differing[] = []
const unmatched: Artist[] = []

for (const artist of artists) {
  const candidate = sameAct(artist)
  if (candidate === null) { unmatched.push(artist); continue }
  if (candidate.name !== artist.name) differing.push({ artist, candidate })
}

console.log('')
console.log(styles.title('Reading the names against MusicBrainz...'))
console.log(styles.light(`> ${artists.length} artists, ${stored.size} stored lookups`))

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
  console.log(styles.info('Not compared'))
  console.log(styles.light(`> ${unmatched.length} name${unmatched.length === 1 ? '' : 's'} with no stored answer about them, or an answer about somebody else`))
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
