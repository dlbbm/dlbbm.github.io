/**
 * Reading the database against itself.
 *
 * Three questions, each answered as a list rather than as a verdict: which ids point at
 * nothing, which records nothing points at, and which pairs look like one thing entered
 * twice. Nothing here writes — `data:check` prints what these return, and `artist:merge`
 * and `song:merge` are what act on the third.
 */

import { existsSync } from 'node:fs'
import { readdir } from 'node:fs/promises'
import path from 'node:path'
import type { Artist, Recording, Slug, Song } from '../../shared/types/index.js'
import { CWD, FILES } from '../_config/index.js'
import type { Db } from '../_db/index.js'
import { slugify } from '../_slug/index.js'

/** Something that reads wrong: what holds it, and what is the matter with it. */
export type Finding = {
  where: string
  says: string
}

function duplicatedIds (records: Array<{ id: string }>): string[] {
  const seen = new Set<string>()
  const twice = new Set<string>()
  for (const record of records) {
    if (seen.has(record.id)) twice.add(record.id)
    else seen.add(record.id)
  }
  return [...twice]
}

function creditsOf (recording: Recording): Array<[string, string[]]> {
  return [
    ['byArtistIds', recording.byArtistIds],
    ['featuringArtistIds', recording.featuringArtistIds],
    ['remixedByArtistIds', recording.remixedByArtistIds]
  ]
}

/**
 * Every id that resolves to nothing, and every stored file that is not on disk.
 *
 * The data is hand-editable, so a mistyped id stays silent until a build drops a page:
 * this is the pass that makes it loud. An id repeated inside one collection is reported
 * here too — two records answering to one id is the same class of mistake.
 */
export function findDanglingReferences (db: Db): Finding[] {
  const findings: Finding[] = []
  const artists = new Set(db.artists.map(artist => artist.id))
  const songs = new Set(db.songs.map(song => song.id))
  const recordings = new Set(db.recordings.map(recording => recording.id))

  const collections: Array<[string, Array<{ id: string }>]> = [
    ['artist', db.artists],
    ['song', db.songs],
    ['recording', db.recordings],
    ['post', db.posts]
  ]
  for (const [name, records] of collections) {
    for (const id of duplicatedIds(records)) {
      findings.push({ where: `${name} ${id}`, says: 'is the id of more than one record' })
    }
  }

  for (const post of db.posts) {
    if (!recordings.has(post.recordingId)) {
      findings.push({
        where: `post ${post.id}`,
        says: `recordingId ${post.recordingId} is in no recording`
      })
    }
  }

  for (const recording of db.recordings) {
    if (!songs.has(recording.songId)) {
      findings.push({
        where: `recording ${recording.id}`,
        says: `songId ${recording.songId} is in no song`
      })
    }
    for (const [field, ids] of creditsOf(recording)) {
      for (const id of ids) {
        if (artists.has(id)) continue
        findings.push({
          where: `recording ${recording.id}`,
          says: `${field} holds ${id}, which is in no artist`
        })
      }
    }
    for (const source of recording.sources) {
      if (source.nature !== 'file') continue
      if (existsSync(path.join(CWD, source.path))) continue
      findings.push({
        where: `recording ${recording.id}`,
        says: `file ${source.path} is not on disk`
      })
    }
  }

  for (const song of db.songs) {
    for (const id of song.originalArtistIds) {
      if (artists.has(id)) continue
      findings.push({
        where: `song ${song.id}`,
        says: `originalArtistIds holds ${id}, which is in no artist`
      })
    }
    for (const id of song.derivedFromSongIds) {
      if (songs.has(id)) continue
      findings.push({
        where: `song ${song.id}`,
        says: `derivedFromSongIds holds ${id}, which is in no song`
      })
    }
  }

  for (const slug of db.slugs) {
    if (slug.kind !== 'artist' || artists.has(slug.targetId)) continue
    findings.push({
      where: `slug ${slug.kind}/${slug.slug}`,
      says: `targetId ${slug.targetId} is in no artist`
    })
  }

  return findings
}

/** A record nothing points at any more. The report names it; deleting it is answered for. */
export type Orphan =
  | { collection: 'recordings', record: Recording }
  | { collection: 'songs', record: Song }
  | { collection: 'artists', record: Artist }
  | { collection: 'slugs', record: Slug }

/**
 * What an edit leaves behind: a record the graph no longer reaches.
 *
 * A work kept alive by another work's `derivedFromSongIds` is not one, even with no
 * recording of its own — a medley names parts this blog may never have posted. There is no
 * cascade either: deleting an orphan recording can strand its work, and the next run is
 * what says so, which is also what keeps one answer from deleting two records.
 */
