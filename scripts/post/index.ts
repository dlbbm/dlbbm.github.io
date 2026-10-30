/**
 * Writes one post into the database, by asking for it.
 *
 * The questions live in `scripts/_ask`, which `post:edit` asks again with every answer
 * prefilled. This command only reads what is there, confirms, and appends.
 */

import process from 'node:process'
import { confirm } from '@inquirer/prompts'
import { styles } from '@design-edito/tools/agnostic/misc/logs/styles/index.js'
import { askDraft, printDraft, printRecords, storeDraftFile } from '../_ask/index.js'
import { append, readDb, type Db } from '../_db/index.js'

const db: Db = await readDb()

console.log('')
console.log(styles.title('Writing a post...'))
console.log(styles.light(`> ${db.posts.length} posts, ${db.songs.length} songs, ${db.artists.length} artists so far`))
console.log('')

const draft = await askDraft(db, null)

printDraft(draft)

const newRecords = [
  draft.createdArtists.length === 0 ? null : `${draft.createdArtists.length} artist`,
  draft.createdSongs.length === 0 ? null : '1 song',
  '1 recording',
  '1 post'
].filter((part): part is string => part !== null)
console.log(styles.info('\nTo be appended'))
console.log(styles.light(newRecords.join(', ')))
console.log('')

const confirmed = await confirm({ message: 'Post?', default: true })
if (!confirmed) {
  console.log(styles.warning('Nothing written.'))
  process.exit(0)
}

// The file before the records that name it, for the same reason the records go in this
// order: a crash leaves something unreferenced rather than a reference to nothing.
await storeDraftFile(draft)

// Entities before the post that points at them: a crash between two appends leaves an
// unreferenced song or artist, never a post pointing at a recording that is not there.
await append('artists', draft.createdArtists)
await append('songs', draft.createdSongs)
await append('recordings', [draft.recording])
await append('posts', [draft.post])

console.log('')
console.log(styles.title('Post written.'))
console.log(styles.success(`${db.posts.length + 1} posts in the data`))

printRecords({
  artists: draft.createdArtists,
  songs: draft.createdSongs,
  recordings: [draft.recording],
  posts: [draft.post]
})
console.log('')
