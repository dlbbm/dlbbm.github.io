/**
 * Replaces the database with fifty believable test posts.
 *
 * Here to exercise the shape of the data, not to be kept: covers, works that share a
 * title without being the same work, works with several recordings, remixers, free-text
 * kinds, partial performance dates, hidden posts and scheduled ones. Delete this command
 * the day the real posts outnumber what it can teach.
 *
 * No file source: a `FileSource` names a file that has to be on disk, and a path to
 * nothing would be invalid data rather than test data.
 */

import process from 'node:process'
import { confirm } from '@inquirer/prompts'
import { styles } from '@design-edito/tools/agnostic/misc/logs/styles/index.js'
import type {
  Artist,
  MediaSource,
  PartialDate,
  Place,
  Post,
  Recording,
  RecordingKind,
  Song
} from '../../shared/types/index.js'
import { toTimestamp } from '../_date/index.js'
import { createId, write } from '../_db/index.js'

type Spec = {
  credits: string[]
  title: string
  // Two specs sharing a work are two recordings of it; two titles alike under different
  // works are what a song sharing a name with another looks like.
  work: string
  // Left out when the credited artists are the ones whose song it is. Empty claims nobody.
  original?: string[]
  kind?: RecordingKind
  featuring?: string[]
  remixers?: string[]
  performedOn?: PartialDate
  performedAt?: Place
  source?: 'youtube' | 'spotify' | 'vimeo'
  hidden?: true
}

function date (year: number | null, month: number | null = null, day: number | null = null): PartialDate {
  return { year, month, day }
}

function place (venue: string | null, city: string | null, country: string | null): Place {
  return { venue, city, country }
}

