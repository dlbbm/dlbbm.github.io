/**
 * Removes a post and the take it was made of, and names what that leaves behind.
 *
 * `npm run post:delete -- <postId>` goes straight to one; with no argument the posts are
 * listed, most recent first. The recording goes with the post, since nothing else points
 * at it — but a work, an artist, a slug or a stored file can survive the only post that
 * named it, and those are reported rather than deleted: sweeping them is what
 * `data:list-orphans` is for.
 */

import process from 'node:process'
import { confirm, select } from '@inquirer/prompts'
import { styles } from '@design-edito/tools/agnostic/misc/logs/styles/index.js'
import type { ArtistId, Post, Recording } from '../../shared/types/index.js'
import { printRecords } from '../_ask/index.js'
import { readDb, write, type Db } from '../_db/index.js'
import { describeArtist, describePost, describeSong, findArtistById } from '../_describe/index.js'

const db: Db = await readDb()

console.log('')
console.log(styles.title('Deleting a post...'))

if (db.posts.length === 0) {
  console.log(styles.warning('No post to delete.'))
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

const posts = db.posts.filter(candidate => candidate.id !== post.id)
const keptByAnother = posts.some(candidate => candidate.recordingId === post.recordingId)
const dropsRecording = recording !== undefined && !keptByAnother
const recordings = dropsRecording
  ? db.recordings.filter(candidate => candidate.id !== post.recordingId)
  : db.recordings

const described = describePost(post, db)
console.log(styles.info('\nTo be deleted'))
console.log(styles.important(described.name))
console.log(styles.light(described.description))
printRecords({
  posts: [post],
  recordings: dropsRecording && recording !== undefined ? [recording] : []
})

if (recording === undefined) {
  console.log(styles.warning(`\nIt points at recording ${post.recordingId}, which is not in the data.`))
}
if (keptByAnother) {
  console.log(styles.warning(`\nRecording ${post.recordingId} is kept — another post names it.`))
}

function isPointedAt (artistId: ArtistId, pool: Recording[]): boolean {
  const credited = pool.some(candidate =>
    candidate.byArtistIds.includes(artistId)
    || candidate.featuringArtistIds.includes(artistId)
    || candidate.remixedByArtistIds.includes(artistId))
  return credited
    || db.songs.some(song => song.originalArtistIds.includes(artistId))
}

const orphanedSongs = db.songs.filter(song =>
  db.recordings.some(candidate => candidate.songId === song.id)
  && !recordings.some(candidate => candidate.songId === song.id))

const credits: ArtistId[] = recording === undefined
  ? []
  : [...recording.byArtistIds, ...recording.featuringArtistIds, ...recording.remixedByArtistIds]
const orphanedArtists = [...new Set(credits)]
  .filter(artistId => !isPointedAt(artistId, recordings))
  .flatMap(artistId => findArtistById(artistId, db.artists) ?? [])

const orphanedSlugs = db.slugs.filter(slug =>
  slug.kind === 'artist' && orphanedArtists.some(artist => artist.id === slug.targetId))

// A stored file is named after its contents, so two recordings can share one path: it is
// only stranded once nothing left on disk points at it.
const strandedFiles = (dropsRecording && recording !== undefined ? recording.sources : [])
  .flatMap(source => source.nature === 'file' ? [source.path] : [])
  .filter(stored => recordings.every(candidate =>
    candidate.sources.every(source => source.nature !== 'file' || source.path !== stored)))

const leftovers = orphanedSongs.length + orphanedArtists.length + orphanedSlugs.length + strandedFiles.length
if (leftovers > 0) {
  console.log(styles.warning('\nLeft behind, and not deleted'))
  for (const song of orphanedSongs) {
    console.log(styles.light(`> song ${song.id} — ${describeSong(song, db).name}`))
  }
  for (const artist of orphanedArtists) {
    console.log(styles.light(`> artist ${artist.id} — ${describeArtist(artist, db).name}`))
  }
  for (const slug of orphanedSlugs) {
    console.log(styles.light(`> slug ${slug.kind}/${slug.slug}`))
  }
  for (const stored of strandedFiles) {
    console.log(styles.light(`> file ${stored}`))
  }
}

console.log('')
console.log(styles.danger(dropsRecording
  ? 'posts.ndjson and recordings.ndjson are rewritten whole.'
  : 'posts.ndjson is rewritten whole.'))

const confirmed = await confirm({ message: 'Delete?', default: false })
if (!confirmed) {
  console.log(styles.warning('Nothing written.'))
  process.exit(0)
}

// The post first, so nothing is ever left pointing at a recording that has gone.
await write('posts', posts)
if (dropsRecording) await write('recordings', recordings)

console.log('')
console.log(styles.title('Post deleted.'))
console.log(styles.success(`${posts.length} posts in the data`))
console.log('')
