/**
 * The database, which is a directory of newline-delimited JSON.
 *
 * One file per entity type, one record per line, appended in creation order. Nothing is
 * ever rewritten here: a correction is a hand edit on the line concerned, which is the
 * whole reason the format is one record per line.
 */

import { createHash, randomBytes } from 'node:crypto'
import { existsSync } from 'node:fs'
import { appendFile, copyFile, mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import type { Artist, Post, Recording, Slug, Song } from '../../shared/types/index.js'
import { DATA, DATA_FILES, FILES, FILES_SHARD_DEPTH } from '../_config/index.js'

export type Db = {
  artists: Artist[]
  slugs: Slug[]
  songs: Song[]
  recordings: Recording[]
  posts: Post[]
}

export type DbCollection = keyof Db

/** Sixteen hex characters, drawn at creation and never derived from the record. */
export function createId (): string {
  return randomBytes(8).toString('hex')
}

/**
 * Takes a copy of a file into `data/files`, named after its contents and filed under them.
 *
 * Returns the path to store, relative to the repository root, and nothing else — the same
 * file copied twice lands on the same path, which is the point of hashing the contents
 * rather than drawing an id.
 */
export async function storeFile (sourcePath: string): Promise<string> {
  const contents = await readFile(sourcePath)
  const hash = createHash('sha256').update(contents).digest('hex').slice(0, 16)
  const shards = Array
    .from({ length: FILES_SHARD_DEPTH }, (_, depth) => hash.slice(depth * 2, depth * 2 + 2))
  const name = `${hash}${path.extname(sourcePath).toLowerCase()}`
  await mkdir(path.join(FILES, ...shards), { recursive: true })
  await copyFile(sourcePath, path.join(FILES, ...shards, name))
  return ['data', 'files', ...shards, name].join('/')
}

async function readCollection<T> (filePath: string): Promise<T[]> {
  if (!existsSync(filePath)) return []
  const raw = await readFile(filePath, { encoding: 'utf-8' })
  const records: T[] = []
  for (const [index, line] of raw.split('\n').entries()) {
    const trimmed = line.trim()
    if (trimmed === '') continue
    try { records.push(JSON.parse(trimmed) as T) }
    catch { throw new Error(`${filePath}:${index + 1} is not valid JSON`) }
  }
  return records
}

/** A single JSON document, or `null` when there is none to read. */
export async function readJson<T> (filePath: string): Promise<T | null> {
  if (!existsSync(filePath)) return null
  try { return JSON.parse(await readFile(filePath, { encoding: 'utf-8' })) as T }
  catch { return null }
}

export async function readDb (): Promise<Db> {
  const [artists, slugs, songs, recordings, posts] = await Promise.all([
    readCollection<Artist>(DATA_FILES.artists),
    readCollection<Slug>(DATA_FILES.slugs),
    readCollection<Song>(DATA_FILES.songs),
    readCollection<Recording>(DATA_FILES.recordings),
    readCollection<Post>(DATA_FILES.posts)
  ])
  return { artists, slugs, songs, recordings, posts }
}

function toLines (records: object[]): string {
  let lines = ''
  for (const record of records) { lines += `${JSON.stringify(record)}\n` }
  return lines
}

export async function append<K extends DbCollection> (collection: K, records: Db[K]): Promise<void> {
  if (records.length === 0) return
  await mkdir(DATA, { recursive: true })
  await appendFile(DATA_FILES[collection], toLines(records), { encoding: 'utf-8' })
}

/**
 * Rewrites a collection's file whole.
 *
 * The one way out of append-only, and it is the caller's job to pass every record the file
 * should end up holding — editing a post and deleting one both come down to this.
 */
export async function write<K extends DbCollection> (collection: K, records: Db[K]): Promise<void> {
  await mkdir(DATA, { recursive: true })
  await writeFile(DATA_FILES[collection], toLines(records), { encoding: 'utf-8' })
}
