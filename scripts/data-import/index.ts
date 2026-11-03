/**
 * Reads the Tumblr archive and writes it into `data/`.
 *
 * What the crawler kept is a title, a moment and — for three posts out of four — one
 * embed. Everything this database wants beyond that has to be read out of the title,
 * which was written by hand over eight years and is regular only most of the time. So the
 * import does what it can see and **writes down what it could not**: `IMPORT-REVIEW.md`
 * lists every post whose reading is a guess, grouped by what is wrong with it.
 *
 * Nothing here splits a credit. `Murcof & Vanessa Wagner` is two artists and `Polo & Pan`
 * is one, and no rule tells them apart — so an ampersand becomes one artist named after
 * the whole line, and the post goes on the review list.
 */

import path from 'node:path'
import process from 'node:process'
import { readFile, writeFile } from 'node:fs/promises'
import { confirm } from '@inquirer/prompts'
import { styles } from '@design-edito/tools/agnostic/misc/logs/styles/index.js'
import type {
  Artist,
  ArtistId,
  MediaService,
  PartialDate,
  Place,
  Post,
  Recording,
  Slug,
  Song,
  Source,
  Timestamp
} from '../../shared/types/index.js'
import { CWD } from '../_config/index.js'
import { append, createId, readDb, write } from '../_db/index.js'
import { mintSlug, slugify } from '../_slug/index.js'

type ArchivePost = {
  id: string
  url: string
  title: string | null
  publishedOn: string | null
  contentHtml: string | null
  media: Array<{ kind: string, url: string }> | null
}

type Flag =
  | 'no-source'
  | 'dead-source-in-body'
  | 'unsplit-title'
  | 'ambiguous-credit'
  | 'tracklist-title'
  | 'read-qualifier'

type Reviewed = {
  flags: Flag[]
  archiveUrl: string
  publishedOn: Timestamp
  artist: string
  song: string
  note: string | null
}

const PARIS = 'Europe/Paris'
const DASH = /\s+[—–]\s+/v
const TRAILING_PARENTHETICAL = /\s*\(([^\(\)]*)\)\s*$/v
const URL_IN_BODY = /https?:\/\/[^\s"<>]+/gv
// Grooveshark died in 2015 and its widget URLs resolve to nothing; a Mixcloud link is
// alive but is not an embed. Either way the post needs a hand.
const DEAD_HOSTS = ['grooveshark.com']
// Three titles ended up with the Grooveshark widget's own caption glued on, which repeats
// the song and names the artist again. The tail goes; what it duplicated is left to the
// review list, since cutting it would mean guessing where the real title stopped.
const WIDGET_CAPTION = /\s+by\s+[^]*?\s+on\s+Grooveshark\s*$/iv
// A tracklist pasted into the title: a timecode, or an album year in parentheses.
const TRACKLIST = /~\s*\d{1,2}:\d{2}|\(Album,\s*\d{4}/iv
// Where the album's title stops and its contents begin.
const TRACKLIST_TAIL = /\s*(?:~|\((?:Album|Bonus)\b)[^]*$/iv

const MONTHS = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december'
]

function pad (value: number): string {
  return `${value}`.padStart(2, '0')
}

/** How far Paris was from UTC at a given instant, in minutes. */
function parisOffsetMinutes (at: Date): number {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-GB', {
    timeZone: PARIS,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23'
  }).formatToParts(at).map(part => [part.type, part.value]))
  const local = `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}`
  return Math.round((Date.parse(`${local}Z`) - at.getTime()) / 60000)
}

/**
 * The moment, written with the zone it was always in.
 *
 * **The crawler's `Z` is a lie, and the components are the truth.** Tumblr's theme prints
 * a post's time in the blog's own timezone, and that printed hour is what was stored with
 * a `Z` stuck on the end: across all 401 posts the stored value matches the `5:39 pm` the
 * page showed, in July as in January. So nothing is shifted here — the wall clock is kept
 * and the Paris offset for that date is attached, which is what makes summer `+02:00` and
 * winter `+01:00` without moving the hour.
 *
 * The offset is read twice: once from the wall clock taken as UTC, then again from the
 * instant that first answer implies, so a post near a DST change lands on the right side
 * of it.
 */
function parisTimestamp (stored: string): Timestamp {
  const wall = stored.replace(/(\.\d+)?Z$/v, '')
  const naive = new Date(`${wall}Z`)
  const first = parisOffsetMinutes(naive)
  const offset = parisOffsetMinutes(new Date(naive.getTime() - first * 60000))
  const sign = offset < 0 ? '-' : '+'
  const abs = Math.abs(offset)
  return `${wall}${sign}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`
}

