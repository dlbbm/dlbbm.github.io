/**
 * The data core of the blog.
 *
 * Shapes follow schema.org's music vocabulary wherever it has an opinion — the
 * {@link Song} / {@link Recording} split is `MusicComposition` / `MusicRecording`, and
 * {@link Artist} is `MusicGroup`. Where it has none, or where it is coarser than this blog
 * needs, the type below says so and diverges on purpose. Each divergence is named, so
 * absorbing this into something more generic later is a question of mapping, not of
 * archaeology.
 */

export type SongId = string
export type RecordingId = string
export type ArtistId = string
export type PostId = string

/**
 * What a thing is called in a URL.
 *
 * Addressing rather than fact, which is why it sits in a file of its own instead of on the
 * entity: `Artist` says who recorded something, not how the blog links to them. Minted
 * once and never recomputed, so renaming an artist leaves their URL alone, and a slug that
 * reads badly is a hand edit like every other correction.
 *
 * @property kind - What the slug addresses. One file serves every addressable thing, and
 * uniqueness is per kind: `/artist/x` and a future `/genre/x` do not collide.
 * @property targetId - The record it points at.
 */
export type Slug = {
  kind: SlugKind
  targetId: string
  slug: string
}

/** The kinds of thing that have a URL of their own. Genres join the day genres exist. */
export const slugKinds = ['artist'] as const

/** Which kind a single slug addresses. */
export type SlugKind = typeof slugKinds[number]

/**
 * One exact moment, as an ISO 8601 string carrying its offset.
 *
 * `2019-01-31T18:39:00+01:00`. The offset is kept rather than normalised to UTC because
 * the hour a post went out is a Paris evening, and that is what the blog is saying.
 */
export type Timestamp = string

/**
 * A date known to whatever precision it is known.
 *
 * `schema.org` expects a `Date`, which cannot say *1968 and no better*. A third of the
 * dated annotations in the Tumblr archive are a year alone, so precision is carried rather
 * than faked.
 *
 * Every field is optional, the year included — a sleeve saying *recorded in January* with
 * no year is a real fragment. Nothing in the type forbids the all-null date, because the
 * alternative was a union, and a union does not typecheck against three independently
 * parsed nullable locals, which is how every one of these is built. The invariant lives in
 * the constructor instead: whatever reads a date string returns `PartialDate | null` and
 * hands back `null` rather than a date that knows nothing.
 *
 * No time of day: the archive's hours are Paris wall-clock labelled UTC, so the hour is
 * known to be wrong and is not worth a field.
 */
export type PartialDate = {
  year: number | null
  month: number | null
  day: number | null
}

/**
 * Where something happened, as loosely as the source stated it.
 *
 * `Live at La Cigale, Paris, October 2012` gives all three; `Live, London, 1968` gives one.
 * Maps onto `Place`, which asks for more structure than any of these lines carry.
 */
export type Place = {
  venue: string | null
  city: string | null
  country: string | null
}

/**
 * The kinds of recording the archive annotates often enough to be offered as a choice.
 *
 * schema.org has no recording-level equivalent — `MusicAlbumProductionType` classifies
 * albums, not takes — so this list is not a standard being followed. It is the vocabulary
 * the old blog used, in the order it used it: a value earns its place here by appearing in
 * enough posts to be worth a keystroke.
 *
 * **Every member says what the occasion was**, never how it sounds and never how much of
 * it there is. `acoustic` and `extended` describe an arrangement, `full album` describes
 * an extent — all three are free text, or the list stops being comparable with itself.
 * `session` is the one member the archive did not earn: a filmed performance away from a
 * stage, which keeps turning up and which `live` overclaims, since `performedAt` then
 * expects a venue there never was.
 */
export const recordingKinds = [
  'live',
  'remix',
  'demo',
  'alternate take',
  'session'
] as const

/**
 * Which kind a single recording is.
 *
 * Any string, because the archive annotates `Club 12" Mix` and `reprise` too, and a closed
 * union would have no room for them. The members are named anyway, as the documentation of
 * what is expected — TypeScript widens the union to `string` and loses nothing.
 */
