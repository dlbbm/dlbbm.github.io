/**
 * The posts whose names have never been read against MusicBrainz, walked one at a time.
 *
 * It opens on the oldest post carrying no `namesCheckedOn` and shows it; `next` asks
 * MusicBrainz about it, `skip` moves on and leaves it unread, `quit` stops there. What
 * gets looked up is every artist the post credits — played by, featuring, remixed by, and
 * the work's original artists — and then the work's title, narrowed by who plays it. Two
 * or three requests a post, a second apart.
 *
 * Where MusicBrainz spells a name otherwise, the question is which one stays: ours, theirs
 * or one typed by hand. A post is marked read as soon as it has been through, whether or
 * not anything changed — which is what makes the walk resumable without a cursor file: the
 * data says where it got to.
 *
 * `npm run post:names-lookup -- <postId>` reads that one post instead, read already or
 * not, and marks it the same way.
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
import { toTimestamp } from '../_date/index.js'
import { readDb, write, type Db } from '../_db/index.js'
import { describePost } from '../_describe/index.js'
import {
  describeCandidate,
  sameThing,
  searchArtist,
  searchRecording,
  type Candidate
} from '../_musicbrainz/index.js'

let db: Db = await readDb()

console.log('')
console.log(styles.title('Reading the posts against MusicBrainz...'))

if (db.posts.length === 0) {
  console.log(styles.warning('No post to read.'))
  process.exit(0)
}

const [, , askedId] = process.argv

const unread = (): Post[] => db.posts
  .filter(post => post.namesCheckedOn === null)
  .sort((one, other) => one.publishedOn.localeCompare(other.publishedOn))

let walking: Post[]
if (askedId !== undefined) {
  const asked = db.posts.find(candidate => candidate.id === askedId)
  if (asked === undefined) {
    console.log(styles.error(`No post with id ${askedId}.`))
    process.exit(1)
  }
  walking = [asked]
} else {
  walking = unread()
  console.log(styles.light(`> ${walking.length} of ${db.posts.length} posts never read`))
  if (walking.length === 0) {
    console.log('')
    console.log(styles.success('Every post has been through.'))
    console.log('')
    process.exit(0)
  }
}

const TYPE = 'type a name'

/** One name against its candidate: what stays, or `null` when there is no question. */
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
      { name: TYPE, value: TYPE }
    ]
  })
  const named = answered === TYPE
    ? (await input({ message: field, default: ours })).trim()
    : answered
  return named === '' || named === ours ? null : named
}

/** What one post holds that a lookup can answer about: its credits, and the work. */
type Names = { recording: Recording, song: Song, credited: Artist[] }

function namesOf (post: Post): Names | null {
  const recording = db.recordings.find(candidate => candidate.id === post.recordingId)
  if (recording === undefined) {
    console.log(styles.error(`Post ${post.id} points at recording ${post.recordingId}, which is not in the data.`))
    return null
  }
  const song = db.songs.find(candidate => candidate.id === recording.songId)
  if (song === undefined) {
    console.log(styles.error(`Recording ${recording.id} points at song ${recording.songId}, which is not in the data.`))
    return null
  }
  const credited = [...new Set([
    ...recording.byArtistIds,
    ...recording.featuringArtistIds,
    ...recording.remixedByArtistIds,
    ...song.originalArtistIds
  ])]
    .map(id => db.artists.find(artist => artist.id === id))
    .filter((artist): artist is Artist => artist !== undefined)
  return { recording, song, credited }
}

let read = 0
let corrected = 0

for (const [index, post] of walking.entries()) {
  const names = namesOf(post)
  if (names === null) continue
  const { recording, song, credited } = names

  const described = describePost(post, db)
  console.log('')
  console.log(styles.title(`${index + 1} of ${walking.length}`))
  console.log(styles.info(described.name))
  console.log(styles.light(`> ${described.description}`))
  console.log(styles.light(`> ${credited.length} name${credited.length === 1 ? '' : 's'} and one title to ask about`))
  console.log('')

  const action = await select<'next' | 'skip' | 'quit'>({
    message: post.id,
    choices: [
      { name: 'next', value: 'next' },
      { name: 'skip', value: 'skip' },
      { name: 'quit', value: 'quit' }
    ]
  })
  if (action === 'quit') break
  if (action === 'skip') continue

  const renamedArtists = new Map<string, string>()
  for (const artist of credited) {
    const candidates = await searchArtist(artist.name)
    const answered = await answer('artist', artist.name, sameThing(artist.name, candidates, comparisonKey))
    if (answered !== null) renamedArtists.set(artist.id, answered)
  }

  // Narrowed by whoever plays it, under the name that is going to stay: a title alone
  // brings back every cover MusicBrainz holds.
  const first = credited.find(artist => recording.byArtistIds.includes(artist.id)) ?? credited[0]
  const by = first === undefined ? null : renamedArtists.get(first.id) ?? first.name
  const candidates = await searchRecording(song.title, by)
  const retitled = await answer('title', song.title, sameThing(song.title, candidates, comparisonKey))

  let writing = renamedArtists.size > 0 || retitled !== null
  if (writing) {
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
    writing = await confirm({ message: 'Rename?', default: true })
    if (!writing) console.log(styles.warning('Nothing renamed.'))
  }

  if (writing) {
    if (renamedArtists.size > 0) {
      const artists = db.artists.map(artist => {
        const named = renamedArtists.get(artist.id)
        return named === undefined ? artist : { ...artist, name: named }
      })
      await write('artists', artists)
      db = { ...db, artists }
    }
    if (retitled !== null) {
      const title = retitled
      const songs = db.songs.map(candidate =>
        candidate.id === song.id ? { ...candidate, title } : candidate)
      await write('songs', songs)
      db = { ...db, songs }
    }
    corrected += renamedArtists.size + (retitled === null ? 0 : 1)
  }

  // Marked as soon as the post has been through, so the walk resumes here and nowhere
  // else. Answering nothing is also an answer: these names have been read.
  const checkedOn = toTimestamp(new Date())
  const posts = db.posts.map(candidate =>
    candidate.id === post.id ? { ...candidate, namesCheckedOn: checkedOn } : candidate)
  await write('posts', posts)
  db = { ...db, posts }
  read += 1
}

const left = unread().length

console.log('')
console.log(styles.title('Posts read.'))
console.log(styles.light(`> ${read} post${read === 1 ? '' : 's'} through, ${corrected} name${corrected === 1 ? '' : 's'} corrected`))
if (left > 0) console.log(styles.light(`> ${left} left to read`))
else console.log(styles.success('Every post has been through.'))
console.log('')