/** `15 February 2015`, `February 2015`, `2015` — and nothing invented for what is absent. */
function readPartialDate (text: string): PartialDate | null {
  const words = text.trim().split(/\s+/v)
  const year = words.map(Number).find(value => Number.isInteger(value) && value > 1900 && value < 2100)
  if (year === undefined) return null
  const month = words
    .map(word => MONTHS.indexOf(word.toLowerCase()) + 1)
    .find(position => position > 0)
  const day = words
    .map(Number)
    .find(value => Number.isInteger(value) && value >= 1 && value <= 31)
  return {
    year,
    month: month ?? null,
    day: month === undefined ? null : day ?? null
  }
}

/** One chunk is a city, two are a venue and a city, three add the country. */
function readPlace (chunks: string[]): Place | null {
  if (chunks.length === 0) return null
  if (chunks.length === 1) return { venue: null, city: chunks[0] ?? null, country: null }
  if (chunks.length === 2) return { venue: chunks[0] ?? null, city: chunks[1] ?? null, country: null }
  return { venue: chunks[0] ?? null, city: chunks[1] ?? null, country: chunks.slice(2).join(', ') }
}

type Qualifier = {
  kind: string | null
  performedOn: PartialDate | null
  performedAt: Place | null
}

/**
 * What the parenthesis at the end of a title was saying.
 *
 * `(Live at Boiler Room, Berlin, 15 February 2015)` is the shape the archive uses most;
 * anything else — `(reprise)`, `(demo)`, `(Club 12" Mix)` — becomes the kind verbatim,
 * which the type allows and the front prints as written.
 */
function readQualifier (text: string): Qualifier {
  const live = /^live\s+at\s+(.+)$/iv.exec(text)
  if (live === null) return { kind: text.trim(), performedOn: null, performedAt: null }
  const chunks = (live[1] ?? '').split(',').map(chunk => chunk.trim()).filter(chunk => chunk !== '')
  const last = chunks.at(-1) ?? ''
  const performedOn = readPartialDate(last)
  return {
    kind: 'live',
    performedOn,
    performedAt: readPlace(performedOn === null ? chunks : chunks.slice(0, -1))
  }
}

/** The canonical URL of an embed, which is the only form this database stores. */
function readMedia (url: string): { service: MediaService, url: string } | null {
  const youtube = /youtube\.com\/embed\/([\w\-]+)/v.exec(url)
  if (youtube !== null) return { service: 'youtube', url: `https://www.youtube.com/watch?v=${youtube[1]}` }
  const vimeo = /player\.vimeo\.com\/video\/(\d+)/v.exec(url)
  if (vimeo !== null) return { service: 'vimeo', url: `https://vimeo.com/${vimeo[1]}` }
  return null
}

/**
 * The post's own words, one line at a time.
 *
 * **The archive's `title` is not a heading.** It is this same body with its line breaks
 * taken out, so a post of two lines arrives as `Pink Floyd — EchoesStanley Kubrick —
 * 2001: A Space Odyssey`. The first line of the body is what the title should have been,
 * and everything after it is what the post actually wrote down — a tracklist, a second
 * link, a note.
 */