export type RecordingKind = typeof recordingKinds[number] | string

/**
 * A song as a work: the thing that stays the same across every version of it.
 *
 * `MusicComposition`. A title, and nothing about how it sounded on a given day — that
 * belongs to a {@link Recording}, and every recording hangs off the work as a peer: there
 * is no first-recording pointer, because posting order is not evidence of anything. No
 * `composer` and no `lyricist` either, although schema.org offers both: this blog credits
 * the name a record came out under and never the humans behind it.
 *
 * @property title - The work's title, in the form the blog uses it.
 * @property titleAliases - Other titles it goes by, translations included.
 * @property originalArtistIds - Whose song it is, stated once when the work enters the
 * data. It is what makes a cover a cover: a recording credited to these artists is a
 * version of their own song, one credited to anyone else is a cover of it. Empty when
 * nobody claimed. The third named divergence — schema.org says this by pointing
 * `recordedAs` at the original `MusicRecording`, which would mean minting a recording for
 * a version the blog never posted.
 * @property sources - Identity assertions about the work itself, such as a MusicBrainz
 * work URI. Never an embed: a work is not playable.
 */
export type Song = {
  id: SongId
  title: string
  titleAliases: string[]
  originalArtistIds: ArtistId[]
  sources: IdentitySource[]
}

/**
 * One version of a song, as performed and captured once.
 *
 * `MusicRecording`, linked to its work by `recordingOf`. A cover needs nothing of its own:
 * it is a recording credited to someone other than the work's
 * {@link Song.originalArtistIds}, which is how `(Bill Withers cover)` is rendered without
 * leaving the vocabulary.
 *
 * @property kind - `null` on the 341 posts of 400 that annotate nothing. There is no
 * `studio` member standing in for them: an unannotated take is a take nobody said anything
 * about, which is not the same claim.
 * @property byArtistIds - `byArtist`. A list, since the archive credits up to four.
 * @property featuringArtistIds - Kept apart from `byArtistIds` because the blog writes
 * them apart, as `(ft. …)`, and because a guest is not a co-credit.
 * @property remixedByArtistIds - Who reworked it. schema.org has no `remixer` and the
 * archive hides the name inside the title — `(Pilooski remix)` — but it is a credit like
 * any other, and the one the blog states most often after the billing itself.
 * @property performedOn - When it was played, which for a live take is the concert.
 * @property performedAt - Where it was played. schema.org would model the concert as a
 * `MusicEvent` and has no property tying a recording to one, so venue and date sit here
 * instead. This is the vocabulary's weakest seam, and the place to revisit first if these
 * types ever have to federate with someone else's.
 * @property releasedOn - When this version was published, which is rarely the same day it
 * was played and is often unknown.
 * @property durationMs - Length. `Duration` in schema.org is an ISO 8601 string; it is
 * kept as a number here and formatted at the edge.
 * @property sources - Where to hear it and where to read about it, in the order they were
 * found.
 */
export type Recording = {
  id: RecordingId
  songId: SongId
  kind: RecordingKind | null
  byArtistIds: ArtistId[]
  featuringArtistIds: ArtistId[]
  remixedByArtistIds: ArtistId[]
  performedOn: PartialDate | null
  performedAt: Place | null
  releasedOn: PartialDate | null
  durationMs: number | null
  sources: Source[]
}

/**
 * A name music is released under — a solo act, a band, a one-off collaboration.
 *
 * `MusicGroup`. Closer to a brand than to a human, and the humans are not modelled at
 * all: this is the credit line and nothing behind it. A band that renamed mid-career is
 * one record carrying the earlier name in `nameAliases`, or two unrelated records — which
 * is as far as a music blog needs to go.
 */
export type Artist = {
  id: ArtistId
  name: string
  nameAliases: string[]
  sources: IdentitySource[]
}

/**
 * Where a thing can be found elsewhere.
 *
 * The one place these types are deliberately finer than schema.org, which collapses this
 * into `sameAs` for identity and a `VideoObject` for media. The archive says why they must
 * be told apart: of 401 posts, 262 pointed at YouTube, 14 at Spotify, 6 at Grooveshark —
 * which no longer resolves — and 99 at nothing at all. A dead embed must not take a song's
 * identity down with it, and an identity must not pretend to be playable.
 */
