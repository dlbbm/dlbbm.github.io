/**
 * Writes one post into the database, by asking for it.
 *
 * The questions follow the shape the old blog actually had: a title, an artist, a playable
 * source, and almost always nothing else. Everything the archive leaves blank on 341 posts
 * out of 400 is a question that defaults to nothing. A title is taken exactly as typed: the
 * parenthetical of `Giving My Love (Chevals remix)` is the import's problem, not this one.
 */

import { existsSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { confirm, input, select } from '@inquirer/prompts'
import { styles } from '@design-edito/tools/agnostic/misc/logs/styles/index.js'
import { mediaServices, recordingKinds } from '../../types.js'
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
  Song,
  Timestamp
} from '../../types.js'
import { CWD } from '../_config/index.js'
import { append, createId, readDb, storeFile, type Db } from '../_db/index.js'

// Month and day are accepted unpadded — `1986-4-6` is the sixth of April — since every
// one of them is parsed into a number anyway.
const PARTIAL_DATE = /^(\d{4})(?:-(\d{1,2})(?:-(\d{1,2}))?)?$/
const TIMESTAMP = /^(\d{4})-(\d{1,2})-(\d{1,2})[ T](\d{1,2}):(\d{1,2})(?::(\d{1,2}))?$/
const CREDIT_SEPARATOR = ';'

// Stands for the free-text answer in the kind choices. A sentinel rather than a string,
// since `RecordingKind` accepts any string and would swallow a marker.
const OTHER_KIND = Symbol('other kind')

