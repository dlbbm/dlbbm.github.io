/**
 * Turns the database into the files the front fetches.
 *
 * Reads `data/`, writes `dist/data/`, and never the other way around: a missing slug is an
 * error telling you to run `data:generate-slugs`, not something invented here.
 *
 * A post marked `hidden` never makes it out: it is a standing decision, so there is no
 * reason to ship it and nothing that would ever reveal it.
 *
 * A scheduled one does make it out, and the front is what withholds it — that is the only
 * way it can appear at the minute it names rather than at the next build. The cost is that
 * its JSON is readable before its date, which for this blog is a fair trade.
 *
 * Which is why nothing here is cut into pages. How many posts are displayable changes
 * between two builds, so a page cut here would read short, and a slab of a fixed size
 * would leave the front unable to say where page ten starts without reading the nine
 * before it. Instead `posts.json` is the whole stream in order, lean enough to fetch in
 * one go, and the front slices ten displayable posts out of it. The page shells still
 * cover the shipped count, which is an upper bound: an extra page renders empty until its
 * posts come of age.
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
const shipped = db.posts
  .filter(post => !post.hidden)
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

function indexEntry (post: BuiltPost): BuiltPostIndexEntry {
  return {
    id: post.id,
    url: post.url,
    publishedOn: post.publishedOn,
    title: post.title,
    kind: post.recording.kind,
    isCover: post.isCover
  }
}

const posts: BuiltPost[] = []
for (const post of shipped) {
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

// A url per page of the shipped stream, which is at least as many as the front will ever
// show. Nothing is emitted for them beyond the shell: the data is the index.
for (let page = 1; page <= pageCount; page += 1) {
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
  const page: BuiltArtistPage = { artist: built, posts: theirs.map(indexEntry) }
  await emit(`artist/${built.slug}.json`, page)
  artistEntries.push({ ...built, postCount: theirs.length })
  route('artist', built.url, `${built.name} · ${about.title}`, `${theirs.length} post(s)`)
}

// The stream itself, in order and whole: this is what pagination is computed from.
await emit('posts.json', posts.map(indexEntry))
route('posts', routeUrl('posts'), `All posts · ${about.title}`, `${posts.length} posts`)

artistEntries.sort((one, other) => one.name.localeCompare(other.name))
await emit('artists.json', artistEntries)
route('artists', routeUrl('artists'), `Artists · ${about.title}`, `${artistEntries.length} artists`)

await emit('about.json', about)
route('about', routeUrl('about'), `About · ${about.title}`, about.description)

const manifest: BuiltManifest = {
  about,
  pageSize: PAGE_SIZE,
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

const hidden = db.posts.length - posts.length
const scheduled = posts.filter(post => post.publishedOn > now).length
console.log(styles.light(`> ${posts.length} posts, ${pageCount} page url(s) of ${PAGE_SIZE}`))
console.log(styles.light(`> ${artistEntries.length} artists with a page, ${routes.length} urls`))
if (hidden > 0) { console.log(styles.warning(`${hidden} hidden post(s) left out`)) }
if (scheduled > 0) { console.log(styles.warning(`${scheduled} scheduled post(s) shipped, for the front to withhold until their date`)) }
console.log('')
console.log(styles.success('Data built.'))
console.log('')
