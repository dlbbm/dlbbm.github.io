/**
 * What the front reads at runtime, from `dist/data` as `build:data` wrote it.
 */

import type * as built from '../../shared/types/built.js'
import type { PostId, Timestamp } from '../../shared/types/index.js'
import * as preview from '../preview/index.js'

/** A 404: the file is not there, which is different from a read that failed. */
class MissingFile extends Error {
  constructor (url: string) {
    super(`${url} is not there.`)
    this.name = 'MissingFile'
  }
}

async function readJson<T> (url: string): Promise<T> {
  const response = await fetch(url)
  if (response.status === 404) throw new MissingFile(url)
  if (!response.ok) throw new Error(`${url} answered ${response.status}.`)
  return await response.json() as T
}

let manifestRead: Promise<built.Manifest> | null = null

/** Read once for the tab's life, since it cannot change while the page is open. A failed read is not kept, so the next caller asks again. */
async function readManifest (): Promise<built.Manifest> {
  manifestRead ??= readJson<built.Manifest>('/data/manifest.json')
  try {
    return await manifestRead
  } catch (error) {
    manifestRead = null
    throw error
  }
}

/** Timestamps carry an offset, which is why this parses rather than compares strings. */
function isPublished (entry: { publishedOn: Timestamp }): boolean {
  return Date.parse(entry.publishedOn) <= Date.now()
}

/** The stream, in order, without the posts whose moment has not come. */
export async function publishedPosts (): Promise<built.PostIndexEntry[]> {
  const entries = await readJson<built.PostIndexEntry[]>('/data/posts.json')
  return entries.filter(entry => preview.active || isPublished(entry))
}

/** What the blog says about itself, which the manifest carries with everything else. */
export async function about (): Promise<built.About> {
  const manifest = await readManifest()
  return manifest.about
}

/** Every artist with a page of their own, alphabetical as `build:data` sorted them. */
export async function artists (): Promise<built.ArtistIndexEntry[]> {
  return await readJson<built.ArtistIndexEntry[]>('/data/artists.json')
}

/** `null` covers both a scheduled post and a file that is not there; a failed read throws instead. */
export async function post (id: PostId): Promise<built.Post | null> {
  try {
    const { post: found } = await readJson<built.PostFile>(`/data/post/${id}.json`)
    return preview.active || isPublished(found) ? found : null
  } catch (error) {
    if (error instanceof MissingFile) return null
    throw error
  }
}

export type ArtistWithPosts = {
  artist: built.Artist
  posts: built.Post[]
}

/**
 * No pagination: an artist has a handful of posts, never a stream's worth. A post of
 * theirs that fails to read is a broken build, not a sign the artist does not exist, so it
 * throws rather than emptying the page.
 */
export async function artistWithPosts (slug: string): Promise<ArtistWithPosts | null> {
  let file: built.ArtistFile
  try {
    file = await readJson<built.ArtistFile>(`/data/artist/${slug}.json`)
  } catch (error) {
    if (error instanceof MissingFile) return null
    throw error
  }
  const posts = await Promise.all(file.posts
    .filter(entry => preview.active || isPublished(entry))
    .map(async entry => (await readJson<built.PostFile>(`/data/post/${entry.id}.json`)).post))
  return { artist: file.artist, posts }
}

export type StreamPage = {
  posts: built.Post[]
  page: number
  pageCount: number
  /** `false` leaves `posts` empty and clamps `page` to the nearest one that exists. */
  exists: boolean
}

/** A page outside the range is reported rather than refused: the stream may have moved since the URL was shared, and the caller decides what to show. */
export async function streamPage (page: number): Promise<StreamPage> {
  const [entries, manifest] = await Promise.all([
    publishedPosts(),
    readManifest()
  ])
  const pageCount = Math.max(1, Math.ceil(entries.length / manifest.pageSize))
  const exists = Number.isInteger(page) && page >= 1 && page <= pageCount
  const wanted = Number.isFinite(page) ? Math.min(Math.max(1, Math.trunc(page)), pageCount) : 1
  if (!exists) return { posts: [], page: wanted, pageCount, exists }
  const start = (wanted - 1) * manifest.pageSize
  const files = await Promise.all(entries
    .slice(start, start + manifest.pageSize)
    .map(async entry => await readJson<built.PostFile>(`/data/post/${entry.id}.json`)))
  return { posts: files.map(({ post: found }) => found), page: wanted, pageCount, exists }
}
