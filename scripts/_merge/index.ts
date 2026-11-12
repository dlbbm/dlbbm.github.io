/**
 * Choosing the two records a merge joins, which of them survives, and joining them.
 *
 * Shared by `artist:merge`, `song:merge` and `data:merge-duplicates`: the first two answer
 * one pair, the third walks every pair the duplicate report finds. What a merge repoints
 * differs by collection; how a pair is picked, what it prints and what it asks before
 * writing do not.
 */

import { confirm, input, select } from '@inquirer/prompts'
import { styles } from '@design-edito/tools/agnostic/misc/logs/styles/index.js'
import type { Artist, ArtistId, Recording, Song, SongId } from '../../shared/types/index.js'
import { printRecords } from '../_ask/index.js'
import { comparisonKey, findDuplicates } from '../_check/index.js'
import { write, type Db } from '../_db/index.js'
import { describeArtist, describeSong, findArtistById, type Described } from '../_describe/index.js'

/** The two records a merge was asked for: `from` is dropped, `into` is kept. */
export type Pair<T> = {
  from: T
  into: T
}

export type Asking<T> = {
  /** What the records are, for the one line that says nothing was found. */
  kind: string
  records: T[]
  pairs: Array<{ one: T, other: T, reason: string }>
  describe: (record: T) => Described
  /** The name to match an answer against, and to print in a choice. */
  nameOf: (record: T) => string
  /** The other names it goes by, so an alias answers too. */
  aliasesOf: (record: T) => string[]
}

async function askByName<T> (asking: Asking<T>, message: string): Promise<T> {
  const answer = await input({
    message,
    validate: value => {
      const key = comparisonKey(value)
      return asking.records.some(record => comparisonKey(asking.nameOf(record)) === key
        || asking.aliasesOf(record).some(alias => comparisonKey(alias) === key))
        || `No ${asking.kind} called that.`
    }
  })
  const key = comparisonKey(answer)
  const found = asking.records.find(record => comparisonKey(asking.nameOf(record)) === key
    || asking.aliasesOf(record).some(alias => comparisonKey(alias) === key))
  if (found === undefined) return askByName(asking, message)
  return found
}

/** Both records of a pair, described, which is what a survivor is picked from. */
export function printPair<T> (asking: Asking<T>, one: T, other: T): void {
  for (const record of [one, other]) {
    const described = asking.describe(record)
    console.log('')
    console.log(styles.important(described.name))
    console.log(styles.light(described.description))
  }
}

/**
 * Which of two records survives, both of them printed first.
 *
 * Always asked, arguments or not: it is the one decision a merge cannot take back, and a
 * pair read out of the report carries no opinion about it. The second record is the
 * default, so the line the report prints answers itself.
 */
export async function askSurvivor<T> (asking: Asking<T>, one: T, other: T): Promise<Pair<T> | null> {
  if (one === other) {
    console.log(styles.warning('That is one record, twice.'))
    return null
  }

  printPair(asking, one, other)

  console.log('')
  const into = await select<T>({
    message: 'Survives',
    default: other,
    choices: [one, other].map(record => ({ name: asking.nameOf(record), value: record }))
  })
  return { from: into === one ? other : one, into }
}

/** Which two records, from the duplicate report or by name, and which way round. */
export async function askPair<T> (asking: Asking<T>, given: Pair<T> | null): Promise<Pair<T> | null> {
  if (asking.records.length < 2) {
    console.log(styles.warning(`Fewer than two ${asking.kind}s in the data.`))
    return null
  }

  if (given !== null) return askSurvivor(asking, given.from, given.into)

  const picked = asking.pairs.length === 0
    ? null
    : await select<{ one: T, other: T } | null>({
      message: 'Pair',
      choices: [
        ...asking.pairs.map(pair => ({
          name: `${asking.nameOf(pair.one)} / ${asking.nameOf(pair.other)}`,
          description: pair.reason,
          value: { one: pair.one, other: pair.other }
        })),
        { name: 'another pair', value: null }
      ]
    })
  if (picked === null) {
    const one = await askByName(asking, 'From')
    const other = await askByName(asking, 'Into')
    return askSurvivor(asking, one, other)
  }
  return askSurvivor(asking, picked.one, picked.other)
}

