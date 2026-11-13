/**
 * One post's names read against MusicBrainz, asked and written.
 *
 * The walk is `post:names-lookup`; `post:create` and `post:edit` offer the same lookup on
 * the post they have just written, so a name is read against the register while the post
 * is still in front of you rather than months later in a sweep. All three come through
 * here, which is why the questions, the confirmation and the mark are in one place.
 *
 * **A name MusicBrainz spells the way this data does is never a question**, which is what
 * lets the walk run on its own: in `auto look up` the names that differ are not asked but
 * written down, in `.names-pending.ndjson`, and the walk carries on to the next post. The
 * run then comes back to them with nothing left to fetch, so the posts that want a
 * decision arrive in one sitting and the hundreds that want nothing are gone.
 *
 * That store is a cache and never the record of anything: `namesCheckedOn` is what says a
 * post has been read, and a post whose questions are pending is still unread. Deleting the
 * file costs the requests that filled it and nothing else.
 *
 * The database is read again on the way in: a caller that has just appended or rewritten
 * lines holds a `Db` from before its own writes, and the lookup rewrites two of the same
 * files.
 */

import { existsSync } from 'node:fs'
import { readFile, writeFile } from 'node:fs/promises'
import { confirm, input, select } from '@inquirer/prompts'
import { styles } from '@design-edito/tools/agnostic/misc/logs/styles/index.js'
import type { Artist, Post, PostId, Recording, Song } from '../../shared/types/index.js'
import { comparisonKey } from '../_check/index.js'
import { NAMES_PENDING_FILE } from '../_config/index.js'
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

/**
 * One name MusicBrainz spells otherwise, and what it belongs to.
 *
 * `targetId` is the record a rename writes to — an artist, or the work whose title it is —
 * and `ours` is the name as it stood when the question was found, which is what makes a
 * stale question recognisable: a name answered since is no longer the one being asked
 * about.
 */