const SPECS: Spec[] = [
  { credits: ['Pink Floyd'], title: 'Comfortably Numb', work: 'comfortably-numb' },
  { credits: ['Pink Floyd'], title: 'Comfortably Numb', work: 'comfortably-numb', kind: 'live', performedOn: date(1980, 8, 9), performedAt: place('Earls Court', 'London', 'United Kingdom') },
  { credits: ['Pink Floyd'], title: 'Breathe', work: 'breathe-pink-floyd', source: 'spotify' },
  { credits: ['Télépopmusik'], title: 'Breathe', work: 'breathe-telepopmusik', featuring: ['Angela McCluskey'] },
  { credits: ['Nine Inch Nails'], title: 'Hurt', work: 'hurt' },
  { credits: ['Johnny Cash'], title: 'Hurt', work: 'hurt', original: ['Nine Inch Nails'] },
  { credits: ['Leonard Cohen'], title: 'Hallelujah', work: 'hallelujah', source: 'spotify' },
  { credits: ['Jeff Buckley'], title: 'Hallelujah', work: 'hallelujah', original: ['Leonard Cohen'] },
  { credits: ['Jeff Buckley'], title: 'Hallelujah', work: 'hallelujah', original: ['Leonard Cohen'], kind: 'live', performedOn: date(1995, 2), performedAt: place('Olympia', 'Paris', 'France') },
  { credits: ['David Bowie'], title: 'Life on Mars?', work: 'life-on-mars' },
  { credits: ['Seu Jorge'], title: 'Life on Mars?', work: 'life-on-mars', original: ['David Bowie'] },
  { credits: ['Bill Withers'], title: 'Lovely Day', work: 'lovely-day', source: 'spotify' },
  { credits: ['Alt-J'], title: 'Lovely Day', work: 'lovely-day', original: ['Bill Withers'] },
  { credits: ['Bill Withers'], title: "Grandma's Hands", work: 'grandmas-hands', kind: 'live', performedOn: date(1973), performedAt: place(null, 'Los Angeles', 'United States') },
  { credits: ['Neil Young'], title: 'Into the Black', work: 'into-the-black' },
  { credits: ['Chromatics'], title: 'Into the Black', work: 'into-the-black', original: ['Neil Young'] },
  { credits: ['Suprême NTM'], title: 'Ma Benz', work: 'ma-benz' },
  { credits: ['Brigitte'], title: 'Ma Benz', work: 'ma-benz', original: ['Suprême NTM'] },
  { credits: ['Estelle'], title: 'American Boy', work: 'american-boy', featuring: ['Kanye West'], source: 'spotify' },
  { credits: ['Cocoon'], title: 'American Boy', work: 'american-boy', original: ['Estelle'], kind: 'acoustic' },
  { credits: ['Gnarls Barkley'], title: 'Crazy', work: 'crazy-gnarls' },
  { credits: ['Patsy Cline'], title: 'Crazy', work: 'crazy-patsy-cline' },
  { credits: ['Radiohead'], title: 'Reckoner', work: 'reckoner' },
  { credits: ['Radiohead'], title: 'Reckoner', work: 'reckoner', kind: 'live', performedOn: date(2008, 5), performedAt: place('The Hospital Club', 'London', 'United Kingdom') },
  { credits: ['J.J. Cale'], title: 'Cocaine', work: 'cocaine', source: 'spotify' },
  { credits: ['J.J. Cale'], title: 'Cocaine', work: 'cocaine', kind: 'live', performedOn: date(1975), performedAt: place('Ebbets Field', 'Denver', 'United States') },
  { credits: ['Eric Clapton'], title: 'Cocaine', work: 'cocaine', original: ['J.J. Cale'], kind: 'live', performedOn: date(1977, 4, 27), performedAt: place('Hammersmith Odeon', 'London', 'United Kingdom') },
  { credits: ['Janice McClain'], title: 'Giving My Love', work: 'giving-my-love', kind: 'remix', remixers: ['Chevals'] },
  { credits: ['Jan Turkenburg'], title: 'In My Spaceship', work: 'in-my-spaceship', kind: 'remix', remixers: ['Pilooski'] },
  { credits: ['Connan Mockasin'], title: 'Forever Dolphin Love', work: 'forever-dolphin-love', kind: 'remix', remixers: ['Erol Alkan'] },
  { credits: ['Niki & the Dove'], title: 'Mother Protect', work: 'mother-protect', kind: 'remix', remixers: ['Goldroom'] },
  { credits: ['Mister Modo', 'Ugly Mac Beer'], title: 'Invasion', work: 'invasion', kind: 'remix', remixers: ['Judgement Day'] },
  { credits: ['Mary Clark'], title: "Take Me I'm Yours", work: 'take-me-im-yours', kind: 'Club 12" Mix' },
  { credits: ["Richard O'Brien"], title: 'Science Fiction / Double Feature', work: 'science-fiction-double-feature', kind: 'reprise' },
  { credits: ['Slow Club'], title: 'Never Look Back', work: 'never-look-back', kind: 'acoustic' },
  { credits: ['Tom Waits'], title: 'Please Wake Me Up', work: 'please-wake-me-up', kind: 'demo' },
  { credits: ['The Velvet Underground'], title: 'Oh Gin', work: 'oh-gin', kind: 'demo' },
  { credits: ['The Cure'], title: 'Another Journey by Train', work: 'another-journey-by-train', kind: 'demo', hidden: true },
  { credits: ['The Beach Boys'], title: 'Good Vibrations', work: 'good-vibrations', kind: 'alternate take' },
  { credits: ['Azealia Banks'], title: '212', work: '212', featuring: ['Lazy Jay'] },
  { credits: ['Olivier Libaux'], title: 'The Blood is Love', work: 'the-blood-is-love', original: ['Queens of the Stone Age'], featuring: ['Ambrosia Parsley'], source: 'vimeo' },
  { credits: ['Oy'], title: 'Doondari', work: 'doondari', original: [], kind: 'live', performedOn: date(2012, 10), performedAt: place('La Cigale', 'Paris', 'France') },
  { credits: ['Ancient Methods'], title: 'DJ Set', work: 'dj-set-ancient-methods', kind: 'DJ set', performedOn: date(2015, 2, 15), performedAt: place('Boiler Room', 'Berlin', 'Germany') },
  { credits: ['Darkside'], title: 'Planet Caravan', work: 'planet-caravan', original: ['Black Sabbath'], kind: 'live', performedOn: date(2013, 1), performedAt: place('Boiler Room', 'New York', 'United States') },
  { credits: ['Courtney Barnett'], title: 'Pedestrian at Best', work: 'pedestrian-at-best', kind: 'live', performedOn: date(2014, 7, 7), performedAt: place('The Triple Door', 'Seattle', 'United States') },
  { credits: ['Nick Cave & The Bad Seeds'], title: 'Higgs Boson Blues', work: 'higgs-boson-blues', kind: 'live', performedOn: date(2014, 10), performedAt: place('Austin City Limits', 'Austin', 'United States'), hidden: true },
  { credits: ['Grandmaster Flash'], title: 'The Message', work: 'the-message-grandmaster-flash', kind: 'live' },
  { credits: ['Murcof', 'Vanessa Wagner'], title: 'Gnossienne No. 3', work: 'gnossienne-no-3', original: ['Erik Satie'], source: 'spotify' },
  { credits: ['Philip Glass'], title: 'Koyaanisqatsi', work: 'koyaanisqatsi' },
  { credits: ['Sarah Vaughan'], title: 'Blackbird', work: 'blackbird', original: ['The Beatles'] }
]

