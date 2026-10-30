/**
 * What the front reads at runtime, from `dist/data` as `build:data` wrote it.
 */

import type {
  BuiltManifest,
  BuiltPost,
  BuiltPostIndexEntry,
  BuiltPostPage
} from '../../../types/built.js'

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

export type PostPage = {
  posts: BuiltPost[]
  page: number
  pageCount: number
}

/**
 * One page of the stream, posts included.
 *
 * The index says how many pages there are and which ten this one holds; the ten files are
 * then fetched together. A page outside the range is clamped rather than refused — the URL
 * may be stale, the stream having moved since it was shared.
 */
export async function fetchPostPage (page: number): Promise<PostPage> {
  const [entries, manifest] = await Promise.all([
    fetchPublishedPosts(),
    readJson<BuiltManifest>('/data/manifest.json')
  ])
  const pageCount = Math.max(1, Math.ceil(entries.length / manifest.pageSize))
  const wanted = Number.isFinite(page) ? Math.min(Math.max(1, Math.trunc(page)), pageCount) : 1
  const start = (wanted - 1) * manifest.pageSize
  const pages = await Promise.all(entries
    .slice(start, start + manifest.pageSize)
    .map(async entry => await readJson<BuiltPostPage>(`/data/post/${entry.id}.json`)))
  return { posts: pages.map(({ post }) => post), page: wanted, pageCount }
}
