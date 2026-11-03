/**
 * Asks a work again, with every answer prefilled, and replaces the line it sits on.
 *
 * `npm run song:edit -- <songId>` goes straight to one; with no argument the works are
 * listed alphabetically. Nothing here touches a recording or a post — a work's title, the
 * other names it goes by, who it belongs to and what it is built on are the four things no
 * other command can reach without a post wrapped around them.
 */

import process from 'node:process'
import { confirm, select } from '@inquirer/prompts'
import { styles } from '@design-edito/tools/agnostic/misc/logs/styles/index.js'
import type { Song } from '../../shared/types/index.js'
import { askSong, printRecords, printSong } from '../_ask/index.js'
import { append, readDb, saveSong, type Db } from '../_db/index.js'
import { describeSong } from '../_describe/index.js'

const db: Db = await readDb()

console.log('')
console.log(styles.title('Editing a song...'))

if (db.songs.length === 0) {
  console.log(styles.warning('No song to edit.'))
  process.exit(0)
}

const [, , askedId] = process.argv

let song: Song | undefined
if (askedId !== undefined) {
  song = db.songs.find(candidate => candidate.id === askedId)
  if (song === undefined) {
    console.log(styles.error(`No song with id ${askedId}.`))
    process.exit(1)
  }
} else {
  console.log('')
  song = await select<Song>({
    message: 'Song',
    choices: [...db.songs]
      .sort((one, other) => one.title.localeCompare(other.title))
      .map(candidate => ({ ...describeSong(candidate, db), value: candidate }))
  })
}

console.log('')
const draft = await askSong(db, song)

printSong(draft)

const changes = [
  draft.createdArtists.length === 0 ? null : `${draft.createdArtists.length} artist appended`,
  draft.createdSlugs.length === 0 ? null : `${draft.createdSlugs.length} slug appended`,
  draft.createdSongs.length === 0 ? null : `${draft.createdSongs.length} song appended`,
  '1 song rewritten'
].filter((part): part is string => part !== null)
console.log(styles.info('\nTo be written'))
console.log(styles.light(changes.join(', ')))
console.log(styles.warning('songs.ndjson is rewritten whole.'))
console.log('')

const confirmed = await confirm({ message: 'Save?', default: true })
if (!confirmed) {
  console.log(styles.warning('Nothing written.'))
  process.exit(0)
}

// New entities first, so the rewritten line never points at something not yet on disk.
await append('artists', draft.createdArtists)
await append('slugs', draft.createdSlugs)
await saveSong(draft.song, draft.createdSongs, db.songs)

console.log('')
console.log(styles.title('Song edited.'))
console.log(styles.success(`${db.songs.length + draft.createdSongs.length} songs in the data`))

printRecords({
  artists: draft.createdArtists,
  slugs: draft.createdSlugs,
  songs: [draft.song, ...draft.createdSongs]
})
console.log('')
