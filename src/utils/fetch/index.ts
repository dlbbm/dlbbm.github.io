/**
 * What the front reads at runtime, from `dist/data` as `build:data` wrote it.
 */

import type {
  BuiltAbout,
  BuiltArtist,
  BuiltArtistIndexEntry,
  BuiltArtistPage,
  BuiltManifest,
  BuiltPost,
  BuiltPostIndexEntry,
  BuiltPostPage
} from '../../../shared/types/built.js'
import type { PostId, Timestamp } from '../../../shared/types/index.js'
import { previewing } from '../preview/index.js'

async function readJson<T> (url: string): Promise<T> {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`${url} answered ${response.status}.`)
  return await response.json() as T
}

/**
 * Whether a post is the reader's to see — its moment has come, or the page is previewing.
 *
 * A scheduled post ships with the build, so withholding it is the front's job, and
 * `?preview` is what hands it over before its date. Timestamps carry an offset, which is
 * why the comparison parses rather than compares strings.
 */
export function isVisible (entry: { publishedOn: Timestamp }): boolean {
  return previewing || Date.parse(entry.publishedOn) <= Date.now()
}

/** The stream, in order, without the posts whose moment has not come. */
export async function fetchPublishedPosts (): Promise<BuiltPostIndexEntry[]> {
  const entries = await readJson<BuiltPostIndexEntry[]>('/data/posts.json')
  return entries.filter(entry => isVisible(entry))
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

/**
 * One post, or `null` when there is none to show.
 *
 * A scheduled post is `null` here as it is absent from the stream: it ships with the
 * build and the front is what withholds it, so the test is the same one the index makes.
 * A request that fails is `null` too — on a site served as files, a post that cannot be
 * read is a post that is not there.
 */
export async function fetchPost (id: PostId): Promise<BuiltPost | null> {
  try {
    const { post } = await readJson<BuiltPostPage>(`/data/post/${id}.json`)
    return isVisible(post) ? post : null
  } catch {
    return null
  }
}

export type ArtistPage = {
  artist: BuiltArtist
  posts: BuiltPost[]
}

/**
 * One artist and everything they appear on, newest first.
 *
 * The index the build writes holds lean entries; the stream wants whole posts, so each
 * one is fetched. No pagination and no slicing: an artist has a handful of posts here,
 * never a stream's worth. Scheduled posts are dropped the way they are everywhere else.
 */
export async function fetchArtistPage (slug: string): Promise<ArtistPage | null> {
  try {
    const page = await readJson<BuiltArtistPage>(`/data/artist/${slug}.json`)
    const posts = await Promise.all(page.posts
      .filter(entry => isVisible(entry))
      .map(async entry => (await readJson<BuiltPostPage>(`/data/post/${entry.id}.json`)).post))
    return { artist: page.artist, posts }
  } catch {
    return null
  }
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