const MEDIA_HOSTS: Record<MediaService, {
  hostnames: RegExp[]
  kind: MediaSource['kind']
}> = {
  youtube: {
    hostnames: [/(^|\.)youtube\.com$/, /(^|\.)youtube-nocookie\.com$/, /^youtu\.be$/],
    kind: 'video'
  },
  spotify: { hostnames: [/(^|\.)spotify\.com$/], kind: 'audio' },
  vimeo: { hostnames: [/(^|\.)vimeo\.com$/], kind: 'video' },
  soundcloud: { hostnames: [/(^|\.)soundcloud\.com$/], kind: 'audio' },
  grooveshark: { hostnames: [/(^|\.)grooveshark\.com$/], kind: 'audio' },
  bandcamp: { hostnames: [/(^|\.)bandcamp\.com$/], kind: 'audio' },
  mixcloud: { hostnames: [/(^|\.)mixcloud\.com$/], kind: 'audio' },
  soundowl: { hostnames: [/(^|\.)soundowl\.com$/], kind: 'audio' }
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

function parsePartialDate (raw: string): PartialDate | null {
  const match = PARTIAL_DATE.exec(raw.trim())
  if (match === null) return null
  const [, rawYear, rawMonth, rawDay] = match
  const year = rawYear === undefined ? null : Number.parseInt(rawYear, 10)
  const month = rawMonth === undefined ? null : Number.parseInt(rawMonth, 10)
  const day = rawDay === undefined ? null : Number.parseInt(rawDay, 10)
  if (month !== null && (month < 1 || month > 12)) return null
  if (day !== null && (day < 1 || day > 31)) return null
  return { year, month, day }
}

function formatPartialDate (date: PartialDate): string {
  const parts = [
    date.year === null ? null : `${date.year}`.padStart(4, '0'),
    date.month === null ? null : `${date.month}`.padStart(2, '0'),
    date.day === null ? null : `${date.day}`.padStart(2, '0')
  ].filter((part): part is string => part !== null)
  return parts.length === 0 ? 'unknown' : parts.join('-')
}

function pad (value: number, width = 2): string {
  return `${value}`.padStart(width, '0')
}

function nowAsString (): string {
  const now = new Date()
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
    + ` ${pad(now.getHours())}:${pad(now.getMinutes())}`
}

/**
 * The moment the answer names, in this machine's timezone.
 *
 * `null` on anything incomplete or impossible: a `Timestamp` is the one date here that
 * cannot be vague. The round-trip through `Date` is what rejects 31 February, and reading
 * the offset off that same date is what gets summer time right.
 */
function parseTimestamp (raw: string): Timestamp | null {
  const match = TIMESTAMP.exec(raw.trim())
  if (match === null) return null
  const [year, month, day, hour, minute, second] = match
    .slice(1)
    .map(part => part === undefined ? 0 : Number.parseInt(part, 10))
  if (year === undefined || month === undefined || day === undefined) return null
  if (hour === undefined || minute === undefined || second === undefined) return null
  const date = new Date(year, month - 1, day, hour, minute, second)
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null
  if (date.getHours() !== hour || date.getMinutes() !== minute) return null
  const offset = -date.getTimezoneOffset()
  const sign = offset < 0 ? '-' : '+'
  return `${pad(year, 4)}-${pad(month)}-${pad(day)}`
    + `T${pad(hour)}:${pad(minute)}:${pad(second)}`
    + `${sign}${pad(Math.floor(Math.abs(offset) / 60))}:${pad(Math.abs(offset) % 60)}`
}

function toEmbedUrl (service: MediaService, url: URL): string | null {
  if (service === 'youtube') {
    const videoId = url.hostname === 'youtu.be'
      ? url.pathname.slice(1)
      : url.searchParams.get('v')
    if (videoId === null || videoId === '') return null
    return `https://www.youtube.com/embed/${videoId}`
  }
  if (service === 'spotify') {
    const match = /^\/(track|album|episode)\/([A-Za-z0-9]+)/.exec(url.pathname)
    if (match === null) return null
    return `https://open.spotify.com/embed/${match[1]}/${match[2]}`
  }
  return null
}

function toMediaSource (service: MediaService, raw: string): MediaSource | null {
  let url: URL
  try { url = new URL(raw.trim()) }
  catch { return null }
  const host = MEDIA_HOSTS[service]
  if (!host.hostnames.some(hostname => hostname.test(url.hostname))) return null
  return {
    nature: 'media',
    service,
    kind: host.kind,
    url: url.toString(),
    embedUrl: toEmbedUrl(service, url)
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

function findArtist (name: string, pool: Artist[]): Artist | undefined {
  const needle = name.trim().toLowerCase()
  return pool.find(artist => artist.name.toLowerCase() === needle
    || artist.nameAliases.some(alias => alias.toLowerCase() === needle))
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

function describeSongCredits (song: Song, recordings: Recording[], artists: Artist[]): string {
  const credited = new Set(recordings
    .filter(recording => recording.songId === song.id)
    .flatMap(recording => recording.byArtistIds))
  const names = [...credited].map(id => findArtistById(id, artists)?.name ?? id)
  return names.length === 0 ? 'no recording yet' : names.join(', ')
}

function findArtistById (id: string, pool: Artist[]): Artist | undefined {
  return pool.find(artist => artist.id === id)
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
    firstRecordingId: null,
    sources: []
  }
  songPool.push(song)
  created.push(song)
  return song
}

async function askPlace (): Promise<Place | null> {
  const venue = (await input({ message: 'Venue' })).trim()
  const city = (await input({ message: 'City' })).trim()
  const country = (await input({ message: 'Country' })).trim()
  if (venue === '' && city === '' && country === '') return null
  return {
    venue: venue === '' ? null : venue,
    city: city === '' ? null : city,
    country: country === '' ? null : country
  }
}

/* * * * * * * * * * * * * * * * * * * * * * * * * * *
 *
 * Read what is already there
 *
 * * * * * * * * * * * * * * * * * * * * * * * * * * */

const db: Db = await readDb()

console.log('')
console.log(styles.title('Writing a post...'))
console.log(styles.light(`> ${db.posts.length} posts, ${db.songs.length} songs, ${db.artists.length} artists so far`))
console.log('')

const created: {
  artists: Artist[]
  songs: Song[]
  recordings: Recording[]
  posts: Post[]
} = { artists: [], songs: [], recordings: [], posts: [] }

const artistPool = [...db.artists]
const songPool = [...db.songs]
const recordingPool = [...db.recordings]

/* * * * * * * * * * * * * * * * * * * * * * * * * * *
 *
 * The title, then the artist
 *
 * * * * * * * * * * * * * * * * * * * * * * * * * * */

const songTitle = (await input({
  message: 'Title',
  validate: value => value.trim() !== '' || 'A title is needed.'
})).trim()

const creditNames = splitCredits(await input({
  message: `Artist (separated by ${CREDIT_SEPARATOR})`,
  validate: value => splitCredits(value).length > 0 || 'An artist is needed.'
}))
const creditedArtists: Artist[] = []
for (const name of creditNames) {
  creditedArtists.push(await resolveArtist(name, artistPool, created.artists))
}

// First credit named. It is the one a work is matched against, which is what decides
// whether this is a cover.
const mainArtist = creditedArtists[0]
if (mainArtist === undefined) {
  console.log(styles.error('No artist to credit.'))
  process.exit(1)
}

const featuringNames = splitCredits(await input({
  message: `Featuring (separated by ${CREDIT_SEPARATOR})`
}))
const featuringArtists: Artist[] = []
for (const name of featuringNames) {
  featuringArtists.push(await resolveArtist(name, artistPool, created.artists))
}

const song = await resolveSong(songTitle, mainArtist, songPool, recordingPool, artistPool, created.songs)

/* * * * * * * * * * * * * * * * * * * * * * * * * * *
 *
 * What kind of take this is
 *
 * * * * * * * * * * * * * * * * * * * * * * * * * * */

const pickedKind = await select<RecordingKind | null | typeof OTHER_KIND>({
  message: 'Recording kind',
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
    validate: value => value.trim() !== '' || 'A kind is needed.'
  })).trim()

const remixedByArtists: Artist[] = []
if (recordingKind === 'remix') {
  const names = splitCredits(await input({
    message: `Remixed by (separated by ${CREDIT_SEPARATOR})`
  }))
  for (const name of names) {
    remixedByArtists.push(await resolveArtist(name, artistPool, created.artists))
  }
}

let performedOn: PartialDate | null = null
let performedAt: Place | null = null
if (recordingKind === 'live') {
  const rawPerformedOn = await input({
    message: 'Performed on (YYYY, YYYY-MM or YYYY-MM-DD)',
    validate: value => value.trim() === '' || parsePartialDate(value) !== null || 'Expected YYYY, YYYY-MM or YYYY-MM-DD.'
  })
  performedOn = rawPerformedOn.trim() === '' ? null : parsePartialDate(rawPerformedOn)
  performedAt = await askPlace()
}

/* * * * * * * * * * * * * * * * * * * * * * * * * * *
 *
 * Where to hear it
 *
 * * * * * * * * * * * * * * * * * * * * * * * * * * */

const sourceNature = await select<MediaService | 'file' | null>({
  message: 'Source',
  choices: [
    { name: 'null', value: null },
    ...mediaServices.map(service => ({ name: service, value: service as MediaService })),
    { name: 'file', value: 'file' as const }
  ]
})

let source: MediaSource | FileSource | null = null
// Where the file came from, kept until the post is confirmed: nothing is copied into the
// repository for a run that ends up answering no.
let fileToStore: string | null = null
if (sourceNature === 'file') {
  const answer = await input({
    message: 'File path',
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
  source = toMediaSource(sourceNature, await input({
    message: 'Source URL',
    validate: value => toMediaSource(sourceNature, value) !== null
      || `Expected a ${sourceNature} URL.`
  }))
}

if (source !== null && source.nature === 'media') {
  console.log(styles.light(`> ${source.kind} · ${source.embedUrl ?? 'no embedUrl'}`))
}
if (source !== null && source.nature === 'file') {
  console.log(styles.light(`> ${source.kind} · to be copied into data/files`))
}

/* * * * * * * * * * * * * * * * * * * * * * * * * * *
 *
 * When it goes out
 *
 * * * * * * * * * * * * * * * * * * * * * * * * * * */

const rawPublishedOn = await input({
  message: 'Published on (YYYY-MM-DD HH:MM)',
  default: nowAsString(),
  validate: value => parseTimestamp(value) !== null || 'Expected a complete YYYY-MM-DD HH:MM.'
})

const publishedOn = parseTimestamp(rawPublishedOn)
if (publishedOn === null) {
  console.log(styles.error('Could not read that date.'))
  process.exit(1)
}

/* * * * * * * * * * * * * * * * * * * * * * * * * * *
 *
 * Assemble
 *
 * * * * * * * * * * * * * * * * * * * * * * * * * * */

const recording: Recording = {
  id: createId(),
  songId: song.id,
  kind: recordingKind,
  byArtistIds: creditedArtists.map(artist => artist.id),
  featuringArtistIds: featuringArtists.map(artist => artist.id),
  remixedByArtistIds: remixedByArtists.map(artist => artist.id),
  performedOn,
  performedAt,
  releasedOn: null,
  durationMs: null,
  sources: source === null ? [] : [source]
}
created.recordings.push(recording)

// A work learns its earliest recording from the first one written for it; an existing work
// keeps whatever it already points at, since nothing here rewrites a line.
const newSong = created.songs.find(candidate => candidate.id === song.id)
if (newSong !== undefined) { newSong.firstRecordingId = recording.id }

const post: Post = {
  id: createId(),
  publishedOn,
  recordingId: recording.id
}
created.posts.push(post)

/* * * * * * * * * * * * * * * * * * * * * * * * * * *
 *
 * Read it back, then write it
 *
 * * * * * * * * * * * * * * * * * * * * * * * * * * */

const credits = creditedArtists.map(artist => artist.name).join(', ')
const featuring = featuringArtists.length === 0
  ? ''
  : ` (ft. ${featuringArtists.map(artist => artist.name).join(', ')})`

console.log(styles.info('\nPost'))
console.log(styles.important(`${credits}${featuring} — ${song.title}`))
console.log(styles.light(`published on ${publishedOn}`))
if (recordingKind !== null) console.log(styles.light(recordingKind))
if (remixedByArtists.length > 0) console.log(styles.light(`remixed by ${remixedByArtists.map(artist => artist.name).join(', ')}`))
if (performedOn !== null) console.log(styles.light(`played ${formatPartialDate(performedOn)}`))
if (performedAt !== null) {
  const place = [performedAt.venue, performedAt.city, performedAt.country]
    .filter((part): part is string => part !== null)
    .join(', ')
  console.log(styles.light(`at ${place}`))
}
console.log(styles.light(source === null ? 'null' : source.nature === 'file' ? fileToStore ?? 'file' : source.url))

const newRecords = [
  created.artists.length === 0 ? null : `${created.artists.length} artist`,
  created.songs.length === 0 ? null : '1 song',
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
// order: a crash leaves something unreferenced rather than a reference to nothing. The
// recording's `sources` holds this very object, so filling the path in here is what gets
// written on the line below.
if (fileToStore !== null && source !== null && source.nature === 'file') {
  source.path = await storeFile(fileToStore)
  console.log(styles.light(`> ${source.path}`))
}

// Entities before the post that points at them: a crash between two appends leaves an
// unreferenced song or artist, never a post pointing at a recording that is not there.
await append('artists', created.artists)
await append('songs', created.songs)
await append('recordings', created.recordings)
await append('posts', created.posts)

console.log('')
console.log(styles.title('Post written.'))
console.log(styles.success(`${db.posts.length + 1} posts in the data`))

// The lines exactly as they landed, one record per line, so a correction can be made by
// hand on the file without reading it back first.
for (const [collection, records] of Object.entries(created)) {
  if (records.length === 0) continue
  console.log(styles.info(`\n${collection}`))
  for (const record of records) { console.log(styles.regular(JSON.stringify(record))) }
}
console.log('')
