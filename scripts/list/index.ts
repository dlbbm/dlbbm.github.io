/**
 * Shows what is in the data, one line per record.
 *
 * `npm run list` goes through every collection; `npm run list:posts` and its siblings take
 * one. The id comes first because it is what `post:edit` takes as an argument.
 */

import process from 'node:process'
import { styles } from '@design-edito/tools/agnostic/misc/logs/styles/index.js'
import {
  describeArtist,
  describePost,
  describeRecording,
  describeSong,
  type Described
} from '../_describe/index.js'
import { readDb, type Db, type DbCollection } from '../_db/index.js'

const describers: Record<DbCollection, (db: Db) => Array<{ id: string } & Described>> = {
  posts: db => [...db.posts]
    .sort((one, other) => other.publishedOn.localeCompare(one.publishedOn))
    .map(post => ({ id: post.id, ...describePost(post, db) })),
  recordings: db => db.recordings.map(recording => ({ id: recording.id, ...describeRecording(recording, db) })),
  songs: db => db.songs.map(song => ({ id: song.id, ...describeSong(song, db) })),
  artists: db => db.artists.map(artist => ({ id: artist.id, ...describeArtist(artist, db) }))
}

const collections = Object.keys(describers) as DbCollection[]

const [, , asked] = process.argv
if (asked !== undefined && !collections.includes(asked as DbCollection)) {
  console.log('')
  console.log(styles.error(`No collection called ${asked}.`))
  console.log(styles.light(`> one of ${collections.join(', ')}, or none for all of them`))
  process.exit(1)
}

const db: Db = await readDb()
const listed = asked === undefined ? collections : [asked as DbCollection]

for (const collection of listed) {
  const rows = describers[collection](db)
  console.log(styles.info(`\n${collection}`))
  if (rows.length === 0) { console.log(styles.light('> empty')) }
  for (const row of rows) {
    console.log(`${styles.light(row.id)} ${row.name}`)
    if (row.description !== '') { console.log(styles.light(`  ${row.description}`)) }
  }
}
console.log('')