export function findOrphans (db: Db): Orphan[] {
  const orphans: Orphan[] = []
  const posted = new Set(db.posts.map(post => post.recordingId))
  const recorded = new Set(db.recordings.map(recording => recording.songId))
  const derived = new Set(db.songs.flatMap(song => song.derivedFromSongIds))
  const artists = new Set(db.artists.map(artist => artist.id))
  const credited = new Set<string>()
  for (const recording of db.recordings) {
    for (const [, ids] of creditsOf(recording)) {
      for (const id of ids) credited.add(id)
    }
  }
  for (const song of db.songs) {
    for (const id of song.originalArtistIds) credited.add(id)
  }

  for (const recording of db.recordings) {
    if (!posted.has(recording.id)) orphans.push({ collection: 'recordings', record: recording })
  }
  for (const song of db.songs) {
    if (!recorded.has(song.id) && !derived.has(song.id)) orphans.push({ collection: 'songs', record: song })
  }
  for (const artist of db.artists) {
    if (!credited.has(artist.id)) orphans.push({ collection: 'artists', record: artist })
  }
  for (const slug of db.slugs) {
    if (slug.kind === 'artist' && !artists.has(slug.targetId)) {
      orphans.push({ collection: 'slugs', record: slug })
    }
  }
  return orphans
}

/**
 * Stored files nothing points at, as repository-relative paths.
 *
 * Reported and never deleted: the only fix is unlinking a file, which is not what the
 * other three passes do, and nothing in the archive is a stored file yet.
 */
export async function findStrandedFiles (db: Db): Promise<string[]> {
  if (!existsSync(FILES)) return []
  const stored = new Set(db.recordings.flatMap(recording =>
    recording.sources.flatMap(source => source.nature === 'file' ? [source.path] : [])))
  const entries = await readdir(FILES, { recursive: true, withFileTypes: true })
  return entries
    .filter(entry => entry.isFile())
    .map(entry => path
      .relative(CWD, path.join(entry.parentPath, entry.name))
      .split(path.sep)
      .join('/'))
    .filter(found => !stored.has(found))
}

const ARTICLES = new Set(['the', 'a', 'an', 'le', 'la', 'les', 'el', 'los', 'las'])
const CONJUNCTIONS = new Set(['and', 'et', 'y'])

/**
 * What two names are compared on. Never stored, never shown, and never a URL.
 *
 * `slugify` folds case, diacritics and punctuation; this drops what the archive varies on
 * top of that — a leading article, a spelled-out conjunction, a guest tail — so
 * `The Velvet Underground` meets `Velvet Underground` and `Polo & Pan` meets
 * `Polo and Pan`.
 */
export function comparisonKey (name: string): string {
  const dashed = slugify(name)
  const guest = dashed.search(/-(?:ft|feat|featuring)-/v)
  const credit = guest === -1 ? dashed : dashed.slice(0, guest)
  const parts = credit.split('-').filter(part => !CONJUNCTIONS.has(part))
  const [first] = parts
  const named = first !== undefined && parts.length > 1 && ARTICLES.has(first)
    ? parts.slice(1)
    : parts
  return named.join('-')
}

/** A title with its trailing parenthesis dropped: `Boots (Original Melody)` gives `Boots`. */
function withoutQualifier (name: string): string | null {
  return /^(.*\S)\s*\([^\(\)]*\)\s*$/v.exec(name)?.[1] ?? null
}

/**
 * How many single-character edits separate two keys, counted no further than `max`.
 *
 * Anything beyond it returns `max + 1`: the report only ever asks whether a pair is one or
 * two letters apart, so the rest of the matrix is work nobody reads.
 */
function editDistance (one: string, other: string, max: number): number {
  if (Math.abs(one.length - other.length) > max) return max + 1
  let previous = Array.from({ length: other.length + 1 }, (_, index) => index)
  for (let row = 1; row <= one.length; row += 1) {
    const current = [row]
    for (let column = 1; column <= other.length; column += 1) {
      const substitution = (previous[column - 1] ?? 0) + (one[row - 1] === other[column - 1] ? 0 : 1)
      const insertion = (current[column - 1] ?? 0) + 1
      const deletion = (previous[column] ?? 0) + 1
      current[column] = Math.min(substitution, insertion, deletion)
    }
    if (Math.min(...current) > max) return max + 1
    previous = current
  }
  return previous[other.length] ?? max + 1
}

type Candidate = {
  id: string
  name: string
  aliases: string[]
}

type Keyed = {
  id: string
  key: string
  bare: string
  aliases: string[]
}

/**
 * Pairs that may be one record, strongest reason first.
 *
 * Four rules, and only the last is a resemblance: two names folding to one key, a name
 * that is already the other's alias, two names differing by a trailing parenthesis, and
 * then one or two letters apart — one only from five characters up, where `Gun` stops
 * meeting `The Sun`, and two only past twelve, where a typo is likelier than a different
 * name. No score and no threshold to tune: each pair carries the rule that found it, so a
 * wrong one is dismissed by reading it.
 *
 * A name `slugify` cannot read at all keys to `untitled`, which says nothing about what it
 * says: those are left out rather than matched against each other.
 */