function readLines (markup: string): string[] {
  return markup
    .replace(/<br\s*\/?>/giv, '\n')
    .replace(/<\/p>/giv, '\n')
    .replace(/<[^>]*>/gv, '')
    .replace(/&nbsp;/giv, ' ')
    .replace(/&amp;/giv, '&')
    .replace(/&lt;/giv, '<')
    .replace(/&gt;/giv, '>')
    .replace(/&quot;/giv, '"')
    .replace(/&#39;/gv, '\'')
    .split('\n')
    .map(line => line.replace(/[ \t\u00a0\u2007\u202f]+/gv, ' ').trim())
    .filter(line => line !== '')
}

const archivePath = process.argv[2]
if (archivePath === undefined) {
  console.log('')
  console.log(styles.error('Which archive? Pass the path to the crawler\'s pages.ndjson.'))
  console.log(styles.light('> npm run data:import -- ../path/to/pages.ndjson'))
  console.log('')
  process.exit(1)
}

console.log('')
console.log(styles.title('Reading the archive...'))
console.log(styles.light(`> ${archivePath}`))

const raw = await readFile(path.resolve(CWD, archivePath), { encoding: 'utf-8' })
const archived = new Map<string, ArchivePost>()
for (const line of raw.split('\n')) {
  const trimmed = line.trim()
  if (trimmed === '') continue
  const page = JSON.parse(trimmed) as { kind?: string, posts?: ArchivePost[] }
  // A post appears on the index and again on its permalink; the permalink page is the one
  // that carries the whole block, so it is the one that wins.
  for (const post of page.posts ?? []) {
    if (page.kind === 'permalink' || !archived.has(post.id)) archived.set(post.id, post)
  }
}

const posts = [...archived.values()]
  .filter(post => post.publishedOn !== null)
  .sort((one, other) => (one.publishedOn ?? '').localeCompare(other.publishedOn ?? ''))

console.log(styles.light(`> ${posts.length} posts`))

const existing = await readDb()
const held = existing.posts.length
if (held > 0) {
  console.log('')
  console.log(styles.danger(`The database already holds ${held} posts, and importing replaces all of it.`))
  const go = await confirm({ message: 'Replace the database with the archive?', default: false })
  if (!go) {
    console.log('')
    console.log(styles.warning('Nothing written.'))
    console.log('')
    process.exit(0)
  }
}

console.log('')
console.log(styles.title('Importing...'))

const artists: Artist[] = []
const songs: Song[] = []
const recordings: Recording[] = []
const written: Post[] = []
const slugs: Slug[] = []
const reviewed: Reviewed[] = []

const artistsByName = new Map<string, ArtistId>()
function artistId (name: string): ArtistId {
  const key = name.toLowerCase()
  const known = artistsByName.get(key)
  if (known !== undefined) return known
  const id = createId()
  artists.push({ id, name, nameAliases: [], sources: [] })
  slugs.push(mintSlug('artist', id, name, slugs))
  artistsByName.set(key, id)
  return id
}

const songsByKey = new Map<string, string>()
function songId (title: string, byArtist: ArtistId): string {
  const key = `${byArtist}::${title.toLowerCase()}`
  const known = songsByKey.get(key)
  if (known !== undefined) return known
  const id = createId()
  songs.push({ id, title, titleAliases: [], originalArtistIds: [byArtist], sources: [] })
  songsByKey.set(key, id)
  return id
}

for (const archive of posts) {
  const flags: Flag[] = []
  // The first line that reads as `Artist — Song`, and not simply the first: a handful of
  // posts open with a stray dash or with a widget's caption, and the line that names the
  // music can be the second or the third. Everything else becomes the body, in order.
  const lines = readLines(archive.contentHtml ?? '')
  const named = lines.findIndex(line => DASH.test(line))
  const titleAt = named === -1 ? 0 : named
  const title = (lines[titleAt] ?? archive.title ?? '')
    .replace(/\s+/gv, ' ')
    .replace(WIDGET_CAPTION, '')
    .trim()
  const rest = lines.filter((_, index) => index !== titleAt)
  const body = rest.length === 0 ? null : rest.join('\n')
  const publishedOn = parisTimestamp(archive.publishedOn ?? '')

  const parenthetical = TRAILING_PARENTHETICAL.exec(title)
  const stripped = parenthetical === null ? title : title.slice(0, parenthetical.index).trim()
  const qualifier = parenthetical === null ? null : readQualifier(parenthetical[1] ?? '')
  if (qualifier !== null) flags.push('read-qualifier')

  const split = DASH.exec(stripped)
  const artistName = split === null ? stripped : stripped.slice(0, split.index).trim()
  const spelled = split === null ? stripped : stripped.slice(split.index + split[0].length).trim()
  if (split === null) flags.push('unsplit-title')
  if (/[&,]/v.test(artistName)) flags.push('ambiguous-credit')

  // A whole album: the work is the album, the tracklist written after it is dropped, and
  // the recording says what it is. One post is one recording either way.
  const isAlbum = TRACKLIST.test(spelled)
  if (isAlbum) flags.push('tracklist-title')
  const songTitle = isAlbum ? spelled.replace(TRACKLIST_TAIL, '').trim() : spelled

  const embed = (archive.media ?? [])
    .map(one => readMedia(one.url))
    .find(one => one !== null)
  // The post it came from, kept as a claim that this is that: it is what makes a record
  // traceable back to the archive, and the only way to check that nothing was dropped.
  const origin: Source = {
    nature: 'identity',
    service: 'tumblr',
    url: archive.url,
    externalId: archive.id
  }
  const sources: Source[] = embed === undefined || embed === null
    ? [origin]
    : [{ nature: 'media', service: embed.service, kind: 'video', url: embed.url }, origin]

  let note: string | null = null
  if (embed === undefined || embed === null) {
    flags.push('no-source')
    const found = [...((archive.contentHtml ?? '').matchAll(URL_IN_BODY))].map(match => match[0])
    const salvage = found.find(url => !DEAD_HOSTS.some(host => url.includes(host)))
      ?? found[0]
      ?? null
    if (salvage !== null) {
      flags.push('dead-source-in-body')
      note = salvage
    }
  }

  const by = artistId(artistName === '' ? 'Unknown' : artistName)
  const song = songId(songTitle === '' ? title : songTitle, by)
  const recording: Recording = {
    id: createId(),
    songId: song,
    kind: isAlbum ? 'full album' : qualifier?.kind ?? null,
    byArtistIds: [by],
    featuringArtistIds: [],
    remixedByArtistIds: [],
    performedOn: qualifier?.performedOn ?? null,
    performedAt: qualifier?.performedAt ?? null,
    releasedOn: null,
    durationMs: null,
    sources
  }
  recordings.push(recording)
  written.push({
    id: createId(),
    publishedOn,
    hidden: false,
    recordingId: recording.id,
    body
  })

  if (flags.length > 0) {
    reviewed.push({
      flags,
      archiveUrl: archive.url,
      publishedOn,
      artist: artistName,
      song: songTitle,
      note
    })
  }
}

await write('artists', artists)
await write('slugs', slugs)
await write('songs', songs)
await write('recordings', recordings)
await write('posts', [])
await append('posts', written)

const REASONS: Record<Flag, string> = {
  'no-source': 'Nothing to play. The embed was gone when the blog was crawled, so the post arrives as a title and a date.',
  'dead-source-in-body': 'A URL was found in the body, on a host that is dead or is not an embed. Kept here rather than stored.',
  'unsplit-title': 'No dash in the title, so the whole line became the artist and the song both. Needs splitting by hand.',
  'ambiguous-credit': 'The credit holds an ampersand or a comma. It was kept as one artist, because no rule tells `Polo & Pan` from `Murcof & Vanessa Wagner`.',
  'tracklist-title': 'A whole album. The tracklist written into the title was dropped and the recording is a `full album`; what is left is the album\'s own name, which wants checking.',
  'read-qualifier': 'A parenthesis at the end of the title was read as a kind, a place or a date. Worth checking it said that.'
}

const ORDER: Flag[] = [
  'no-source',
  'tracklist-title',
  'unsplit-title',
  'ambiguous-credit',
  'dead-source-in-body',
  'read-qualifier'
]

let review = '# Import review\n\n'
review += `Written by \`npm run data:import\`. ${reviewed.length} of ${posts.length} posts need a look,\n`
review += 'grouped by what the import could not read. A post appears under every flag it carries.\n'
for (const flag of ORDER) {
  const concerned = reviewed.filter(one => one.flags.includes(flag))
  if (concerned.length === 0) continue
  const count = concerned.length === 1 ? '1 post' : `${concerned.length} posts`
  review += `\n## ${flag} — ${count}\n\n${REASONS[flag]}\n\n`
  for (const one of concerned) {
    const day = one.publishedOn.slice(0, 10)
    const said = one.note === null ? '' : ` — \`${one.note}\``
    review += `- \`${day}\` **${one.artist}** — ${one.song}${said} · [archive](${one.archiveUrl})\n`
  }
}
await writeFile(path.join(CWD, 'IMPORT-REVIEW.md'), review, { encoding: 'utf-8' })

console.log(styles.light(`> ${artists.length} artists, ${songs.length} songs, ${recordings.length} recordings`))
const unplayable = recordings.filter(one => !one.sources.some(source => source.nature !== 'identity'))
console.log(styles.light(`> ${written.length} posts, ${unplayable.length} of them with nothing to play`))

// Every archived post has to come out the other side. Counting is not enough — two
// records could carry the same origin — so the check is on the set of permalinks.
const origins = new Set(recordings.flatMap(one => one.sources
  .filter(source => source.nature === 'identity')
  .map(source => source.url)))
const missing = posts.filter(one => !origins.has(one.url))
if (missing.length > 0 || origins.size !== posts.length) {
  console.log('')
  console.log(styles.error(`${missing.length} archived posts did not make it, and ${posts.length - origins.size} origins collided.`))
  for (const one of missing.slice(0, 10)) console.log(styles.light(`> ${one.url}`))
  process.exit(1)
}
console.log(styles.light(`> ${origins.size} of ${posts.length} archived permalinks accounted for`))
console.log('')
console.log(styles.info('Review'))
console.log(styles.light(`> IMPORT-REVIEW.md · ${reviewed.length} posts to consolidate by hand`))
console.log('')
console.log(styles.success('Archive imported.'))
console.log('')
