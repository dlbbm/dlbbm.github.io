/**
 * Joins two artists into one and repoints every credit onto the survivor.
 *
 * `npm run artist:merge` offers the pairs `data:check-duplicates` found; `-- <from>
 * <into>` goes straight to two ids. The name the merge drops is kept as an alias, since it
 * is how the blog once credited the record and the one thing a merge would otherwise lose.
 *
 * The loser's slug is dropped rather than repointed: `findSlug` answers with the first
 * line it meets, so a second slug for one artist is a URL nothing would ever serve.
 */

import process from 'node:process'
import { confirm } from '@inquirer/prompts'
import { styles } from '@design-edito/tools/agnostic/misc/logs/styles/index.js'
import type { Artist, ArtistId, Recording } from '../../shared/types/index.js'
import { printRecords } from '../_ask/index.js'
import { findDuplicates } from '../_check/index.js'
import { readDb, write, type Db } from '../_db/index.js'
import { describeArtist } from '../_describe/index.js'
import { askPair, union, type Pair } from '../_merge/index.js'

const db: Db = await readDb()

console.log('')
console.log(styles.title('Merging two artists...'))

const [, , fromId, intoId] = process.argv
let given: Pair<Artist> | null = null
if (fromId !== undefined || intoId !== undefined) {
  const from = db.artists.find(candidate => candidate.id === fromId)
  const into = db.artists.find(candidate => candidate.id === intoId)
  if (from === undefined || into === undefined) {
    console.log(styles.error(`Takes two artist ids: ${fromId ?? '—'} and ${intoId ?? '—'} are not both in the data.`))
    process.exit(1)
  }
  given = { from, into }
}

const pairs = findDuplicates(db).pairs
  .flatMap(pair => pair.collection === 'artists' ? [pair] : [])
const picked = await askPair<Artist>({
  kind: 'artist',
  records: db.artists,
  pairs,
  describe: artist => describeArtist(artist, db),
  nameOf: artist => artist.name,
  aliasesOf: artist => artist.nameAliases
}, given)

if (picked === null) {
  console.log(styles.warning('Nothing written.'))
  process.exit(0)
}

const { from, into } = picked

const merged: Artist = {
  ...into,
  nameAliases: union(
    into.nameAliases,
    [from.name, ...from.nameAliases],
    (one, other) => one === other
  ).filter(alias => alias !== into.name),
  sources: union(into.sources, from.sources, (one, other) => one.url === other.url)
}

function repoint (ids: ArtistId[]): ArtistId[] {
  if (!ids.includes(from.id)) return ids
  const kept: ArtistId[] = []
  for (const id of ids) {
    const moved = id === from.id ? into.id : id
    if (!kept.includes(moved)) kept.push(moved)
  }
  return kept
}

const recordings: Recording[] = db.recordings.map(recording => ({
  ...recording,
  byArtistIds: repoint(recording.byArtistIds),
  featuringArtistIds: repoint(recording.featuringArtistIds),
  remixedByArtistIds: repoint(recording.remixedByArtistIds)
}))
const songs = db.songs.map(song => ({ ...song, originalArtistIds: repoint(song.originalArtistIds) }))
const artists = db.artists
  .filter(candidate => candidate.id !== from.id)
  .map(candidate => candidate.id === into.id ? merged : candidate)
const slugs = db.slugs.filter(slug => slug.targetId !== from.id)

const credits = recordings.filter((recording, index) =>
  JSON.stringify(recording) !== JSON.stringify(db.recordings[index])).length
const claims = songs.filter((song, index) =>
  JSON.stringify(song) !== JSON.stringify(db.songs[index])).length

console.log('')
console.log(styles.info('Merged'))
printRecords({ artists: [merged] })

console.log('')
console.log(styles.light(`> ${credits} recording${credits === 1 ? '' : 's'} recredited`))
console.log(styles.light(`> ${claims} song${claims === 1 ? '' : 's'} reclaimed`))
console.log(styles.light(`> ${db.slugs.length - slugs.length} slug line${db.slugs.length - slugs.length === 1 ? '' : 's'} dropped`))
console.log(styles.light(`> ${describeArtist(from, db).name} leaves the data`))

console.log('')
console.log(styles.danger('artists.ndjson, slugs.ndjson, songs.ndjson and recordings.ndjson are rewritten whole.'))

if (!await confirm({ message: 'Merge?', default: false })) {
  console.log(styles.warning('Nothing written.'))
  process.exit(0)
}

// The credits first, so nothing is ever left pointing at an artist that has gone.
await write('recordings', recordings)
await write('songs', songs)
await write('artists', artists)
await write('slugs', slugs)

console.log('')
console.log(styles.title('Artists merged.'))
console.log(styles.success(`${artists.length} artists in the data`))
console.log('')
