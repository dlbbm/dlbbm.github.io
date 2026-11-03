/**
 * What the front reads at runtime, from `dist/data` as `build:data` wrote it.
 */

import type {
  BuiltAbout,
  BuiltArtistIndexEntry,
  BuiltManifest,
  BuiltPost,
  BuiltPostIndexEntry,
  BuiltPostPage
} from '../../../shared/types/built.js'

async function readJson<T> (url: string): Promise<T> {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`${url} answered ${response.status}.`)
  return await response.json() as T
}

/**
 * The stream, in order, without the posts whose moment has not come.
 *
 * A scheduled post ships with the build, so dropping it is the front's job. Timestamps
 * carry an offset, which is why the comparison parses rather than compares strings.
 */
export async function fetchPublishedPosts (): Promise<BuiltPostIndexEntry[]> {
  const entries = await readJson<BuiltPostIndexEntry[]>('/data/posts.json')
  const now = Date.now()
  return entries.filter(entry => Date.parse(entry.publishedOn) <= now)
}

/** What the blog says about itself, which the manifest carries with everything else. */
export async function fetchAbout (): Promise<BuiltAbout> {
  const manifest = await readJson<BuiltManifest>('/data/manifest.json')
  return manifest.about
}

/** Every artist with a page of their own, alphabetical as `build:data` sorted them. */
export async function fetchArtists (): Promise<BuiltArtistIndexEntry[]> {
  return await readJson<BuiltArtistIndexEntry[]>('/data/artists.json')
}

export type PostPage = {
  posts: BuiltPost[]
  page: number
  pageCount: number
  /**
   * Whether the URL named a page there is. `false` leaves `posts` empty, and `page`
   * clamped to the nearest one that exists, so a reader is told they are nowhere and
   * still handed the way back.
   */
  exists: boolean
}

/**
 * One page of the stream, posts included.
 *
 * The index says how many pages there are and which ten this one holds; the ten files are
 * then fetched together. A page outside the range is **reported** and not refused — the
 * URL may be stale, the stream having moved since it was shared — so the caller decides
 * between showing the nearest page and saying there is none.
 */
export async function fetchPostPage (page: number): Promise<PostPage> {
  const [entries, manifest] = await Promise.all([
    fetchPublishedPosts(),
    readJson<BuiltManifest>('/data/manifest.json')
  ])
  const pageCount = Math.max(1, Math.ceil(entries.length / manifest.pageSize))
  const exists = Number.isInteger(page) && page >= 1 && page <= pageCount
  const wanted = Number.isFinite(page) ? Math.min(Math.max(1, Math.trunc(page)), pageCount) : 1
  if (!exists) return { posts: [], page: wanted, pageCount, exists }
  const start = (wanted - 1) * manifest.pageSize
  const pages = await Promise.all(entries
    .slice(start, start + manifest.pageSize)
    .map(async entry => await readJson<BuiltPostPage>(`/data/post/${entry.id}.json`)))
  return { posts: pages.map(({ post }) => post), page: wanted, pageCount, exists }
}
