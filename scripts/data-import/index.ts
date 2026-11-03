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
  rawHtml: string | null
  media: Array<{ kind: string, url: string }> | null
}

type Flag =
  | 'no-source'
  | 'widget-url'
  | 'dead-source-in-body'
  | 'unsplit-title'
  | 'ambiguous-credit'
  | 'tracklist-title'
  | 'read-qualifier'

type Reviewed = {
  flags: Flag[]
  postId: string
  archiveUrl: string
  publishedOn: Timestamp
  artist: string
  song: string
  kind: string
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

type Playable = { service: MediaService, kind: 'audio' | 'video', url: string }

/**
 * The players this blog ever embedded, and the canonical URL of each.
 *
 * **The crawler's `media` field only kept the iframes it recognised**, which were YouTube
 * and Vimeo; the Spotify, SoundCloud, Bandcamp and Mixcloud players were left in the raw
 * markup. So the markup is read too, and twenty-one posts that look sourceless are not.
 *
 * SoundCloud and Bandcamp keep a widget URL rather than a page: the widget is what the
 * archive holds, resolving it to a human URL needs their API, and what matters here is
 * that the track can be played at all. They are flagged for it.
 */
const PLAYERS: Array<{
  service: MediaService
  kind: 'audio' | 'video'
  pattern: RegExp
  canonical: (found: RegExpExecArray) => string
}> = [
  {
    service: 'youtube',
    kind: 'video',
    pattern: /youtube\.com\/embed\/([\w\-]+)/v,
    canonical: found => `https://www.youtube.com/watch?v=${found[1]}`
  },
  {
    service: 'vimeo',
    kind: 'video',
    pattern: /player\.vimeo\.com\/video\/(\d+)/v,
    canonical: found => `https://vimeo.com/${found[1]}`
  },
  {
    service: 'spotify',
    kind: 'audio',
    pattern: /open\.spotify\.com\/embed\?uri=spotify(?::|%3A)(track|album|playlist)(?::|%3A)(\w+)/iv,
    canonical: found => `https://open.spotify.com/${found[1]}/${found[2]}`
  },
  {
    service: 'soundcloud',
    kind: 'audio',
    pattern: /api\.soundcloud\.com(?:\/|%2F)tracks(?:\/|%2F)(\d+)/iv,
    canonical: found => `https://api.soundcloud.com/tracks/${found[1]}`
  },
  {
    service: 'mixcloud',
    kind: 'audio',
    pattern: /mixcloud\.com(?:\/|%2F)([^&"'\s]+)/iv,
    canonical: found => `https://www.mixcloud.com/${decodeURIComponent(found[1] ?? '').replace(/^\/+/v, '')}`
  },
  {
    service: 'bandcamp',
    kind: 'audio',
    pattern: /(https?:\/\/[\w.\-]*bandcamp\.com\/EmbeddedPlayer\/[^"'\s]+)/iv,
    canonical: found => found[1] ?? ''
  }
]

const WIDGET_SERVICES: MediaService[] = ['soundcloud', 'bandcamp']

/** The first player found in a blob of markup, in the order above. */
function readPlayer (markup: string): Playable | null {
  const text = markup.replace(/&amp;/giv, '&')
  for (const player of PLAYERS) {
    const found = player.pattern.exec(text)
    if (found === null) continue
    const url = player.canonical(found)
    if (url === '') continue
    return { service: player.service, kind: player.kind, url }
  }
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

  // The declared media first, then the markup it was cut out of: everything the crawler
  // did not recognise is still in there.
  const embed = readPlayer((archive.media ?? []).map(one => one.url).join(' '))
    ?? readPlayer(archive.rawHtml ?? '')
  if (embed !== null && WIDGET_SERVICES.includes(embed.service)) flags.push('widget-url')
  // The post it came from, kept as a claim that this is that: it is what makes a record
  // traceable back to the archive, and the only way to check that nothing was dropped.
  const origin: Source = {
    nature: 'identity',
    service: 'tumblr',
    url: archive.url,
    externalId: archive.id
  }
  const sources: Source[] = embed === null
    ? [origin]
    : [{ nature: 'media', service: embed.service, kind: embed.kind, url: embed.url }, origin]

  let note: string | null = null
  if (embed === null) {
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
  const postId = createId()
  written.push({
    id: postId,
    publishedOn,
    hidden: false,
    recordingId: recording.id,
    body
  })

  // Every post is listed, not only the ones that went wrong: the flagged rows are where
  // the work is, and the rest are there to be checked against if anyone wants to.
  reviewed.push({
    flags,
    postId,
    archiveUrl: archive.url,
    publishedOn,
    artist: artistName,
    song: songTitle,
    kind: recording.kind ?? '',
    // No column holds a place or a date, so the one the title gave up is written where it
    // can at least be seen.
    note: note ?? placeAndDate(recording)
  })
}

await write('artists', artists)
await write('slugs', slugs)
await write('songs', songs)
await write('recordings', recordings)
await write('posts', [])
await append('posts', written)

/** The place and the date a title gave up, as one line, for a column that is not there. */
function placeAndDate (recording: Recording): string | null {
  const where = recording.performedAt
  const when = recording.performedOn
  const bits = [
    where === null ? null : [where.venue, where.city, where.country].filter(part => part !== null).join(', '),
    when === null ? null : [when.year, when.month, when.day].filter(part => part !== null).join('-')
  ].filter((bit): bit is string => bit !== null && bit !== '')
  return bits.length === 0 ? null : bits.join(' \u00b7 ')
}

const REASONS: Record<Flag, string> = {
  'widget-url': 'The source is a player widget rather than a page, because that is what the archive held. It plays; it just does not read as a URL a human would share.',
  'no-source': 'Nothing to play. The embed was gone when the blog was crawled, so the post arrives as a title and a date.',
  'dead-source-in-body': 'A URL was found in the body, on a host that is dead or is not an embed. Kept here rather than stored.',
  'unsplit-title': 'No dash in the title, so the whole line became the artist and the song both. Needs splitting by hand.',
  'ambiguous-credit': 'The credit holds an ampersand or a comma. It was kept as one artist, because no rule tells `Polo & Pan` from `Murcof & Vanessa Wagner`.',
  'tracklist-title': 'A whole album. The tracklist written into the title was dropped and the recording is a `full album`; what is left is the album\'s own name, which wants checking.',
  'read-qualifier': 'A parenthesis at the end of the title was read as a kind, a place or a date. Worth checking it said that.'
}

const ORDER: Flag[] = [
  'no-source',
  'widget-url',
  'tracklist-title',
  'unsplit-title',
  'ambiguous-credit',
  'dead-source-in-body',
  'read-qualifier'
]

const escaped = (text: string): string => text.replace(/\|/gv, '\\|').trim()
const searchUrl = (one: Reviewed): string =>
  `https://www.youtube.com/results?search_query=${encodeURIComponent(`${one.artist} ${one.song}`)}`

let review = '# Import review\n\n'
const flagged = reviewed.filter(one => one.flags.length > 0)
review += `Written by \`npm run data:import\`. **All ${reviewed.length} posts are listed**, flagged ones\n`
review += `first: the ${flagged.length} the import could not read cleanly, then the ${reviewed.length - flagged.length} it believes it got\n`
review += 'right, with an empty `flags` cell. Checking those is optional; the flagged ones are\n'
review += 'where the work is.\n\n'
review += '**Four columns are yours to edit**, in place, row by row — `artist`, `song`, `source`\n'
review += 'and `note`, which sit together on the left. `flags` opens each row with what the import\n'
review += 'could not read, and `find`, `date` and `post` are there to help you answer.\n\n'
review += '- **`artist`** — correct it if the import read it wrong, and **split a credit with\n'
review += '  `;`**: `Brigitte Fontaine; The Art Ensemble of Chicago; Areski Belkacem` is three\n'
review += '  artists where the import stored one. A name prefixed `ft.` is a guest rather than a\n'
review += '  credit: `Nicone; Sascha Braemer; ft. Narra`. A name already in the database is reused;\n'
review += '  a new one is created with its own URL.\n'
review += '- **`song`** — the work\'s title, if the import mangled it.\n'
review += '- **`kind`** — what the parenthesis at the end of the title was read as. Most of the\n'
review += '  `read-qualifier` rows are wrong here, because a cover and a remix both landed in it\n'
review += '  as free text. Three forms are understood: a plain kind (`live`, `demo`, `remix`,\n'
review += '  `alternate take`, `full album`, or anything else), `cover: Neil Young` for a cover —\n'
review += '  which sets the song\'s original artist — and `remix: Goldroom` for a remix, which\n'
review += '  credits the remixer. Empty it to say the parenthesis meant nothing.\n'
review += '- **`source`** — a URL that plays the track. The `find` link opens a YouTube search for\n'
review += '  that artist and song.\n'
review += '- **`note`** — yours. Prefilled where the import read a place or a date out of the\n'
review += '  title, since no column holds those; overwrite it freely. Nothing reads it back.\n\n'
review += 'A cell left as the import wrote it changes nothing. The `post` column is the id\n'
review += '`npm run post:edit -- <id>` takes, for anything this table has no column for.\n\n'
review += '> **Running `data:import` again rewrites this file and replaces the database**, so\n'
review += '> whatever is filled in here is lost along with every hand edit. Import once, then work\n'
review += '> from here.\n\n'
review += '## What the flags mean\n\n'
for (const flag of ORDER) {
  const concerned = reviewed.filter(one => one.flags.includes(flag))
  if (concerned.length === 0) continue
  review += `- **\`${flag}\`** — ${concerned.length} · ${REASONS[flag]}\n`
}
review += '\n## The posts\n\n'
review += '| flags | artist | song | kind | source | find | note | date | post |\n'
review += '| --- | --- | --- | --- | --- | --- | --- | --- | --- |\n'
const ordered = [...flagged, ...reviewed.filter(one => one.flags.length === 0)]
for (const one of ordered) {
  const cells = [
    one.flags.map(flag => `\`${flag}\``).join(' '),
    escaped(one.artist),
    escaped(one.song),
    escaped(one.kind),
    '',
    `[find](${searchUrl(one)})`,
    one.note === null ? '' : `\`${escaped(one.note)}\``,
    one.publishedOn.slice(0, 10),
    `\`${one.postId}\``
  ]
  review += `| ${cells.join(' | ')} |\n`
}
review += '\nEvery row traces back to Tumblr through its post id: the recording it names carries the\n'
review += 'permalink as an identity source.\n'

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
console.log(styles.light(`> IMPORT-REVIEW.md · ${reviewed.length} posts, ${reviewed.filter(one => one.flags.length > 0).length} of them flagged`))
console.log('')
console.log(styles.success('Archive imported.'))
console.log('')
