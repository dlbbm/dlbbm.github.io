/**
 * Joins two works into one and repoints every recording of them onto the survivor.
 *
 * `npm run song:merge` offers the pairs `data:check-duplicates` found; `-- <from> <into>`
 * goes straight to two ids. The title the merge drops becomes an alias, which is what the
 * import's own mistake asks for: `Boots (Original Melody)` was never another work, it was
 * what one take was released as.
 *
 * Who the work is originally by is asked when the two records disagree. Nothing else is: a
 * work carries a title, its aliases and what it is built on, and all three join.
 */

import process from 'node:process'
import { confirm, select } from '@inquirer/prompts'
import { styles } from '@design-edito/tools/agnostic/misc/logs/styles/index.js'
import type { ArtistId, Song, SongId } from '../../shared/types/index.js'
import { printRecords } from '../_ask/index.js'
import { findDuplicates } from '../_check/index.js'
import { readDb, write, type Db } from '../_db/index.js'
import { describeSong, findArtistById } from '../_describe/index.js'
import { askPair, union, type Pair } from '../_merge/index.js'

const db: Db = await readDb()

console.log('')
console.log(styles.title('Merging two songs...'))

const [, , fromId, intoId] = process.argv
let given: Pair<Song> | null = null
if (fromId !== undefined || intoId !== undefined) {
  const from = db.songs.find(candidate => candidate.id === fromId)
  const into = db.songs.find(candidate => candidate.id === intoId)
  if (from === undefined || into === undefined) {
    console.log(styles.error(`Takes two song ids: ${fromId ?? '—'} and ${intoId ?? '—'} are not both in the data.`))
    process.exit(1)
  }
  given = { from, into }
}

const pairs = findDuplicates(db).pairs
  .flatMap(pair => pair.collection === 'songs' ? [pair] : [])
const picked = await askPair<Song>({
  kind: 'song',
  records: db.songs,
  pairs,
  describe: song => describeSong(song, db),
  nameOf: song => song.title,
  aliasesOf: song => song.titleAliases
}, given)

if (picked === null) {
  console.log(styles.warning('Nothing written.'))
  process.exit(0)
}

const { from, into } = picked

function claim (ids: ArtistId[]): string {
  if (ids.length === 0) return 'unclaimed'
  return ids.map(id => findArtistById(id, db.artists)?.name ?? id).join(', ')
}

const sameClaim = claim(into.originalArtistIds) === claim(from.originalArtistIds)
const originalArtistIds = sameClaim
  ? into.originalArtistIds
  : await select<ArtistId[]>({
    message: 'Originally',
    default: into.originalArtistIds,
    choices: [
      { name: claim(into.originalArtistIds), value: into.originalArtistIds },
      { name: claim(from.originalArtistIds), value: from.originalArtistIds },
      {
        name: claim([...into.originalArtistIds, ...from.originalArtistIds]),
        value: union(into.originalArtistIds, from.originalArtistIds, (one, other) => one === other)
      }
    ]
  })

const merged: Song = {
  ...into,
  titleAliases: union(
    into.titleAliases,
    [from.title, ...from.titleAliases],
    (one, other) => one === other
  ).filter(alias => alias !== into.title),
  originalArtistIds,
  // A work merged into one it was derived from would otherwise be built on itself.
  derivedFromSongIds: union(
    into.derivedFromSongIds,
    from.derivedFromSongIds,
    (one, other) => one === other
  ).filter(id => id !== into.id && id !== from.id),
  sources: union(into.sources, from.sources, (one, other) => one.url === other.url)
}

function repoint (ids: SongId[]): SongId[] {
  if (!ids.includes(from.id)) return ids
  const kept: SongId[] = []
  for (const id of ids) {
    const moved = id === from.id ? into.id : id
    if (!kept.includes(moved)) kept.push(moved)
  }
  return kept
}

const recordings = db.recordings.map(recording => recording.songId === from.id
  ? { ...recording, songId: into.id }
  : recording)
const songs = db.songs
  .filter(candidate => candidate.id !== from.id)
  .map(candidate => candidate.id === into.id
    ? merged
    : { ...candidate, derivedFromSongIds: repoint(candidate.derivedFromSongIds) })

const moved = db.recordings.filter(recording => recording.songId === from.id).length
const rebuilt = songs.filter(song => song.id !== into.id
  && JSON.stringify(song) !== JSON.stringify(db.songs.find(candidate => candidate.id === song.id))).length

console.log('')
console.log(styles.info('Merged'))
printRecords({ songs: [merged] })

console.log('')
console.log(styles.light(`> ${moved} recording${moved === 1 ? '' : 's'} repointed`))
console.log(styles.light(`> ${rebuilt} song${rebuilt === 1 ? '' : 's'} built on it rewritten`))
console.log(styles.light(`> ${from.title} leaves the data`))

console.log('')
console.log(styles.danger('songs.ndjson and recordings.ndjson are rewritten whole.'))

if (!await confirm({ message: 'Merge?', default: false })) {
  console.log(styles.warning('Nothing written.'))
  process.exit(0)
}

// The recordings first, so nothing is ever left pointing at a work that has gone.
await write('recordings', recordings)
await write('songs', songs)

console.log('')
console.log(styles.title('Songs merged.'))
console.log(styles.success(`${songs.length} songs in the data`))
console.log('')