export type Question = {
  postId: PostId
  field: 'artist' | 'title'
  targetId: string
  ours: string
  candidate: Candidate
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

export async function readQuestions (): Promise<Question[]> {
  if (!existsSync(NAMES_PENDING_FILE)) return []
  const raw = await readFile(NAMES_PENDING_FILE, { encoding: 'utf-8' })
  const questions: Question[] = []
  for (const line of raw.split('\n')) {
    const trimmed = line.trim()
    if (trimmed === '') continue
    try { questions.push(JSON.parse(trimmed) as Question) }
    catch { continue }
  }
  return questions
}

async function writeQuestions (questions: Question[]): Promise<void> {
  await writeFile(
    NAMES_PENDING_FILE,
    questions.map(question => JSON.stringify(question)).join('\n') + (questions.length === 0 ? '' : '\n'),
    { encoding: 'utf-8' }
  )
}

/** Asks one name, the two spellings labelled so neither has to be guessed at. */
async function ask (question: Question): Promise<{ nature: 'kept' } | { nature: 'named', name: string } | { nature: 'stopped' }> {
  const told = describeCandidate(question.candidate)
  console.log('')
  console.log(styles.light(`> ${question.field}${told === '' ? '' : `, ${told}`}`))
  const answered = await select<string>({
    message: question.field,
    default: question.ours,
    choices: [
      { name: `${question.ours} (current)`, value: question.ours },
      { name: `${question.candidate.name} (MusicBrainz's)`, value: question.candidate.name },
      { name: TYPE, value: TYPE },
      { name: STOP, value: STOP }
    ]
  })
  if (answered === STOP) return { nature: 'stopped' }
  const named = answered === TYPE
    ? (await input({ message: question.field, default: question.ours })).trim()
    : answered
  return named === '' || named === question.ours ? { nature: 'kept' } : { nature: 'named', name: named }
}

/** The names of one post MusicBrainz spells otherwise, and nothing it agrees on. */
async function questionsOf (names: Names): Promise<Question[]> {
  const { post, recording, song, credited } = names
  const questions: Question[] = []

  for (const artist of credited) {
    const candidates = await searchArtist(artist.name)
    const candidate = sameThing(artist.name, candidates, comparisonKey)
    if (candidate === null) {
      console.log(styles.light(`  artist: ${artist.name}, nothing MusicBrainz answers for`))
      continue
    }
    if (candidate.name === artist.name) {
      console.log(styles.light(`  artist: ${artist.name}, as MusicBrainz has it`))
      continue
    }
    questions.push({ postId: post.id, field: 'artist', targetId: artist.id, ours: artist.name, candidate })
  }

  // Narrowed by whoever plays it: a title alone brings back every cover MusicBrainz holds.
  const first = credited.find(artist => recording.byArtistIds.includes(artist.id)) ?? credited[0]
  const candidates = await searchRecording(song.title, first?.name ?? null)
  const candidate = sameThing(song.title, candidates, comparisonKey)
  if (candidate === null) {
    console.log(styles.light(`  title: ${song.title}, nothing MusicBrainz answers for`))
  } else if (candidate.name === song.title) {
    console.log(styles.light(`  title: ${song.title}, as MusicBrainz has it`))
  } else {
    questions.push({ postId: post.id, field: 'title', targetId: song.id, ours: song.title, candidate })
  }

  return questions
}

/** Marks a post read. Answering nothing is also an answer: these names have been read. */
async function markRead (postId: PostId, db: Db): Promise<void> {
  const checkedOn = toTimestamp(new Date())
  await write('posts', db.posts.map(candidate =>
    candidate.id === postId ? { ...candidate, namesCheckedOn: checkedOn } : candidate))
}

/**
 * Writes the names answered, under one confirmation naming the files it rewrites.
 *
 * Returns whether anything was written: declining is an answer too, and the post is read
 * either way — it was looked at, and the spelling that stays is the one it had.
 */
async function writeNames (renames: Map<string, string>, db: Db): Promise<boolean> {
  const artists = db.artists.filter(artist => renames.has(artist.id))
  const songs = db.songs.filter(song => renames.has(song.id))
  if (artists.length === 0 && songs.length === 0) return false

  console.log('')
  console.log(styles.info('Renamed'))
  for (const artist of artists) {
    console.log(`${styles.light('artist')} ${styles.regular(artist.name)} ${styles.important(`→ ${renames.get(artist.id) ?? ''}`)}`)
  }
  for (const song of songs) {
    console.log(`${styles.light('title')} ${styles.regular(song.title)} ${styles.important(`→ ${renames.get(song.id) ?? ''}`)}`)
  }
  console.log(styles.light('> slugs are left alone, so no address moves'))
  console.log('')
  const files = [
    artists.length === 0 ? null : 'artists.ndjson',
    songs.length === 0 ? null : 'songs.ndjson'
  ].filter((file): file is string => file !== null)
  console.log(styles.danger(`${files.join(' and ')} ${files.length === 1 ? 'is' : 'are'} rewritten whole.`))

  if (!await confirm({ message: 'Rename?', default: true })) {
    console.log(styles.warning('Nothing renamed.'))
    return false
  }

  if (artists.length > 0) {
    await write('artists', db.artists.map(artist => {
      const named = renames.get(artist.id)
      return named === undefined ? artist : { ...artist, name: named }
    }))
  }
  if (songs.length > 0) {
    await write('songs', db.songs.map(song => {
      const named = renames.get(song.id)
      return named === undefined ? song : { ...song, title: named }
    }))
  }
  return true
}

/** How a post's lookup ended. */
export type Looked =
  | { nature: 'read', corrected: number }
  | { nature: 'deferred', questions: number }
  | { nature: 'stopped' }
  | { nature: 'missing' }
  | { nature: 'failed', why: string }

/**
 * The questions MusicBrainz can answer about a post, or why it could not be asked.
 *
 * A request that fails is this post's problem and not the run's: a sweep of 400 posts
 * meets a 503 sooner or later, and one is no reason to end a walk that is unattended by
 * design. The post stays unread, so the next run offers it again.
 */
async function askOrFail (names: Names): Promise<Question[] | { why: string }> {
  try { return await questionsOf(names) }
  catch (error) { return { why: error instanceof Error ? error.message : String(error) } }
}

/**
 * Asks MusicBrainz about one post's names and answers them on the spot.
 *
 * `stop` on any question abandons the post whole — nothing written, no mark — so it comes
 * back intact on the next run.
 */
export async function lookUpNames (postId: PostId): Promise<Looked> {
  const db: Db = await readDb()
  const names = namesOf(postId, db)
  if (names === null) return { nature: 'missing' }

  const asked = await askOrFail(names)
  if ('why' in asked) return { nature: 'failed', why: asked.why }
  const questions = asked
  const renames = new Map<string, string>()
  for (const question of questions) {
    const answered = await ask(question)
    if (answered.nature === 'stopped') return { nature: 'stopped' }
    if (answered.nature === 'named') renames.set(question.targetId, answered.name)
  }

  const written = await writeNames(renames, db)
  await markRead(postId, await readDb())
  return { nature: 'read', corrected: written ? renames.size : 0 }
}

/**
 * Asks MusicBrainz about one post's names and asks nothing of you.
 *
 * A post the register agrees with is read and done with; a post that differs is put in the
 * store for later and left unread, which is what empties the walk of everything that is
 * not a decision.
 */
export async function deferNames (postId: PostId): Promise<Looked> {
  const db: Db = await readDb()
  const names = namesOf(postId, db)
  if (names === null) return { nature: 'missing' }

  const asked = await askOrFail(names)
  if ('why' in asked) return { nature: 'failed', why: asked.why }
  const questions = asked
  if (questions.length === 0) {
    await markRead(postId, db)
    return { nature: 'read', corrected: 0 }
  }

  const stored = (await readQuestions()).filter(question => question.postId !== postId)
  await writeQuestions([...stored, ...questions])
  console.log(styles.warning(`  ${questions.length} name${questions.length === 1 ? '' : 's'} put aside`))
  return { nature: 'deferred', questions: questions.length }
}

/** How answering the store ended, and what it got through. */
export type Answered = {
  posts: number
  corrected: number
  stopped: boolean
}

/**
 * The questions put aside, asked post by post with nothing left to fetch.
 *
 * A question whose `ours` is no longer the record's name is dropped rather than asked: the
 * name was answered elsewhere since, and a question about a spelling that is gone has no
 * answer. Each post is marked read and cleared from the store once it has been through, so
 * `stop` leaves the rest exactly where it was.
 */
export async function answerQuestions (): Promise<Answered> {
  let stored = await readQuestions()
  const answered: Answered = { posts: 0, corrected: 0, stopped: false }
  const postIds = [...new Set(stored.map(question => question.postId))]

  for (const postId of postIds) {
    const db: Db = await readDb()
    const mine = stored.filter(question => question.postId === postId)
    const named = (question: Question): string | null => question.field === 'artist'
      ? db.artists.find(artist => artist.id === question.targetId)?.name ?? null
      : db.songs.find(song => song.id === question.targetId)?.title ?? null
    const live = mine.filter(question => named(question) === question.ours)

    if (live.length > 0) {
      const names = namesOf(postId, db)
      if (names === null) continue
      console.log('')
      console.log(styles.info(`${names.credited.map(artist => artist.name).join(', ')} — ${names.song.title}`))
      console.log(styles.light(`> ${live.length} name${live.length === 1 ? '' : 's'} to answer`))

      const renames = new Map<string, string>()
      let stopped = false
      for (const question of live) {
        const asked = await ask(question)
        if (asked.nature === 'stopped') { stopped = true; break }
        if (asked.nature === 'named') renames.set(question.targetId, asked.name)
      }
      if (stopped) { answered.stopped = true; break }
      if (await writeNames(renames, db)) answered.corrected += renames.size
    }

    await markRead(postId, await readDb())
    stored = stored.filter(question => question.postId !== postId)
    await writeQuestions(stored)
    answered.posts += 1
  }

  return answered
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
  if (looked.nature === 'failed') {
    console.log(styles.warning(`MusicBrainz could not be read: ${looked.why}`))
    console.log(styles.light('> the post is left unread, post:names-lookup offers it again'))
    return
  }
  if (looked.nature !== 'read') return
  console.log('')
  console.log(styles.success(`${looked.corrected} name${looked.corrected === 1 ? '' : 's'} corrected.`))
}
