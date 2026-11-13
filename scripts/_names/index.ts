/**
 * One post's names read against MusicBrainz, asked and written.
 *
 * The walk is `post:names-lookup`; `post:create` and `post:edit` offer the same lookup on
 * the post they have just written, so a name is read against the register while the post
 * is still in front of you rather than months later in a sweep. All three come through
 * here, which is why the questions, the confirmation and the mark are in one place.
 *
 * The database is read again on the way in: a caller that has just appended or rewritten
 * lines holds a `Db` from before its own writes, and the lookup rewrites two of the same
 * files.
 */

import { confirm, input, select } from '@inquirer/prompts'
import { styles } from '@design-edito/tools/agnostic/misc/logs/styles/index.js'
import type { Artist, Post, PostId, Recording, Song } from '../../shared/types/index.js'
import { comparisonKey } from '../_check/index.js'
import { toTimestamp } from '../_date/index.js'
import { readDb, write, type Db } from '../_db/index.js'
import {
  describeCandidate,
  sameThing,
  searchArtist,
  searchRecording,
  type Candidate
} from '../_musicbrainz/index.js'

const TYPE = 'type a name'
const STOP = 'stop'

/** What one name came back as: nothing to change, a new spelling, or the end of the run. */
type Answer =
  | { nature: 'kept' }
  | { nature: 'named', name: string }
  | { nature: 'stopped' }

const KEPT: Answer = { nature: 'kept' }

/**
 * One name against its candidate.
 *
 * Nothing is asked when MusicBrainz agrees or answers nothing: a name the register spells
 * the way this data does is not a decision, and printing it is all it is worth. That is
 * what lets a caller walk post after post unattended and stop only where a name differs.
 */
async function answer (field: string, ours: string, candidate: Candidate | null): Promise<Answer> {
  if (candidate === null) {
    console.log(styles.light(`  ${field}: ${ours}, nothing MusicBrainz answers for`))
    return KEPT
  }
  if (candidate.name === ours) {
    console.log(styles.light(`  ${field}: ${ours}, as MusicBrainz has it`))
    return KEPT
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
  if (answered === STOP) return { nature: 'stopped' }
  const named = answered === TYPE
    ? (await input({ message: field, default: ours })).trim()
    : answered
  return named === '' || named === ours ? KEPT : { nature: 'named', name: named }
}

/** What one post holds that a lookup can answer about: its credits, and the work. */
export type Names = {
  post: Post
  recording: Recording
  song: Song
  credited: Artist[]
}

/** Everything a post's lookup reads, or `null` once it has said what is missing. */
export function namesOf (postId: PostId, db: Db): Names | null {
  const post = db.posts.find(candidate => candidate.id === postId)
  if (post === undefined) {
    console.log(styles.error(`No post with id ${postId}.`))
    return null
  }
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
  return { post, recording, song, credited }
}

/** How a post's lookup ended: read through, stopped on a name, or never readable. */
export type Looked =
  | { nature: 'read', corrected: number }
  | { nature: 'stopped' }
  | { nature: 'missing' }

/**
 * Asks MusicBrainz about one post's names, writes what is answered, and marks the post.
 *
 * The mark goes on whether or not anything changed: answering nothing is also an answer,
 * these names have been read. `stop` on any of its questions abandons the post whole —
 * nothing written, no mark — so it comes back intact on the next run.
 */
export async function lookUpNames (postId: PostId): Promise<Looked> {
  const db: Db = await readDb()
  const names = namesOf(postId, db)
  if (names === null) return { nature: 'missing' }
  const { post, recording, song, credited } = names

  const renamedArtists = new Map<string, string>()
  for (const artist of credited) {
    const candidates = await searchArtist(artist.name)
    const answered = await answer('artist', artist.name, sameThing(artist.name, candidates, comparisonKey))
    if (answered.nature === 'stopped') return { nature: 'stopped' }
    if (answered.nature === 'named') renamedArtists.set(artist.id, answered.name)
  }

  // Narrowed by whoever plays it, under the name that is going to stay: a title alone
  // brings back every cover MusicBrainz holds.
  const first = credited.find(artist => recording.byArtistIds.includes(artist.id)) ?? credited[0]
  const by = first === undefined ? null : renamedArtists.get(first.id) ?? first.name
  const candidates = await searchRecording(song.title, by)
  const answered = await answer('title', song.title, sameThing(song.title, candidates, comparisonKey))
  if (answered.nature === 'stopped') return { nature: 'stopped' }
  const retitled = answered.nature === 'named' ? answered.name : null

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
      await write('artists', db.artists.map(artist => {
        const named = renamedArtists.get(artist.id)
        return named === undefined ? artist : { ...artist, name: named }
      }))
    }
    if (retitled !== null) {
      await write('songs', db.songs.map(candidate =>
        candidate.id === song.id ? { ...candidate, title: retitled } : candidate))
    }
  }

  const checkedOn = toTimestamp(new Date())
  await write('posts', db.posts.map(candidate =>
    candidate.id === post.id ? { ...candidate, namesCheckedOn: checkedOn } : candidate))

  return { nature: 'read', corrected: writing ? renamedArtists.size + (retitled === null ? 0 : 1) : 0 }
}

/**
 * The lookup as the commands that write a post offer it: a question, then the names.
 *
 * Declining is silent and leaves `namesCheckedOn` null, which is what puts the post in
 * front of the walk later.
 */
export async function offerLookUp (postId: PostId): Promise<void> {
  console.log('')
  if (!await confirm({ message: 'Look the names up?', default: true })) return
  const looked = await lookUpNames(postId)
  if (looked.nature !== 'read') return
  console.log('')
  console.log(styles.success(`${looked.corrected} name${looked.corrected === 1 ? '' : 's'} corrected.`))
}