/** Two lists joined, in order, with nothing said twice. */
export function union<T> (kept: T[], added: T[], sameAs: (one: T, other: T) => boolean): T[] {
  const joined = [...kept]
  for (const candidate of added) {
    if (joined.some(found => sameAs(found, candidate))) continue
    joined.push(candidate)
  }
  return joined
}

const same = (one: string, other: string): boolean => one === other

/** The artists of a database, as a pair is asked for. */
export function askingArtists (db: Db): Asking<Artist> {
  return {
    kind: 'artist',
    records: db.artists,
    pairs: findDuplicates(db).pairs.flatMap(pair => pair.collection === 'artists' ? [pair] : []),
    describe: artist => describeArtist(artist, db),
    nameOf: artist => artist.name,
    aliasesOf: artist => artist.nameAliases
  }
}

/** The works of a database, as a pair is asked for. */
export function askingSongs (db: Db): Asking<Song> {
  return {
    kind: 'song',
    records: db.songs,
    pairs: findDuplicates(db).pairs.flatMap(pair => pair.collection === 'songs' ? [pair] : []),
    describe: song => describeSong(song, db),
    nameOf: song => song.title,
    aliasesOf: song => song.titleAliases
  }
}

/**
 * Joins two artists and repoints every credit onto the survivor.
 *
 * The name the merge drops is kept as an alias, since it is how the blog once credited the
 * record and the one thing a merge would otherwise lose. The loser's slug is dropped
 * rather than repointed: `findSlug` answers with the first line it meets, so a second slug
 * for one artist is a URL nothing would ever serve.
 *
 * Answers false when the confirmation was declined, with nothing written.
 */
export async function mergeArtists (db: Db, pair: Pair<Artist>): Promise<boolean> {
  const { from, into } = pair

  const merged: Artist = {
    ...into,
    nameAliases: union(into.nameAliases, [from.name, ...from.nameAliases], same)
      .filter(alias => alias !== into.name),
    sources: union(into.sources, from.sources, (one, other) => one.url === other.url)
  }

  function repoint (ids: ArtistId[]): ArtistId[] {
    if (!ids.includes(from.id)) return ids
    const kept: ArtistId[] = []
    for (const id of ids) {
      const moved = id === from.id ? into.id : id
      if (!kept.includes(moved)) kept.push(moved)
    }
    return kept
  }

  const recordings: Recording[] = db.recordings.map(recording => ({
    ...recording,
    byArtistIds: repoint(recording.byArtistIds),
    featuringArtistIds: repoint(recording.featuringArtistIds),
    remixedByArtistIds: repoint(recording.remixedByArtistIds)
  }))
  const songs = db.songs.map(song => ({ ...song, originalArtistIds: repoint(song.originalArtistIds) }))
  const artists = db.artists
    .filter(candidate => candidate.id !== from.id)
    .map(candidate => candidate.id === into.id ? merged : candidate)
  const slugs = db.slugs.filter(slug => slug.targetId !== from.id)

  const credits = recordings.filter((recording, index) =>
    JSON.stringify(recording) !== JSON.stringify(db.recordings[index])).length
  const claims = songs.filter((song, index) =>
    JSON.stringify(song) !== JSON.stringify(db.songs[index])).length
  const dropped = db.slugs.length - slugs.length

  console.log('')
  console.log(styles.info('Merged'))
  printRecords({ artists: [merged] })

  console.log('')
  console.log(styles.light(`> ${credits} recording${credits === 1 ? '' : 's'} recredited`))
  console.log(styles.light(`> ${claims} song${claims === 1 ? '' : 's'} reclaimed`))
  console.log(styles.light(`> ${dropped} slug line${dropped === 1 ? '' : 's'} dropped`))
  console.log(styles.light(`> ${describeArtist(from, db).name} leaves the data`))

  console.log('')
  console.log(styles.danger('artists.ndjson, slugs.ndjson, songs.ndjson and recordings.ndjson are rewritten whole.'))

  if (!await confirm({ message: 'Merge?', default: false })) {
    console.log(styles.warning('Nothing written.'))
    return false
  }

  // The credits first, so nothing is ever left pointing at an artist that has gone.
  await write('recordings', recordings)
  await write('songs', songs)
  await write('artists', artists)
  await write('slugs', slugs)

  console.log('')
  console.log(styles.title('Artists merged.'))
  console.log(styles.success(`${artists.length} artists in the data`))
  return true
}

