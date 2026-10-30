/**
 * What the build emits and the front reads.
 *
 * Nothing here is stored: `build:data` derives all of it from `data/`, resolving every id
 * on the way out so that one page of the blog is one fetch and the browser never joins two
 * files. Posts that are hidden or still in the future never reach these shapes at all.
 */

import type { RouteKind } from '../routes/index.js'
import type {
  ArtistId,
  PartialDate,
  Place,
  PostId,
  RecordingId,
  RecordingKind,
  Slug,
  SongId,
  Source,
  Timestamp
} from './index.js'

/** An artist as a credit line: named, addressable, nothing else. */
export type BuiltArtist = {
  id: ArtistId
  name: string
  slug: Slug['slug']
  url: string
}

/**
 * One post, with everything it takes to display it.
 *
 * @property title - `Artist — Song`, which is both the headline and what a shell's
 * `<title>` says.
 * @property isCover - Whether the credits differ from the work's original artists. Derived
 * here so the front never has to reason about it.
 */
export type BuiltPost = {
  id: PostId
  url: string
  publishedOn: Timestamp
  title: string
  song: { id: SongId, title: string }
  credits: BuiltArtist[]
  featuring: BuiltArtist[]
  remixedBy: BuiltArtist[]
  originalArtists: BuiltArtist[]
  isCover: boolean
  recording: {
    id: RecordingId
    kind: RecordingKind | null
    performedOn: PartialDate | null
    performedAt: Place | null
    sources: Source[]
  }
}

/** A page of the stream, newest first. */
export type BuiltPage = {
  page: number
  pageCount: number
  postCount: number
  posts: BuiltPost[]
}

/** One post on its own. */
export type BuiltPostPage = {
  post: BuiltPost
}

/** One artist, and every post they appear on, credited or featured or remixing. */
export type BuiltArtistPage = {
  artist: BuiltArtist
  posts: BuiltPost[]
}

/** The lean lines `/posts` lists, without the sources an embed would need. */
export type BuiltPostIndexEntry = {
  id: PostId
  url: string
  publishedOn: Timestamp
  title: string
  kind: RecordingKind | null
  isCover: boolean
}

/** The lean lines `/artists` lists. */
export type BuiltArtistIndexEntry = BuiltArtist & {
  postCount: number
}

/** What the blog says about itself, and the only built file that is prose. */
export type BuiltAbout = {
  title: string
  description: string
  paragraphs: string[]
}

/** One URL `build:shells` writes a file for, and what that file should say it is. */
export type BuiltRoute = {
  url: string
  kind: RouteKind
  title: string
  description: string
}

/** Everything a page might want before it knows which page it is. */
export type BuiltManifest = {
  about: BuiltAbout
  pageSize: number
  pageCount: number
  postCount: number
  artistCount: number
  builtAt: Timestamp
}