function mediaId (length: number): string {
  const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  return Array
    .from({ length }, () => alphabet[Math.floor(Math.random() * alphabet.length)] ?? 'a')
    .join('')
}

function toSource (service: Spec['source']): MediaSource {
  if (service === 'spotify') {
    return {
      nature: 'media',
      service: 'spotify',
      kind: 'audio',
      url: `https://open.spotify.com/track/${mediaId(22)}`,
      name: null
    }
  }
  if (service === 'vimeo') {
    return {
      nature: 'media',
      service: 'vimeo',
      kind: 'video',
      url: `https://vimeo.com/${10_000_000 + Math.floor(Math.random() * 89_999_999)}`,
      name: null
    }
  }
  return {
    nature: 'media',
    service: 'youtube',
    kind: 'video',
    url: `https://www.youtube.com/watch?v=${mediaId(11)}`,
    name: null
  }
}

console.log('')
console.log(styles.title('Seeding the data...'))
console.log(styles.danger(`This replaces data/ with ${SPECS.length} generated posts. Whatever is there now is lost.`))
console.log('')

const confirmed = await confirm({ message: 'Replace?', default: false })
if (!confirmed) {
  console.log(styles.warning('Nothing written.'))
  process.exit(0)
}

const artists: Artist[] = []
const songs: Song[] = []
const recordings: Recording[] = []
const posts: Post[] = []
const songsByWork = new Map<string, Song>()

function artistId (name: string): string {
  const existing = artists.find(artist => artist.name === name)
  if (existing !== undefined) return existing.id
  const artist: Artist = { id: createId(), name, nameAliases: [], sources: [] }
  artists.push(artist)
  return artist.id
}

// Every few days from mid-March, which puts the last couple of posts ahead of today: a
// publication moment in the future is how a post is scheduled.
const STEPS = [3, 4, 5, 5, 6, 7]
let when = new Date(2026, 2, 14, 19, 12)

for (const [index, spec] of SPECS.entries()) {
  const credited = spec.credits.map(artistId)
  const work = songsByWork.get(spec.work)
  if (work === undefined) {
    const song: Song = {
      id: createId(),
      title: spec.title,
      titleAliases: [],
      originalArtistIds: spec.original === undefined ? credited : spec.original.map(artistId),
      sources: []
    }
    songsByWork.set(spec.work, song)
    songs.push(song)
  }
  const song = songsByWork.get(spec.work)
  if (song === undefined) { throw new Error(`No work for ${spec.title}`) }

  const recording: Recording = {
    id: createId(),
    songId: song.id,
    title: null,
    kind: spec.kind ?? null,
    byArtistIds: credited,
    featuringArtistIds: (spec.featuring ?? []).map(artistId),
    remixedByArtistIds: (spec.remixers ?? []).map(artistId),
    performedOn: spec.performedOn ?? null,
    performedAt: spec.performedAt ?? null,
    releasedOn: null,
    durationMs: null,
    sources: [toSource(spec.source)]
  }
  recordings.push(recording)

  posts.push({
    id: createId(),
    publishedOn: toTimestamp(when),
    hidden: spec.hidden ?? false,
    recordingId: recording.id,
    body: null
  })

  // The hour is set rather than nudged: a drift of a few minutes per post would walk the
  // whole run into the small hours, which is not when anyone posts a song.
  when = new Date(when.getTime())
  when.setDate(when.getDate() + (STEPS[index % STEPS.length] ?? 5))
  when.setHours(18 + (index % 5), (index * 17) % 60, 0, 0)
}

await write('artists', artists)
await write('songs', songs)
await write('recordings', recordings)
await write('posts', posts)

console.log('')
console.log(styles.title('Data seeded.'))
console.log(styles.success(`${posts.length} posts in the data`))
console.log(styles.light(`> ${artists.length} artists, ${songs.length} songs, ${recordings.length} recordings`))
console.log(styles.light(`> published from ${posts[0]?.publishedOn} to ${posts[posts.length - 1]?.publishedOn}`))
console.log('')