export type Source =
  | IdentitySource
  | MediaSource
  | FileSource

/**
 * A claim that this thing is the thing over there.
 *
 * `sameAs`. Carries no promise that anything is listenable.
 *
 * @property service - Free text, because there is nothing to seed an enum with: not one
 * post in the archive links to MusicBrainz, Discogs or anything else of the kind. It
 * becomes a list the day a second service is actually in use.
 * @property externalId - The service's own identifier when it has one worth keeping apart
 * from the URL — an MBID, a Discogs release number.
 */
export type IdentitySource = {
  nature: 'identity'
  service: string
  url: string
  externalId: string | null
}

/**
 * The hosts the archive actually embedded from, by frequency.
 *
 * Six names for 296 embeds: YouTube 262, Spotify 14, Vimeo 12, SoundCloud 6, and one each
 * of Bandcamp and Mixcloud. Grooveshark (6 links) and SoundOwl (1) are left out: both
 * services are dead, so there is nothing to play and nothing worth importing.
 */
export const mediaServices = [
  'youtube',
  'spotify',
  'vimeo',
  'soundcloud',
  'bandcamp',
  'mixcloud'
] as const

/** Which host a single playable source sits on. */
export type MediaService = typeof mediaServices[number]

/**
 * Something that can actually be heard or watched.
 *
 * `AudioObject` / `VideoObject`.
 *
 * Only the canonical URL is stored: what an iframe needs is cut out of it by the
 * component that renders the host, which is the single place that knows that grammar.
 *
 * @property name - `name` on the media object, which is what schema.org gives a file or a
 * stream to say what it is. Here it answers one question — **which edition of the
 * recording this particular audio is**: `remaster 2015`, `original mono mix`,
 * `radio edit`. Never the song's title, which the work already carries; the prompt asks
 * for an `Edition` for that reason. `null` when it is simply the recording, the way
 * {@link Recording.kind} is `null` when nobody said anything.
 *
 * It sits on the source and not on the recording because a remaster is the same take:
 * two sources of one recording can be two editions, and nothing above them could hold
 * that.
 */
export type MediaSource = {
  nature: 'media'
  service: MediaService
  kind: 'audio' | 'video'
  url: string
  name: string | null
}

/**
 * Something hosted by the blog itself.
 *
 * `AudioObject` / `VideoObject` again, with `contentUrl` resolved when the front builds.
 * Nothing in the archive is one: the eight hosts covered every post, and this exists for
 * what gets posted from now on, where the only copy may be a file on disk.
 *
 * @property path - Where the file sits relative to the repository root. Not a URL: the
 * front owns the public path, and a path written here would be wrong the day it changes.
 * @property name - As on {@link MediaSource}: which edition of the recording this audio
 * is, `null` when it is simply the recording.
 */
export type FileSource = {
  nature: 'file'
  kind: 'audio' | 'video'
  path: string
  name: string | null
}

/**
 * One entry on the blog.
 *
 * `BlogPosting` with `about` pointing at the recording. The post is the writing; the music
 * is its subject and outlives it.
 *
 * @property publishedOn - `datePublished`. Complete to the minute, and the one date in
 * these types that is never partial: a moment ahead of now is how a post is scheduled, so
 * the front has to be able to compare it with now.
 * @property hidden - Kept out of the blog without being deleted. Nothing in schema.org
 * says this, since it is a fact about this site rather than about the writing.
 * @property recordingId - What this post is about. Exactly one: the old blog posted one
 * track at a time and there is no reason to loosen that.
 * @property body - `articleBody`. Whatever the post says beyond naming the song — a
 * tracklist, a second link, a line of context. Plain text, newlines kept, `null` when the
 * post is only its title, which is what almost every post is. It belongs to the writing
 * and not to the music: a tracklist stored here is what this post wrote down, not a
 * property of the record.
 */
export type Post = {
  id: PostId
  publishedOn: Timestamp
  hidden: boolean
  recordingId: RecordingId
  body: string | null
}
