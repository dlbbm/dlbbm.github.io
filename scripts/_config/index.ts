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

// Also outside `data/`: the names `post:names-lookup`'s sweep walked past, waiting for a
// decision. A cache and not a record — `namesCheckedOn` is what says a post has been read,
// and deleting this costs the requests that filled it.
export const NAMES_PENDING_FILE = path.join(CWD, '.names-pending.ndjson')

// Not a cache: pairs `data:merge-duplicates` offered and was told apart, so the same two
// records are not asked about on every run. Only the ones left apart — a merged pair
// leaves nothing to remember, the two records being one by then. The decision has no
// other home — nothing in `data/` says two names were compared and found to be two things
// — so this is committed, hand-editable like the rest: dropping a line here is what makes
// a pair askable again.
export const REVIEWED_DUPLICATE_PAIRS_FILE = path.join(CWD, 'reviewed-duplicate-pairs.ndjson')

// Same idea for `data:places`: every venue or city string answered, `Enter` kept or
// renamed, so the walk does not offer it again. Committed and hand-editable.
export const REVIEWED_PLACES_FILE = path.join(CWD, 'reviewed-places.ndjson')

export const DATA_FILES = {
  artists: path.join(DATA, 'artists.ndjson'),
  slugs: path.join(DATA, 'slugs.ndjson'),
  songs: path.join(DATA, 'songs.ndjson'),
  recordings: path.join(DATA, 'recordings.ndjson'),
  posts: path.join(DATA, 'posts.ndjson')
} as const
