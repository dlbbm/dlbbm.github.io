/**
 * What the build emits and the front reads.
 *
 * Nothing here is stored: `build:data` derives all of it from `data/`, resolving every id
 * on the way out so the browser never joins two files.
 *
 * Pagination is the front's, not the build's. A hidden post never reaches these shapes,
 * but a scheduled one does — it has to, or it could not appear at the minute it names
 * without a rebuild — so how many posts are displayable is only known at runtime. The
 * front reads {@link PostIndexEntry} once, drops what is still ahead of now, and the
 * page it wants is a slice of what remains: always ten, whatever the build thought.
 */

import type * as routes from '../routes/index.js'
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
export type Artist = {
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
 * @property publishedOn - When the post goes out, and the one field the front must read
 * before displaying anything: a moment still ahead of now is a scheduled post, which is
 * shipped but not shown. Comparing the strings is enough, they are ordered as they read.
 * @property isCover - Whether the credits differ from the work's original artists. Derived
 * here so the front never has to reason about it.
 * @property derivedFrom - The works this one is built on, resolved, each with the artists
 * it belongs to. Empty for almost every post; two or more is a medley, which `isMedley`
 * says without the front counting. It is also how the post reaches the pages of artists it
 * never credits: a medley is its arranger's own work, and the pieces inside it are not.
 * @property song - The work, under its own title. What the post announces is the take's
 * title when it has one, which `title` already carries and `recording.title` holds raw.
 */
export type Post = {
  id: PostId
  url: string
  publishedOn: Timestamp
  title: string
  body: string | null
  song: { id: SongId, title: string }
  credits: Artist[]
  featuring: Artist[]
  remixedBy: Artist[]
  originalArtists: Artist[]
  isCover: boolean
  derivedFrom: { id: SongId, title: string, originalArtists: Artist[] }[]
  isMedley: boolean
  recording: {
    id: RecordingId
    title: string | null
    kind: RecordingKind | null
    performedOn: PartialDate | null
    performedAt: Place | null
    sources: Source[]
  }
}

/** The file one post is read from, holding nothing else. */
export type PostFile = {
  post: Post
}

/** The file one artist is read from: them, and every post they appear on. */
export type ArtistFile = {
  artist: Artist
  posts: PostIndexEntry[]
}

/**
 * One line of the stream: enough to order it, paginate it and list it, and no more.
 *
 * The whole list of these is one file, fetched once and filtered on `publishedOn`, which
 * is what makes a page of ten exactly ten. What it takes to display a post comes from
 * {@link PostFile}, one file per post, cached by id.
 */
export type PostIndexEntry = {
  id: PostId
  url: string
  publishedOn: Timestamp
  title: string
  kind: RecordingKind | null
  isCover: boolean
}

/** The lean lines `/artists` lists. */
export type ArtistIndexEntry = Artist & {
  postCount: number
}

/**
 * What the blog says about itself, and the only built file that is prose.
 *
 * `shortTitle` is the name the blog goes by in a sentence — `on dlbbm` — where the full
 * one would be a mouthful. It is what the share lines are written with, and it lives here
 * because every other site-level string does.
 */
export type About = {
  url: string
  title: string
  shortTitle: string
  description: string
  paragraphs: string[]
}

/** One URL `build:shells` writes a file for, and what that file should say it is. */
export type Route = {
  url: string
  kind: routes.Kind
  title: string
  description: string
}

/** Everything a page might want before it knows which page it is. */
export type Manifest = {
  about: About
  pageSize: number
  // Everything shipped, scheduled posts included. How many are displayable is a question
  // only the front can answer, and it answers it by filtering the index.
  postCount: number
  artistCount: number
  builtAt: Timestamp
}
