/**
 * The questions a post is made of, asked once and shared by every command that needs them.
 *
 * They follow the shape the old blog actually had: a title, an artist, a playable source,
 * and almost always nothing else. Everything the archive leaves blank on 341 posts out of
 * 400 is a question that defaults to nothing. A title is taken exactly as typed: the
 * parenthetical of `Giving My Love (Chevals remix)` is the import's problem, not this one.
 *
 * Editing asks the same questions in the same order, with every answer prefilled from the
 * post being edited — which is why this lives apart from the commands rather than inside
 * the one that came first.
 */

import { existsSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { confirm, input, select } from '@inquirer/prompts'
import { styles } from '@design-edito/tools/agnostic/misc/logs/styles/index.js'
import { mediaServices, recordingKinds } from '../../shared/types/index.js'
import type {
  Artist,
  FileSource,
  MediaService,
  MediaSource,
  PartialDate,
  Place,
  Post,
  Recording,
  RecordingKind,
  Slug,
  Song,
  Timestamp
} from '../../shared/types/index.js'
import { CWD } from '../_config/index.js'
import { createId, storeFile, type Db } from '../_db/index.js'
import {
  formatPartialDate,
  nowAsString,
  parsePartialDate,
  parseTimestamp,
  timestampAsString
} from '../_date/index.js'
import { findArtistById } from '../_describe/index.js'
import { mintSlug } from '../_slug/index.js'

export const CREDIT_SEPARATOR = ';'

// Stands for the free-text answer in the kind choices. A sentinel rather than a string,
// since `RecordingKind` accepts any string and would swallow a marker.
const OTHER_KIND = Symbol('other kind')

// `forms` is echoed back once the host is picked, and says what the prompt will accept.
// YouTube is the one host whose URL is refused when no video id can be read out of it; the
// rest are stored as given. Nothing derives an embed URL here — the component rendering a
// host is the one place that knows how to cut one out of the canonical URL.
const MEDIA_HOSTS: Record<MediaService, {
  hostnames: RegExp[]
  kind: MediaSource['kind']
  forms: string
}> = {
  youtube: {
    hostnames: [/(^|\.)youtube\.com$/, /(^|\.)youtube-nocookie\.com$/, /^youtu\.be$/],
    kind: 'video',
    forms: 'https://www.youtube.com/watch?v=ID · https://youtu.be/ID'
      + ' · https://www.youtube.com/{shorts,embed,live,v}/ID'
  },
  spotify: {
    hostnames: [/(^|\.)spotify\.com$/],
    kind: 'audio',
    forms: 'https://open.spotify.com/{track,album,episode}/ID'
  },
  vimeo: { hostnames: [/(^|\.)vimeo\.com$/], kind: 'video', forms: 'https://vimeo.com/…' },
  soundcloud: { hostnames: [/(^|\.)soundcloud\.com$/], kind: 'audio', forms: 'https://soundcloud.com/…' },
  bandcamp: { hostnames: [/(^|\.)bandcamp\.com$/], kind: 'audio', forms: 'https://<artist>.bandcamp.com/…' },
  mixcloud: { hostnames: [/(^|\.)mixcloud\.com$/], kind: 'audio', forms: 'https://www.mixcloud.com/…' }
}

const FILE_KINDS: Record<string, FileSource['kind']> = {
  '.mp3': 'audio',
  '.m4a': 'audio',
  '.ogg': 'audio',
  '.opus': 'audio',
  '.wav': 'audio',
  '.flac': 'audio',
  '.mp4': 'video',
  '.webm': 'video',
  '.mov': 'video'
}

function youtubeVideoId (url: URL): string | null {
  if (url.hostname === 'youtu.be') {
    const fromPath = url.pathname.slice(1).split('/')[0] ?? ''
    return fromPath === '' ? null : fromPath
  }
  const fromQuery = url.searchParams.get('v')
  if (fromQuery !== null && fromQuery !== '') return fromQuery
  return /^\/(?:shorts|embed|live|v)\/([^/]+)/.exec(url.pathname)?.[1] ?? null
}

function toMediaSource (service: MediaService, raw: string): MediaSource | null {
  let url: URL
  try { url = new URL(raw.trim()) }
  catch { return null }
  const host = MEDIA_HOSTS[service]
  if (!host.hostnames.some(hostname => hostname.test(url.hostname))) return null
  if (service === 'youtube' && youtubeVideoId(url) === null) return null
  return {
    nature: 'media',
    service,
    kind: host.kind,
    url: url.toString()
  }
}

function fileKind (filePath: string): FileSource['kind'] | undefined {
  return FILE_KINDS[path.extname(filePath).toLowerCase()]
}

function splitCredits (raw: string): string[] {
  return raw
    .split(CREDIT_SEPARATOR)
    .map(name => name.trim())
    .filter(name => name !== '')
}

function joinCredits (artists: Artist[]): string {
  return artists.map(artist => artist.name).join(`${CREDIT_SEPARATOR} `)
}

function findArtist (name: string, pool: Artist[]): Artist | undefined {
  const needle = name.trim().toLowerCase()
  return pool.find(artist => artist.name.toLowerCase() === needle
    || artist.nameAliases.some(alias => alias.toLowerCase() === needle))
}

function namesOf (ids: string[], pool: Artist[]): Artist[] {
  return ids
    .map(id => findArtistById(id, pool))
    .filter((artist): artist is Artist => artist !== undefined)
}

async function resolveArtist (name: string, pool: Artist[], created: Artist[]): Promise<Artist> {
  const existing = findArtist(name, pool)
  if (existing !== undefined) {
    console.log(styles.light(`> ${existing.name}, already known`))
    return existing
  }
  const artist: Artist = {
    id: createId(),
    name,
    nameAliases: [],
    sources: []
  }
  pool.push(artist)
  created.push(artist)
  console.log(styles.light(`> ${artist.name}, new`))
  return artist
}

async function askCredits (
  message: string,
  initial: Artist[],
  pool: Artist[],
  created: Artist[],
  required: boolean
): Promise<Artist[]> {
  const answer = await input({
    message,
    default: initial.length === 0 ? undefined : joinCredits(initial),
    validate: value => !required || splitCredits(value).length > 0 || 'An artist is needed.'
  })
  const artists: Artist[] = []
  for (const name of splitCredits(answer)) {
    artists.push(await resolveArtist(name, pool, created))
  }
  return artists
}

function describeSongCredits (song: Song, recordings: Recording[], artists: Artist[]): string {
  const credited = new Set(recordings
    .filter(recording => recording.songId === song.id)
    .flatMap(recording => recording.byArtistIds))
  const names = [...credited].map(id => findArtistById(id, artists)?.name ?? id)
  return names.length === 0 ? 'no recording yet' : names.join(', ')
}

/**
 * The work this recording is a version of.
 *
 * Every work of that title is listed, whoever recorded it — a match under the same artist
 * is no safer a guess than any other, it just comes first in the list.
 */
async function resolveSong (
  title: string,
  mainArtist: Artist,
  songPool: Song[],
  recordingPool: Recording[],
  artistPool: Artist[],
  created: Song[]
): Promise<Song> {
  const needle = title.toLowerCase()
  const candidates = songPool.filter(song => song.title.toLowerCase() === needle
    || song.titleAliases.some(alias => alias.toLowerCase() === needle))

  const byMainArtist = (song: Song): boolean => recordingPool.some(recording =>
    recording.songId === song.id
    && recording.byArtistIds.includes(mainArtist.id))
  const listed = [...candidates].sort((one, other) =>
    Number(byMainArtist(other)) - Number(byMainArtist(one)))

  if (listed.length > 0) {
    const chosen = await select<Song | null>({
      message: 'Song',
      choices: [
        ...listed.map(song => ({
          name: song.title,
          description: `recorded by ${describeSongCredits(song, recordingPool, artistPool)}`,
          value: song as Song | null
        })),
        { name: 'new song', value: null }
      ]
    })
    if (chosen !== null) return chosen
  }

  const song: Song = {
    id: createId(),
    title,
    titleAliases: [],
    originalArtistIds: [],
    sources: []
  }
  songPool.push(song)
  created.push(song)
  return song
}

async function askPlace (initial: Place | null): Promise<Place | null> {
  const venue = (await input({ message: 'Venue', default: initial?.venue ?? undefined })).trim()
  const city = (await input({ message: 'City', default: initial?.city ?? undefined })).trim()
  const country = (await input({ message: 'Country', default: initial?.country ?? undefined })).trim()
  if (venue === '' && city === '' && country === '') return null
  return {
    venue: venue === '' ? null : venue,
    city: city === '' ? null : city,
    country: country === '' ? null : country
  }
}

/** The post being edited, and the recording it is about. */
export type Editing = {
  post: Post
  recording: Recording
}

export type Draft = {
  createdArtists: Artist[]
  createdSlugs: Slug[]
  createdSongs: Song[]
  song: Song
  recording: Recording
  post: Post
  // An absolute path, when the source is a file. Copied once the command is confirmed, and
  // never before: a run that answers no leaves nothing behind.
  fileToStore: string | null
  headline: string
  details: string[]
}

/**
 * Asks for a post, from scratch or from the one being edited.
 *
 * Every answer of an edit is prefilled, ids included: the recording and the post keep
 * theirs, so the lines they sit on are replaced rather than added to. What the questions
 * never touch — `releasedOn`, `durationMs`, a song's aliases and sources — is carried over
 * as it stands.
 */
export async function askDraft (db: Db, editing: Editing | null): Promise<Draft> {
  const createdArtists: Artist[] = []
  const createdSongs: Song[] = []
  const slugPool = [...db.slugs]
  const artistPool = [...db.artists]
  const songPool = [...db.songs]
  const recordingPool = [...db.recordings]

  const editedSong = editing === null
    ? undefined
    : songPool.find(song => song.id === editing.recording.songId)

  const songTitle = (await input({
    message: 'Title',
    default: editedSong?.title,
    validate: value => value.trim() !== '' || 'A title is needed.'
  })).trim()

  const creditedArtists = await askCredits(
    `Artist (separated by ${CREDIT_SEPARATOR})`,
    editing === null ? [] : namesOf(editing.recording.byArtistIds, artistPool),
    artistPool,
    createdArtists,
    true
  )

  // First credit named. It is the one a work is matched against, which is what decides
  // whether this is a cover.
  const mainArtist = creditedArtists[0]
  if (mainArtist === undefined) {
    console.log(styles.error('No artist to credit.'))
    process.exit(1)
  }

  const featuringArtists = await askCredits(
    `Featuring (separated by ${CREDIT_SEPARATOR})`,
    editing === null ? [] : namesOf(editing.recording.featuringArtistIds, artistPool),
    artistPool,
    createdArtists,
    false
  )

  const song = await resolveSong(songTitle, mainArtist, songPool, recordingPool, artistPool, createdSongs)

  const initialKind = editing?.recording.kind ?? null
  const pickedKind = await select<RecordingKind | null | typeof OTHER_KIND>({
    message: 'Recording kind',
    default: initialKind === null
      ? null
      : recordingKinds.find(kind => kind === initialKind) ?? OTHER_KIND,
    choices: [
      { name: 'null', value: null },
      ...recordingKinds.map(kind => ({ name: kind, value: kind as RecordingKind })),
      { name: 'other', value: OTHER_KIND }
    ]
  })

  const recordingKind: RecordingKind | null = pickedKind !== OTHER_KIND
    ? pickedKind
    : (await input({
      message: 'Recording kind',
      default: initialKind ?? undefined,
      validate: value => value.trim() !== '' || 'A kind is needed.'
    })).trim()

  const remixedByArtists = recordingKind !== 'remix'
    ? []
    : await askCredits(
      `Remixed by (separated by ${CREDIT_SEPARATOR})`,
      editing === null ? [] : namesOf(editing.recording.remixedByArtistIds, artistPool),
      artistPool,
      createdArtists,
      false
    )

  // A work states whose song it is once, when it enters the data; an existing one keeps
  // what it says, since nothing here rewrites a song's line.
  const newSong = createdSongs.find(candidate => candidate.id === song.id)
  if (newSong !== undefined) {
    // A live take, a remix, a demo or an alternate take is a version of something by
    // definition, so the question is only worth asking of an unannotated recording.
    const isOriginal = recordingKind === null
      && await confirm({ message: 'Original recording?', default: true })
    const originalArtists = isOriginal
      ? creditedArtists
      : await askCredits(
        `Original artist (separated by ${CREDIT_SEPARATOR})`,
        creditedArtists,
        artistPool,
        createdArtists,
        false
      )
    newSong.originalArtistIds = originalArtists.map(artist => artist.id)
  }

  let performedOn: PartialDate | null = null
  let performedAt: Place | null = null
  if (recordingKind === 'live') {
    const rawPerformedOn = await input({
      message: 'Performed on (YYYY, YYYY-MM or YYYY-MM-DD)',
      default: editing?.recording.performedOn === undefined || editing.recording.performedOn === null
        ? undefined
        : formatPartialDate(editing.recording.performedOn),
      validate: value => value.trim() === '' || parsePartialDate(value) !== null || 'Expected YYYY, YYYY-MM or YYYY-MM-DD.'
    })
    performedOn = rawPerformedOn.trim() === '' ? null : parsePartialDate(rawPerformedOn)
    performedAt = await askPlace(editing?.recording.performedAt ?? null)
  }

  const initialSource = editing?.recording.sources.find(candidate =>
    candidate.nature === 'media' || candidate.nature === 'file')
  const sourceNature = await select<MediaService | 'file' | null>({
    message: 'Source',
    default: initialSource === undefined
      ? null
      : initialSource.nature === 'file' ? 'file' : initialSource.service,
    choices: [
      { name: 'null', value: null },
      ...mediaServices.map(service => ({ name: service, value: service as MediaService })),
      { name: 'file', value: 'file' as const }
    ]
  })

  let source: MediaSource | FileSource | null = null
  let fileToStore: string | null = null
  if (sourceNature === 'file') {
    console.log(styles.light(`> ${Object.keys(FILE_KINDS).join(' ')}`))
    const answer = await input({
      message: 'File path',
      default: initialSource?.nature === 'file' ? initialSource.path : undefined,
      validate: value => {
        const given = path.resolve(CWD, value.trim())
        if (fileKind(given) === undefined) return `Expected a path ending in ${Object.keys(FILE_KINDS).join(', ')}.`
        return existsSync(given) || `${given} is not on disk.`
      }
    })
    fileToStore = path.resolve(CWD, answer.trim())
    const kind = fileKind(fileToStore)
    if (kind === undefined) {
      console.log(styles.error('Could not tell audio from video for that file.'))
      process.exit(1)
    }
    // The stored path is known once the file is copied, which only happens on confirmation.
    source = { nature: 'file', kind, path: '' }
  } else if (sourceNature !== null) {
    console.log(styles.light(`> ${MEDIA_HOSTS[sourceNature].forms}`))
    source = toMediaSource(sourceNature, await input({
      message: 'Source URL',
      default: initialSource?.nature === 'media' ? initialSource.url : undefined,
      validate: value => toMediaSource(sourceNature, value) !== null
        || `Expected a ${sourceNature} URL.`
    }))
  }

  if (source !== null && source.nature === 'media') {
    console.log(styles.light(`> ${source.kind} · ${source.service}`))
  }
  if (source !== null && source.nature === 'file') {
    console.log(styles.light(`> ${source.kind} · to be copied into data/files`))
  }

  const rawPublishedOn = await input({
    message: 'Published on (YYYY-MM-DD HH:MM)',
    default: editing === null ? nowAsString() : timestampAsString(editing.post.publishedOn),
    validate: value => parseTimestamp(value) !== null || 'Expected a complete YYYY-MM-DD HH:MM.'
  })

  const publishedOn = parseTimestamp(rawPublishedOn)
  if (publishedOn === null) {
    console.log(styles.error('Could not read that date.'))
    process.exit(1)
  }

  // One line, because almost every post is only its title. A tracklist or anything else
  // that wants several is a hand edit on the record afterwards, which is how this database
  // is corrected anyway.
  const rawBody = await input({
    message: 'body',
    default: editing?.post.body ?? ''
  })
  const body = rawBody.trim() === '' ? null : rawBody.trim()

  // Hiding a post is a thing one does to a post that exists, so the question is the one
  // the create flow does not ask.
  const hidden = editing === null
    ? false
    : await confirm({ message: 'Hidden?', default: editing.post.hidden })

  const recording: Recording = {
    id: editing?.recording.id ?? createId(),
    songId: song.id,
    kind: recordingKind,
    byArtistIds: creditedArtists.map(artist => artist.id),
    featuringArtistIds: featuringArtists.map(artist => artist.id),
    remixedByArtistIds: remixedByArtists.map(artist => artist.id),
    performedOn,
    performedAt,
    releasedOn: editing?.recording.releasedOn ?? null,
    durationMs: editing?.recording.durationMs ?? null,
    sources: source === null ? [] : [source]
  }

  const post: Post = {
    id: editing?.post.id ?? createId(),
    publishedOn,
    hidden,
    recordingId: recording.id,
    body
  }

  // Every artist named for the first time gets its URL now, so nothing addressable ever
  // reaches the data without one.
  const createdSlugs = createdArtists.map(artist =>
    mintSlug('artist', artist.id, artist.name, slugPool))

  const featuring = featuringArtists.length === 0
    ? ''
    : ` (ft. ${featuringArtists.map(artist => artist.name).join(', ')})`
  const details = [
    `published on ${publishedOn}`,
    hidden ? 'hidden' : null,
    recordingKind,
    remixedByArtists.length === 0 ? null : `remixed by ${remixedByArtists.map(artist => artist.name).join(', ')}`,
    newSong === undefined
      ? null
      : `originally ${namesOf(newSong.originalArtistIds, artistPool).map(artist => artist.name).join(', ') || 'unclaimed'}`,
    performedOn === null ? null : `played ${formatPartialDate(performedOn)}`,
    performedAt === null
      ? null
      : `at ${[performedAt.venue, performedAt.city, performedAt.country].filter(part => part !== null).join(', ')}`,
    source === null ? 'null' : source.nature === 'file' ? fileToStore : source.url
  ].filter((line): line is string => line !== null)

  return {
    createdArtists,
    createdSlugs,
    createdSongs,
    song,
    recording,
    post,
    fileToStore,
    headline: `${creditedArtists.map(artist => artist.name).join(', ')}${featuring} — ${song.title}`,
    details
  }
}

/** The recap a command prints before asking for confirmation. */
export function printDraft (draft: Draft): void {
  console.log(styles.info('\nPost'))
  console.log(styles.important(draft.headline))
  for (const line of draft.details) { console.log(styles.light(line)) }
}

/**
 * Copies the draft's file into the data directory, if it has one.
 *
 * The recording's source object is the one filled in here, which is what gets written when
 * the records go out.
 */
export async function storeDraftFile (draft: Draft): Promise<void> {
  if (draft.fileToStore === null) return
  const source = draft.recording.sources.find(candidate => candidate.nature === 'file')
  if (source === undefined || source.nature !== 'file') return
  source.path = await storeFile(draft.fileToStore)
  console.log(styles.light(`> ${source.path}`))
}

/** Every record a command wrote, printed indented — the files hold one per line. */
export function printRecords (records: Record<string, object[]>): void {
  for (const [collection, written] of Object.entries(records)) {
    if (written.length === 0) continue
    console.log(styles.info(`\n${collection}`))
    for (const record of written) { console.log(styles.regular(JSON.stringify(record, null, 2))) }
  }
}