function pairsAmong (candidates: Candidate[]): Array<{ one: string, other: string, reason: string }> {
  const keyed: Keyed[] = candidates
    .map(candidate => ({
      id: candidate.id,
      key: comparisonKey(candidate.name),
      bare: comparisonKey(withoutQualifier(candidate.name) ?? candidate.name),
      aliases: candidate.aliases.map(alias => comparisonKey(alias))
    }))
    .filter(candidate => candidate.key !== 'untitled')
  const found = new Map<string, { one: string, other: string, reason: string }>()
  const remember = (one: Keyed, other: Keyed, reason: string): void => {
    const at = [one.id, other.id].sort().join('::')
    if (!found.has(at)) found.set(at, { one: one.id, other: other.id, reason })
  }
  for (const [index, one] of keyed.entries()) {
    for (const other of keyed.slice(index + 1)) {
      if (one.key === other.key) { remember(one, other, 'one name once folded'); continue }
      if (other.aliases.includes(one.key) || one.aliases.includes(other.key)) {
        remember(one, other, 'the name of one is an alias of the other')
        continue
      }
      if (one.bare === other.bare) { remember(one, other, 'one name but for a parenthesis'); continue }
      const shortest = Math.min(one.key.length, other.key.length)
      if (shortest < 5) continue
      const max = shortest > 12 ? 2 : 1
      const distance = editDistance(one.key, other.key, max)
      if (distance > max) continue
      remember(one, other, distance === 1 ? 'one letter apart' : 'two letters apart')
    }
  }
  return [...found.values()]
}

/**
 * How much of the database leans on a record.
 *
 * Only used to order a pair, lightest first, so the one that looks like the leftover is
 * named first and `<from> <into>` reads the way a merge usually goes.
 */
function weightOf (db: Db, record: Artist | Song): number {
  const credited = db.recordings.filter(recording =>
    creditsOf(recording).some(([, ids]) => ids.includes(record.id))).length
  const original = db.songs.filter(song => song.originalArtistIds.includes(record.id)).length
  const recorded = db.recordings.filter(recording => recording.songId === record.id).length
  const derived = db.songs.filter(song => song.derivedFromSongIds.includes(record.id)).length
  return credited + original + recorded + derived
}

/** Two records put side by side, and the rule that put them there. */
export type DuplicatePair =
  | { collection: 'artists', one: Artist, other: Artist, reason: string }
  | { collection: 'songs', one: Song, other: Song, reason: string }

/** What a duplicate report holds: pairs to decide on, and slug lines written twice. */
export type Duplicates = {
  pairs: DuplicatePair[]
  slugLines: Array<{ slug: Slug, times: number }>
}

/**
 * What may be one thing entered twice: artists, works, and the slug file read byte for
 * byte.
 *
 * The exactly repeated slug lines are a defect rather than a question — `data:import`
 * minted each artist's slug and pushed it twice — so they are counted apart from the
 * pairs, which are the ones a human answers.
 */
export function findDuplicates (db: Db): Duplicates {
  const artists = new Map(db.artists.map(artist => [artist.id, artist]))
  const songs = new Map(db.songs.map(song => [song.id, song]))

  const artistPairs = pairsAmong(db.artists.map(artist => ({
    id: artist.id,
    name: artist.name,
    aliases: artist.nameAliases
  })))
  const songPairs = pairsAmong(db.songs.map(song => ({
    id: song.id,
    name: song.title,
    aliases: song.titleAliases
  })))

  const pairs: DuplicatePair[] = []
  for (const pair of artistPairs) {
    const found = [artists.get(pair.one), artists.get(pair.other)]
      .filter((record): record is Artist => record !== undefined)
      .sort((one, other) => weightOf(db, one) - weightOf(db, other))
    const [one, other] = found
    if (one === undefined || other === undefined) continue
    pairs.push({ collection: 'artists', one, other, reason: pair.reason })
  }
  for (const pair of songPairs) {
    const found = [songs.get(pair.one), songs.get(pair.other)]
      .filter((record): record is Song => record !== undefined)
      .sort((one, other) => weightOf(db, one) - weightOf(db, other))
    const [one, other] = found
    if (one === undefined || other === undefined) continue
    pairs.push({ collection: 'songs', one, other, reason: pair.reason })
  }

  // Two artists holding one slug string would answer one URL with two pages, which no
  // minting can produce and a hand edit can.
  const bySlug = new Map<string, Set<string>>()
  for (const slug of db.slugs) {
    const at = `${slug.kind}/${slug.slug}`
    bySlug.set(at, (bySlug.get(at) ?? new Set()).add(slug.targetId))
  }
  for (const [at, targets] of bySlug) {
    if (targets.size < 2) continue
    const [one, other] = [...targets]
    const first = one === undefined ? undefined : artists.get(one)
    const second = other === undefined ? undefined : artists.get(other)
    if (first === undefined || second === undefined) continue
    pairs.push({ collection: 'artists', one: first, other: second, reason: `both answer to ${at}` })
  }

  const counted = new Map<string, { slug: Slug, times: number }>()
  for (const slug of db.slugs) {
    const at = `${slug.kind}/${slug.targetId}/${slug.slug}`
    const seen = counted.get(at)
    if (seen === undefined) counted.set(at, { slug, times: 1 })
    else seen.times += 1
  }

  return {
    pairs,
    slugLines: [...counted.values()].filter(line => line.times > 1)
  }
}
