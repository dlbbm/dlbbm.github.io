/**
 * What the front reads at runtime, from `dist/data` as `build:data` wrote it.
 */

import type { BuiltPostIndexEntry } from '../../types/built.js'

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
