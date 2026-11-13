/**
 * One post's names asked of MusicBrainz, and corrected on the spot.
 *
 * `npm run post:names -- <postId>` goes straight to one; with no argument the posts are
 * listed, most recent first, the way `post:edit` lists them. What gets looked up is every
 * artist the post credits — played by, featuring, remixed by, and the work's original
 * artists — and then the work's title, narrowed by who plays it. Two or three requests,
 * a second apart.
 *
 * Where MusicBrainz spells a name otherwise, the question is which one stays: ours, theirs
 * or one typed by hand. `stop` leaves the rest of the post alone. Nothing is written until
 * every name has been answered and the write confirmed.
 *
 * `data:names` is the same question over every artist at once, from the lookups stored in
 * `.musicbrainz.ndjson`; this one asks live, about the handful of names one post carries,
 * and stores nothing — a name corrected here simply stops matching its stored line, which
 * is what makes `data:names` ask about it again.
 *
 * Slugs are left where they are. A slug is drawn once and belongs to the record, so a name
 * corrected here does not move an address.
 */

import process from 'node:process'
import { confirm, input, select } from '@inquirer/prompts'
import { styles } from '@design-edito/tools/agnostic/misc/logs/styles/index.js'
import type { Artist, Post, Recording, Song } from '../../shared/types/index.js'
import { comparisonKey } from '../_check/index.js'
import { readDb, write, type Db } from '../_db/index.js'
import { describePost } from '../_describe/index.js'
import {
  describeCandidate,
  sameThing,
  searchArtist,
  searchRecording,
  type Candidate
} from '../_musicbrainz/index.js'

const db: Db = await readDb()

console.log('')
console.log(styles.title('Reading a post against MusicBrainz...'))

if (db.posts.length === 0) {
  console.log(styles.warning('No post to read.'))
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

const song: Song | undefined = db.songs.find(candidate => candidate.id === recording.songId)
if (song === undefined) {
  console.log(styles.error(`Recording ${recording.id} points at song ${recording.songId}, which is not in the data.`))
  process.exit(1)
}

const creditedIds = [...new Set([
  ...recording.byArtistIds,
  ...recording.featuringArtistIds,
  ...recording.remixedByArtistIds,
  ...song.originalArtistIds
])]

const credited = creditedIds
  .map(id => db.artists.find(artist => artist.id === id))
  .filter((artist): artist is Artist => artist !== undefined)

const described = describePost(post, db)
console.log('')
console.log(styles.info(described.name))
console.log(styles.light(`> ${described.description}`))
console.log(styles.light(`> ${credited.length} name${credited.length === 1 ? '' : 's'} and one title to ask about`))

const TYPE = 'type a name'
const STOP = 'stop'

/**
 * One name against its candidate: what stays, or nothing when there is no question.
 *
 * `null` is both answers that change nothing — MusicBrainz agreeing, and the walk being
 * stopped — and `stopped` is what tells them apart to the caller.
 */
async function answer (field: string, ours: string, candidate: Candidate | null): Promise<string | null> {
  if (candidate === null) {
    console.log(styles.light(`  ${field}: ${ours}, nothing MusicBrainz answers for`))
    return null
  }
  if (candidate.name === ours) {
    console.log(styles.light(`  ${field}: ${ours}, as MusicBrainz has it`))
    return null
  }
  const told = describeCandidate(candidate)
  console.log('')
  console.log(styles.light(`> ${field}${told === '' ? '' : `, ${told}`}`))
  const answered = await select<string>({
    message: field,
    default: ours,
    choices: [
      { name: ours, value: ours },
      { name: candidate.name, value: candidate.name },
      { name: TYPE, value: TYPE },
      { name: STOP, value: STOP }
    ]
  })
  if (answered === STOP) return STOP
  const named = answered === TYPE
    ? (await input({ message: field, default: ours })).trim()
    : answered
  return named === '' || named === ours ? null : named
}

const renamedArtists = new Map<string, string>()
let retitled: string | null = null
let stopped = false

for (const artist of credited) {
  const candidates = await searchArtist(artist.name)
  const answered = await answer('artist', artist.name, sameThing(artist.name, candidates, comparisonKey))
  if (answered === STOP) { stopped = true; break }
  if (answered !== null) renamedArtists.set(artist.id, answered)
}

if (!stopped) {
  // Narrowed by whoever plays it, under the name that is going to stay: a title alone
  // brings back every cover MusicBrainz holds.
  const first = credited.find(artist => recording.byArtistIds.includes(artist.id)) ?? credited[0]
  const by = first === undefined ? null : renamedArtists.get(first.id) ?? first.name
  const candidates = await searchRecording(song.title, by)
  const answered = await answer('title', song.title, sameThing(song.title, candidates, comparisonKey))
  if (answered === STOP) stopped = true
  else if (answered !== null) retitled = answered
}

if (renamedArtists.size === 0 && retitled === null) {
  console.log('')
  console.log(styles.title('Post read.'))
  console.log(styles.warning('Nothing renamed.'))
  console.log('')
  process.exit(0)
}

console.log('')
console.log(styles.info('Renamed'))
for (const [id, named] of renamedArtists) {
  const artist = db.artists.find(candidate => candidate.id === id)
  console.log(`${styles.light('artist')} ${styles.regular(artist?.name ?? id)} ${styles.important(`→ ${named}`)}`)
}
if (retitled !== null) {
  console.log(`${styles.light('title')} ${styles.regular(song.title)} ${styles.important(`→ ${retitled}`)}`)
}
console.log(styles.light('> slugs are left alone, so no address moves'))

console.log('')
const files = [
  renamedArtists.size === 0 ? null : 'artists.ndjson',
  retitled === null ? null : 'songs.ndjson'
].filter((file): file is string => file !== null)
console.log(styles.danger(`${files.join(' and ')} ${files.length === 1 ? 'is' : 'are'} rewritten whole.`))

if (!await confirm({ message: 'Rename?', default: false })) {
  console.log(styles.warning('Nothing written.'))
  console.log('')
  process.exit(0)
}

if (renamedArtists.size > 0) {
  await write('artists', db.artists.map(artist => {
    const named = renamedArtists.get(artist.id)
    return named === undefined ? artist : { ...artist, name: named }
  }))
}

if (retitled !== null) {
  const title = retitled
  await write('songs', db.songs.map(candidate =>
    candidate.id === song.id ? { ...candidate, title } : candidate))
}

console.log('')
console.log(styles.title('Post read.'))
console.log(styles.success(`${renamedArtists.size + (retitled === null ? 0 : 1)} name${renamedArtists.size + (retitled === null ? 0 : 1) === 1 ? '' : 's'} corrected.`))
console.log('')
