/**
 * Asks a post again, with every answer prefilled, and replaces the lines it sits on.
 *
 * `npm run post:edit -- <postId>` goes straight to one; with no argument the posts are
 * listed, most recent first. This is the first command that rewrites rather than appends:
 * the recording and the post keep their ids, so their lines are replaced in place, while
 * an artist or a work named for the first time is still appended.
 *
 * Replacing a credit can leave an artist nothing points at any more. That is accepted for
 * now — `data:tidy` is the command that will find them.
 */

import process from 'node:process'
import { confirm, select } from '@inquirer/prompts'
import { styles } from '@design-edito/tools/agnostic/misc/logs/styles/index.js'
import type { Post, Recording } from '../../shared/types/index.js'
import { askDraft, printDraft, printRecords, storeDraftFile } from '../_ask/index.js'
import { append, readDb, write, type Db } from '../_db/index.js'
import { describePost } from '../_describe/index.js'

const db: Db = await readDb()

console.log('')
console.log(styles.title('Editing a post...'))

if (db.posts.length === 0) {
  console.log(styles.warning('No post to edit.'))
  process.exit(0)
}

const [, , askedId] = process.argv

let post: Post | undefined
if (askedId !== undefined) {
  post = db.posts.find(candidate => candidate.id === askedId)
  if (post === undefined) {
    console.log(styles.error(`No post with id ${askedId}.`))
    process.exit(1)
  }
} else {
  console.log('')
  post = await select<Post>({
    message: 'Post',
    choices: [...db.posts]
      .sort((one, other) => other.publishedOn.localeCompare(one.publishedOn))
      .map(candidate => ({ ...describePost(candidate, db), value: candidate }))
  })
}

const recording: Recording | undefined = db.recordings.find(candidate => candidate.id === post.recordingId)
if (recording === undefined) {
  console.log(styles.error(`Post ${post.id} points at recording ${post.recordingId}, which is not in the data.`))
  process.exit(1)
}

console.log('')
const draft = await askDraft(db, { post, recording })

printDraft(draft)

const changes = [
  draft.createdArtists.length === 0 ? null : `${draft.createdArtists.length} artist appended`,
  draft.createdSlugs.length === 0 ? null : `${draft.createdSlugs.length} slug appended`,
  draft.createdSongs.length === 0 ? null : '1 song appended',
  '1 recording rewritten',
  '1 post rewritten'
].filter((part): part is string => part !== null)
console.log(styles.info('\nTo be written'))
console.log(styles.light(changes.join(', ')))
console.log(styles.warning('recordings.ndjson and posts.ndjson are rewritten whole.'))
console.log('')

const confirmed = await confirm({ message: 'Save?', default: true })
if (!confirmed) {
  console.log(styles.warning('Nothing written.'))
  process.exit(0)
}

await storeDraftFile(draft)

// New entities first, so the rewritten lines never point at something not yet on disk.
await append('artists', draft.createdArtists)
await append('slugs', draft.createdSlugs)
await append('songs', draft.createdSongs)
await write('recordings', db.recordings.map(candidate =>
  candidate.id === draft.recording.id ? draft.recording : candidate))
await write('posts', db.posts.map(candidate =>
  candidate.id === draft.post.id ? draft.post : candidate))

console.log('')
console.log(styles.title('Post edited.'))
console.log(styles.success(`${db.posts.length} posts in the data`))

printRecords({
  artists: draft.createdArtists,
  slugs: draft.createdSlugs,
  songs: draft.createdSongs,
  recordings: [draft.recording],
  posts: [draft.post]
})
console.log('')
