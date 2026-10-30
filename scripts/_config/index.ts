import path from 'node:path'
import process from 'node:process'

export const CWD = process.cwd()
export const DATA = path.join(CWD, 'data')

export const FILES = path.join(DATA, 'files')

export const DATA_FILES = {
  artists: path.join(DATA, 'artists.ndjson'),
  songs: path.join(DATA, 'songs.ndjson'),
  recordings: path.join(DATA, 'recordings.ndjson'),
  posts: path.join(DATA, 'posts.ndjson')
} as const
