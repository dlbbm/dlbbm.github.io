/**
 * Turns the database into the files the front fetches.
 *
 * Reads `data/`, writes `dist/data/`, and never the other way around: a missing slug is an
 * error telling you to run `data:generate-slugs`, not something invented here.
 *
 * Two kinds of post never make it out — one marked `hidden`, and one whose `publishedOn`
 * is still ahead of now. A record sitting in a public file is published whatever the page
 * does with it, so the filtering happens here rather than in the browser. Which also means
 * a scheduled post appears at the next build, not at the minute it names.
 */

import { existsSync } from 'node:fs'
import { cp, mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { styles } from '@design-edito/tools/agnostic/misc/logs/styles/index.js'
import { routeUrl, type RouteKind } from '../../routes/index.js'
import type {
  BuiltAbout,
  BuiltArtist,
  BuiltArtistIndexEntry,
  BuiltArtistPage,
  BuiltManifest,
  BuiltPage,
  BuiltPost,
  BuiltPostIndexEntry,
  BuiltPostPage,
  BuiltRoute
} from '../../types/built.js'
import type { Artist, Post, Recording, Song } from '../../types/index.js'
import { ABOUT_FILE, DATA_FILES, DIST_DATA, PAGE_SIZE } from '../_config/index.js'
import { toTimestamp } from '../_date/index.js'
import { readDb, readJson, type Db } from '../_db/index.js'
import { findSlug } from '../_slug/index.js'

const db: Db = await readDb()

console.log('')
console.log(styles.title('Building the data...'))

const about = await readJson<BuiltAbout>(ABOUT_FILE)
if (about === null) {
  console.log(styles.error(`${ABOUT_FILE} is missing or is not valid JSON.`))
  process.exit(1)
}

// An artist with no slug has no URL, which would make its page unreachable and its name
// unlinkable. Minting one here would hide the omission, so it stops the build instead.
const unslugged = db.artists.filter(artist => findSlug('artist', artist.id, db.slugs) === undefined)
if (unslugged.length > 0) {
  console.log(styles.error(`${unslugged.length} artist(s) have no slug:`))
  for (const artist of unslugged) { console.log(styles.light(`  ${artist.name}`)) }
  console.log(styles.warning('> npm run data:generate-slugs'))
  process.exit(1)
}

const now = toTimestamp(new Date())
const visible = db.posts
  .filter(post => !post.hidden && post.publishedOn <= now)
  .sort((one, other) => other.publishedOn.localeCompare(one.publishedOn))

function builtArtist (id: string): BuiltArtist | null {
  const artist: Artist | undefined = db.artists.find(candidate => candidate.id === id)
  const slug = findSlug('artist', id, db.slugs)
  if (artist === undefined || slug === undefined) return null
  return { id, name: artist.name, slug: slug.slug, url: routeUrl('artist', { slug: slug.slug }) }
}

function builtArtists (ids: string[]): BuiltArtist[] {
  return ids
    .map(builtArtist)
    .filter((artist): artist is BuiltArtist => artist !== null)
}

function builtPost (post: Post, recording: Recording, song: Song): BuiltPost {
  const credits = builtArtists(recording.byArtistIds)
  const originalArtists = builtArtists(song.originalArtistIds)
  const credited = credits.map(artist => artist.id).join(',')
  const original = originalArtists.map(artist => artist.id).join(',')
  return {
    id: post.id,
    url: routeUrl('post', { id: post.id }),
    publishedOn: post.publishedOn,
    title: `${credits.map(artist => artist.name).join(', ')} — ${song.title}`,
    song: { id: song.id, title: song.title },
    credits,
    featuring: builtArtists(recording.featuringArtistIds),
    remixedBy: builtArtists(recording.remixedByArtistIds),
    originalArtists,
    isCover: original !== '' && original !== credited,
    recording: {
      id: recording.id,
      kind: recording.kind,
      performedOn: recording.performedOn,
      performedAt: recording.performedAt,
      sources: recording.sources
    }
  }
}

const posts: BuiltPost[] = []
for (const post of visible) {
  const recording = db.recordings.find(candidate => candidate.id === post.recordingId)
  if (recording === undefined) {
    console.log(styles.error(`Post ${post.id} points at recording ${post.recordingId}, which is not in the data.`))
    process.exit(1)
  }
  const song = db.songs.find(candidate => candidate.id === recording.songId)
  if (song === undefined) {
    console.log(styles.error(`Recording ${recording.id} points at song ${recording.songId}, which is not in the data.`))
    process.exit(1)
  }
  posts.push(builtPost(post, recording, song))
}

const pageCount = Math.max(1, Math.ceil(posts.length / PAGE_SIZE))
const routes: BuiltRoute[] = []

function route (kind: RouteKind, url: string, title: string, description: string): void {
  routes.push({ kind, url, title, description })
}

async function emit (relativePath: string, contents: unknown): Promise<void> {
  const file = path.join(DIST_DATA, relativePath)
  await mkdir(path.dirname(file), { recursive: true })
  await writeFile(file, `${JSON.stringify(contents)}\n`, { encoding: 'utf-8' })
}

function describePost (post: BuiltPost): string {
  return [
    post.recording.kind,
    post.isCover ? `cover of ${post.originalArtists.map(artist => artist.name).join(', ')}` : null,
    `posted on ${post.publishedOn.slice(0, 10)}`
  ].filter((part): part is string => part !== null && part !== undefined).join(' · ')
}

// Everything is rewritten from scratch, so a post deleted or hidden since the last build
// leaves no file behind to be found by a stale link.
await rm(DIST_DATA, { recursive: true, force: true })

for (let page = 1; page <= pageCount; page += 1) {
  const slice = posts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const built: BuiltPage = { page, pageCount, postCount: posts.length, posts: slice }
  await emit(`page/${page}.json`, built)
  // Page one is the home page, and `/page/1` redirects to it, so it carries the same name.
  route(
    page === 1 ? 'home' : 'page',
    page === 1 ? routeUrl('home') : routeUrl('page', { page }),
    page === 1 ? about.title : `Page ${page} · ${about.title}`,
    about.description
  )
}

for (const post of posts) {
  const built: BuiltPostPage = { post }
  await emit(`post/${post.id}.json`, built)
  route('post', post.url, `${post.title} · ${about.title}`, describePost(post))
}

const appearsOn = (artist: BuiltArtist, post: BuiltPost): boolean =>
  [...post.credits, ...post.featuring, ...post.remixedBy].some(candidate => candidate.id === artist.id)

const artistEntries: BuiltArtistIndexEntry[] = []
for (const artist of db.artists) {
  const built = builtArtist(artist.id)
  if (built === null) continue
  const theirs = posts.filter(post => appearsOn(built, post))
  if (theirs.length === 0) continue
  const page: BuiltArtistPage = { artist: built, posts: theirs }
  await emit(`artist/${built.slug}.json`, page)
  artistEntries.push({ ...built, postCount: theirs.length })
  route('artist', built.url, `${built.name} · ${about.title}`, `${theirs.length} post(s)`)
}

const postIndex: BuiltPostIndexEntry[] = posts.map(post => ({
  id: post.id,
  url: post.url,
  publishedOn: post.publishedOn,
  title: post.title,
  kind: post.recording.kind,
  isCover: post.isCover
}))
await emit('posts.json', postIndex)
route('posts', routeUrl('posts'), `All posts · ${about.title}`, `${posts.length} posts`)

artistEntries.sort((one, other) => one.name.localeCompare(other.name))
await emit('artists.json', artistEntries)
route('artists', routeUrl('artists'), `Artists · ${about.title}`, `${artistEntries.length} artists`)

await emit('about.json', about)
route('about', routeUrl('about'), `About · ${about.title}`, about.description)

const manifest: BuiltManifest = {
  about,
  pageSize: PAGE_SIZE,
  pageCount,
  postCount: posts.length,
  artistCount: artistEntries.length,
  builtAt: now
}
await emit('manifest.json', manifest)
await emit('routes.json', routes)

// Media is carried across as it stands: the paths in the data are relative to the
// repository root, and `data/files/…` is what a source says.
const files = path.join(path.dirname(DATA_FILES.posts), 'files')
if (existsSync(files)) {
  await cp(files, path.join(DIST_DATA, 'files'), { recursive: true })
}

const held = db.posts.length - posts.length
console.log(styles.light(`> ${posts.length} posts over ${pageCount} page(s) of ${PAGE_SIZE}`))
console.log(styles.light(`> ${artistEntries.length} artists with a page, ${routes.length} urls`))
if (held > 0) { console.log(styles.warning(`${held} post(s) held back as hidden or still ahead of now`)) }
console.log('')
console.log(styles.success('Data built.'))
console.log('')
