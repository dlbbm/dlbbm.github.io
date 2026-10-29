/**
 * Writes one post into the database, by asking for it.
 *
 * The questions follow the shape the old blog actually had: a title line reading
 * `Artist — Title`, a playable source, and almost always nothing else. Everything the
 * archive leaves blank on 341 posts out of 400 is a question that defaults to nothing.
 */

import process from 'node:process'
import { confirm, input, select } from '@inquirer/prompts'
import { styles } from '@design-edito/tools/agnostic/misc/logs/styles/index.js'
import { recordingKinds } from '../../types.js'
import type {
  Artist,
  MediaService,
  MediaSource,
  PartialDate,
  Place,
  Post,
  Recording,
  RecordingKind,
  Song
} from '../../types.js'
import { append, createId, readDb, type Db } from '../_db/index.js'

// The blog's convention, em dash and all. The en dash and the hyphen are accepted because
// two of the 400 archived titles used one, and because nobody types an em dash reliably.
const TITLE_SEPARATOR = /\s+[—–-]\s+/
const TRAILING_PARENTHETICAL = /\s*\(([^()]*)\)\s*$/
const PARTIAL_DATE = /^(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?$/
const CREDIT_SEPARATOR = ';'

const kindLabels: Record<RecordingKind, string> = {
  live: 'a live take',
  demo: 'a demo',
  'alternate-take': 'an alternate take',
  remix: 'a remix'
}

const MEDIA_HOSTS: Array<{
  hostname: RegExp
  service: MediaService
  kind: MediaSource['kind']
}> = [
  { hostname: /(^|\.)youtube\.com$/, service: 'youtube', kind: 'video' },
  { hostname: /(^|\.)youtube-nocookie\.com$/, service: 'youtube', kind: 'video' },
  { hostname: /^youtu\.be$/, service: 'youtube', kind: 'video' },
  { hostname: /(^|\.)spotify\.com$/, service: 'spotify', kind: 'audio' },
  { hostname: /(^|\.)vimeo\.com$/, service: 'vimeo', kind: 'video' },
  { hostname: /(^|\.)soundcloud\.com$/, service: 'soundcloud', kind: 'audio' },
  { hostname: /(^|\.)grooveshark\.com$/, service: 'grooveshark', kind: 'audio' },
  { hostname: /(^|\.)bandcamp\.com$/, service: 'bandcamp', kind: 'audio' },
  { hostname: /(^|\.)mixcloud\.com$/, service: 'mixcloud', kind: 'audio' },
  { hostname: /(^|\.)soundowl\.com$/, service: 'soundowl', kind: 'audio' }
]

function splitTitleLine (raw: string): { artistName: string, songTitle: string } | null {
  const match = TITLE_SEPARATOR.exec(raw)
  if (match === null) return null
  const artistName = raw.slice(0, match.index).trim()
  const songTitle = raw.slice(match.index + match[0].length).trim()
  if (artistName === '' || songTitle === '') return null
  return { artistName, songTitle }
}

function splitParenthetical (raw: string): { title: string, note: string | null } {
  const match = TRAILING_PARENTHETICAL.exec(raw)
  if (match === null) return { title: raw.trim(), note: null }
  const note = match[1]?.trim() ?? ''
  return {
    title: raw.slice(0, match.index).trim(),
    note: note === '' ? null : note
  }
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

function todayAsString (): string {
  const now = new Date()
  return `${now.getFullYear()}`
    + `-${`${now.getMonth() + 1}`.padStart(2, '0')}`
    + `-${`${now.getDate()}`.padStart(2, '0')}`
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

function toMediaSource (raw: string): MediaSource | null {
  let url: URL
  try { url = new URL(raw.trim()) }
  catch { return null }
  const host = MEDIA_HOSTS.find(candidate => candidate.hostname.test(url.hostname))
  if (host === undefined) return null
  return {
    nature: 'media',
    service: host.service,
    kind: host.kind,
    url: url.toString(),
    embedUrl: toEmbedUrl(host.service, url)
  }
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
  const kind = await select<Artist['kind']>({
    message: `${name} — one person, or several?`,
    choices: [
      { name: 'One person', value: 'solo' },
      { name: 'Several', value: 'group' }
    ]
  })
  const artist: Artist = {
    id: createId(),
    name,
    nameAliases: [],
    kind,
    memberships: [],
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
 * Same title and same artist is taken to be the same work without asking. A match under
 * another artist's name is the interesting case — it is what makes a cover a cover — so
 * that one is always a question.
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

  const bySameArtist = candidates.find(song => recordingPool.some(recording =>
    recording.songId === song.id
    && recording.byArtistIds.includes(mainArtist.id)))
  if (bySameArtist !== undefined) {
    console.log(styles.light(`> ${bySameArtist.title}, a work already recorded by ${mainArtist.name}`))
    return bySameArtist
  }

  if (candidates.length > 0) {
    const chosen = await select<Song | null>({
      message: `A work called ${title} is already in the data. Is this a version of it?`,
      choices: [
        ...candidates.map(song => ({
          name: `Yes — ${song.title}`,
          description: `recorded by ${describeSongCredits(song, recordingPool, artistPool)}`,
          value: song as Song | null
        })),
        { name: 'No, a work of its own', value: null }
      ]
    })
    if (chosen !== null) return chosen
  }

  const song: Song = {
    id: createId(),
    title,
    titleAliases: [],
    composedByIds: [],
    wroteLyricsIds: [],
    firstRecordingId: null,
    sources: []
  }
  songPool.push(song)
  created.push(song)
  return song
}

async function askPlace (): Promise<Place | null> {
  const venue = (await input({ message: 'Venue? (empty to skip)' })).trim()
  const city = (await input({ message: 'City? (empty to skip)' })).trim()
  const country = (await input({ message: 'Country? (empty to skip)' })).trim()
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
 * The title line
 *
 * * * * * * * * * * * * * * * * * * * * * * * * * * */

const titleLine = await input({
  message: 'Title line, as it reads on the blog (Artist — Title)',
  validate: value => splitTitleLine(value) !== null || 'Expected an artist and a title, separated by a dash.'
})

const split = splitTitleLine(titleLine)
if (split === null) {
  console.log(styles.error('Could not read a title line out of that.'))
  process.exit(1)
}

const { title: songTitle, note: titleNote } = splitParenthetical(split.songTitle)
if (titleNote !== null) {
  console.log(styles.light(`> dropped "(${titleNote})" from the title — the annotations below carry it`))
}

const mainArtist = await resolveArtist(split.artistName, artistPool, created.artists)

const extraCreditNames = splitCredits(await input({
  message: `Credited alongside ${mainArtist.name}? (separate with a ${CREDIT_SEPARATOR}, empty to skip)`
}))
const extraCreditArtists: Artist[] = []
for (const name of extraCreditNames) {
  extraCreditArtists.push(await resolveArtist(name, artistPool, created.artists))
}

const featuringNames = splitCredits(await input({
  message: `Featuring? (separate with a ${CREDIT_SEPARATOR}, empty to skip)`
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

const preselectedKind = recordingKinds.find(kind => kind === titleNote?.toLowerCase()) ?? null

const recordingKind = await select<RecordingKind | null>({
  message: 'Anything to say about this version?',
  default: preselectedKind,
  choices: [
    { name: 'Nothing in particular', value: null },
    ...recordingKinds.map(kind => ({ name: kindLabels[kind], value: kind as RecordingKind | null }))
  ]
})

let recordingTitle: string | null = null
if (recordingKind !== null) {
  const raw = (await input({ message: 'A name this version carries? (empty to skip)' })).trim()
  recordingTitle = raw === '' ? null : raw
}

let performedOn: PartialDate | null = null
let performedAt: Place | null = null
if (recordingKind === 'live') {
  const rawPerformedOn = await input({
    message: 'Played when? (YYYY, YYYY-MM or YYYY-MM-DD, empty to skip)',
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

const rawMediaUrl = await input({
  message: 'Link to hear it? (empty for a post with no source)',
  validate: value => value.trim() === '' || toMediaSource(value) !== null
    || `Expected a URL on one of: ${MEDIA_HOSTS.map(host => host.service).join(', ')}.`
})

const mediaSource = rawMediaUrl.trim() === '' ? null : toMediaSource(rawMediaUrl)
if (mediaSource !== null) {
  const embed = mediaSource.embedUrl === null ? 'no embed url' : mediaSource.embedUrl
  console.log(styles.light(`> ${mediaSource.service}, ${mediaSource.kind} · ${embed}`))
}

/* * * * * * * * * * * * * * * * * * * * * * * * * * *
 *
 * When it goes out
 *
 * * * * * * * * * * * * * * * * * * * * * * * * * * */

const rawPublishedOn = await input({
  message: 'Published on? (a date ahead of today schedules it)',
  default: todayAsString(),
  validate: value => parsePartialDate(value) !== null || 'Expected YYYY, YYYY-MM or YYYY-MM-DD.'
})

const publishedOn = parsePartialDate(rawPublishedOn)
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
  title: recordingTitle,
  byArtistIds: [mainArtist.id, ...extraCreditArtists.map(artist => artist.id)],
  featuringArtistIds: featuringArtists.map(artist => artist.id),
  performedOn,
  performedAt,
  releasedOn: null,
  durationMs: null,
  sources: mediaSource === null ? [] : [mediaSource]
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

const credits = [mainArtist, ...extraCreditArtists].map(artist => artist.name).join(', ')
const featuring = featuringArtists.length === 0
  ? ''
  : ` (ft. ${featuringArtists.map(artist => artist.name).join(', ')})`

console.log(styles.info('\nPost'))
console.log(styles.important(`${credits}${featuring} — ${song.title}`))
console.log(styles.light(`published on ${formatPartialDate(publishedOn)}`))
if (recordingKind !== null) console.log(styles.light(`${kindLabels[recordingKind]}${recordingTitle === null ? '' : ` · ${recordingTitle}`}`))
if (performedOn !== null) console.log(styles.light(`played ${formatPartialDate(performedOn)}`))
if (performedAt !== null) {
  const place = [performedAt.venue, performedAt.city, performedAt.country]
    .filter((part): part is string => part !== null)
    .join(', ')
  console.log(styles.light(`at ${place}`))
}
console.log(styles.light(mediaSource === null ? 'no source' : mediaSource.url))

const newRecords = [
  created.artists.length === 0 ? null : `${created.artists.length} artist`,
  created.songs.length === 0 ? null : '1 song',
  '1 recording',
  '1 post'
].filter((part): part is string => part !== null)
console.log(styles.info('\nTo be appended'))
console.log(styles.light(newRecords.join(', ')))
console.log('')

const confirmed = await confirm({ message: 'Write it?', default: true })
if (!confirmed) {
  console.log(styles.warning('Nothing written.'))
  process.exit(0)
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
console.log('')
