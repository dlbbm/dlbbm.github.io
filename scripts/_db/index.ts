/**
 * The database, which is a directory of newline-delimited JSON.
 *
 * One file per entity type, one record per line, appended in creation order. Nothing is
 * ever rewritten here: a correction is a hand edit on the line concerned, which is the
 * whole reason the format is one record per line.
 */

import { createHash, randomBytes } from 'node:crypto'
import { existsSync } from 'node:fs'
import { appendFile, copyFile, mkdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import type { Artist, Post, Recording, Song } from '../../types.js'
import { DATA, DATA_FILES, FILES } from '../_config/index.js'

export type Db = {
  artists: Artist[]
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
 * Takes a copy of a file into `data/files`, named after its contents.
 *
 * Returns the path to store, relative to the repository root, and nothing else — the same
 * file copied twice lands on the same name, which is the point of hashing the contents
 * rather than drawing an id.
 */
export async function storeFile (sourcePath: string): Promise<string> {
  const contents = await readFile(sourcePath)
  const hash = createHash('sha256').update(contents).digest('hex').slice(0, 16)
  const name = `${hash}${path.extname(sourcePath).toLowerCase()}`
  await mkdir(FILES, { recursive: true })
  await copyFile(sourcePath, path.join(FILES, name))
  return `data/files/${name}`
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

export async function readDb (): Promise<Db> {
  const [artists, songs, recordings, posts] = await Promise.all([
    readCollection<Artist>(DATA_FILES.artists),
    readCollection<Song>(DATA_FILES.songs),
    readCollection<Recording>(DATA_FILES.recordings),
    readCollection<Post>(DATA_FILES.posts)
  ])
  return { artists, songs, recordings, posts }
}

export async function append<K extends DbCollection> (collection: K, records: Db[K]): Promise<void> {
  if (records.length === 0) return
  await mkdir(DATA, { recursive: true })
  let lines = ''
  for (const record of records) { lines += `${JSON.stringify(record)}\n` }
  await appendFile(DATA_FILES[collection], lines, { encoding: 'utf-8' })
}
