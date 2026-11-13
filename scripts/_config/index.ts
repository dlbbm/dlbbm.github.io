import path from 'node:path'
import process from 'node:process'

export const CWD = process.cwd()
export const DATA = path.join(CWD, 'data')
export const DIST = path.join(CWD, 'dist')
export const DIST_DATA = path.join(DIST, 'data')

/** How many posts a page of the stream holds. The old blog showed ten. */
export const PAGE_SIZE = 10

export const FILES = path.join(DATA, 'files')

// A stored file sits under one directory per pair of hex characters of its hash, so no
// single directory ever holds more than 256 entries.
export const FILES_SHARD_DEPTH = 4

export const ABOUT_FILE = path.join(DATA, 'about.json')

// Outside `data/`, because it is not a record: free markdown, read and edited by hand
// as readily as by `idea`.
export const IDEAS_FILE = path.join(CWD, 'IDEAS.md')

// Outside `data/`: what MusicBrainz answered about each artist name, looked up once and
// stored, which is the whole input `data:names` compares the data against.
export const MUSICBRAINZ_FILE = path.join(CWD, '.musicbrainz.ndjson')

export const DATA_FILES = {
  artists: path.join(DATA, 'artists.ndjson'),
  slugs: path.join(DATA, 'slugs.ndjson'),
  songs: path.join(DATA, 'songs.ndjson'),
  recordings: path.join(DATA, 'recordings.ndjson'),
  posts: path.join(DATA, 'posts.ndjson')
} as const
