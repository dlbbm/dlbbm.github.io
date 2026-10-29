/**
 * The database, which is a directory of newline-delimited JSON.
 *
 * One file per entity type, one record per line, appended in creation order. Nothing is
 * ever rewritten here: a correction is a hand edit on the line concerned, which is the
 * whole reason the format is one record per line.
 */

import { randomBytes } from 'node:crypto'
import { existsSync } from 'node:fs'
import { appendFile, mkdir, readFile } from 'node:fs/promises'
import type { Artist, Person, Post, Recording, Song } from '../../types.js'
import { DATA, DATA_FILES } from '../_config/index.js'

export type Db = {
  artists: Artist[]
  persons: Person[]
  songs: Song[]
  recordings: Recording[]
  posts: Post[]
}

export type DbCollection = keyof Db

/** Sixteen hex characters, drawn at creation and never derived from the record. */
export function createId (): string {
  return randomBytes(8).toString('hex')
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
  const [artists, persons, songs, recordings, posts] = await Promise.all([
    readCollection<Artist>(DATA_FILES.artists),
    readCollection<Person>(DATA_FILES.persons),
    readCollection<Song>(DATA_FILES.songs),
    readCollection<Recording>(DATA_FILES.recordings),
    readCollection<Post>(DATA_FILES.posts)
  ])
  return { artists, persons, songs, recordings, posts }
}

export async function append<K extends DbCollection> (collection: K, records: Db[K]): Promise<void> {
  if (records.length === 0) return
  await mkdir(DATA, { recursive: true })
  let lines = ''
  for (const record of records) { lines += `${JSON.stringify(record)}\n` }
  await appendFile(DATA_FILES[collection], lines, { encoding: 'utf-8' })
}