/**
 * Joins two works and repoints every recording of them onto the survivor.
 *
 * The title the merge drops becomes an alias, which is what the import's own mistake asks
 * for: `Boots (Original Melody)` was never another work, it was what one take was released
 * as. Who the work is originally by is asked when the two records disagree. Nothing else
 * is: a work carries a title, its aliases and what it is built on, and all three join.
 *
 * Answers false when the confirmation was declined, with nothing written.
 */
export async function mergeSongs (db: Db, pair: Pair<Song>): Promise<boolean> {
  const { from, into } = pair

  function claim (ids: ArtistId[]): string {
    if (ids.length === 0) return 'unclaimed'
    return ids.map(id => findArtistById(id, db.artists)?.name ?? id).join(', ')
  }

  const sameClaim = claim(into.originalArtistIds) === claim(from.originalArtistIds)
  const originalArtistIds = sameClaim
    ? into.originalArtistIds
    : await select<ArtistId[]>({
      message: 'Originally',
      default: into.originalArtistIds,
      choices: [
        { name: claim(into.originalArtistIds), value: into.originalArtistIds },
        { name: claim(from.originalArtistIds), value: from.originalArtistIds },
        {
          name: claim([...into.originalArtistIds, ...from.originalArtistIds]),
          value: union(into.originalArtistIds, from.originalArtistIds, same)
        }
      ]
    })

  const merged: Song = {
    ...into,
    titleAliases: union(into.titleAliases, [from.title, ...from.titleAliases], same)
      .filter(alias => alias !== into.title),
    originalArtistIds,
    // A work merged into one it was derived from would otherwise be built on itself.
    derivedFromSongIds: union(into.derivedFromSongIds, from.derivedFromSongIds, same)
      .filter(id => id !== into.id && id !== from.id),
    sources: union(into.sources, from.sources, (one, other) => one.url === other.url)
  }

  function repoint (ids: SongId[]): SongId[] {
    if (!ids.includes(from.id)) return ids
    const kept: SongId[] = []
    for (const id of ids) {
      const moved = id === from.id ? into.id : id
      if (!kept.includes(moved)) kept.push(moved)
    }
    return kept
  }

  const recordings = db.recordings.map(recording => recording.songId === from.id
    ? { ...recording, songId: into.id }
    : recording)
  const songs = db.songs
    .filter(candidate => candidate.id !== from.id)
    .map(candidate => candidate.id === into.id
      ? merged
      : { ...candidate, derivedFromSongIds: repoint(candidate.derivedFromSongIds) })

  const moved = db.recordings.filter(recording => recording.songId === from.id).length
  const rebuilt = songs.filter(song => song.id !== into.id
    && JSON.stringify(song) !== JSON.stringify(db.songs.find(candidate => candidate.id === song.id))).length

  console.log('')
  console.log(styles.info('Merged'))
  printRecords({ songs: [merged] })

  console.log('')
  console.log(styles.light(`> ${moved} recording${moved === 1 ? '' : 's'} repointed`))
  console.log(styles.light(`> ${rebuilt} song${rebuilt === 1 ? '' : 's'} built on it rewritten`))
  console.log(styles.light(`> ${from.title} leaves the data`))

  console.log('')
  console.log(styles.danger('songs.ndjson and recordings.ndjson are rewritten whole.'))

  if (!await confirm({ message: 'Merge?', default: false })) {
    console.log(styles.warning('Nothing written.'))
    return false
  }

  // The recordings first, so nothing is ever left pointing at a work that has gone.
  await write('recordings', recordings)
  await write('songs', songs)

  console.log('')
  console.log(styles.title('Songs merged.'))
  console.log(styles.success(`${songs.length} songs in the data`))
  return true
}
