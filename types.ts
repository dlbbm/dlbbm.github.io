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
export type PersonId = string
export type PostId = string

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
 * The kinds of recording the archive actually annotates.
 *
 * schema.org has no recording-level equivalent — `MusicAlbumProductionType` classifies
 * albums, not takes — so this list is not a standard being followed. It is the vocabulary
 * the old blog used, and nothing more: a value earns its place here by appearing in a
 * post, not by being imaginable.
 */
export const recordingKinds = [
  'live',
  'demo',
  'alternate-take',
  'remix'
] as const

/** Which kind a single recording is. */
export type RecordingKind = typeof recordingKinds[number]

/**
 * A song as a work: the thing that stays the same across every version of it.
 *
 * `MusicComposition`. A title and the people who wrote it, and nothing about how it
 * sounded on a given day — that belongs to a {@link Recording}. There is no *original
 * version* flag: the work is the identity, and every recording hangs off it as a peer.
 *
 * @property title - The work's title, in the form the blog uses it.
 * @property titleAliases - Other titles it goes by, translations included.
 * @property composedByIds - `composer`.
 * @property wroteLyricsIds - `lyricist`.
 * @property firstRecordingId - The earliest known recording, which is what lets a later
 * one be *called* a cover without a cover concept existing. The one concession to
 * privileging a version, and droppable the day recording dates are complete enough to
 * sort on.
 * @property sources - Identity assertions about the work itself, such as a MusicBrainz
 * work URI. Never an embed: a work is not playable.
 */
export type Song = {
  id: SongId
  title: string
  titleAliases: string[]
  composedByIds: PersonId[]
  wroteLyricsIds: PersonId[]
  firstRecordingId: RecordingId | null
  sources: IdentitySource[]
}

/**
 * One version of a song, as performed and captured once.
 *
 * `MusicRecording`, linked to its work by `recordingOf`. A cover needs nothing of its own:
 * it is a recording of a known song by an artist other than
 * {@link Song.firstRecordingId}'s, which is how `(Bill Withers cover)` is rendered without
 * leaving the vocabulary.
 *
 * @property kind - `null` on the 341 posts of 400 that annotate nothing. There is no
 * `studio` member standing in for them: an unannotated take is a take nobody said anything
 * about, which is not the same claim.
 * @property title - A name this version carries that the work does not — `Chevals remix`.
 * `null` on the common case, where the work's title is the whole of it.
 * @property byArtistIds - `byArtist`. A list, since the archive credits up to four.
 * @property featuringArtistIds - Kept apart from `byArtistIds` because the blog writes
 * them apart, as `(ft. …)`, and because a guest is not a co-credit.
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
  title: string | null
  byArtistIds: ArtistId[]
  featuringArtistIds: ArtistId[]
  performedOn: PartialDate | null
  performedAt: Place | null
  releasedOn: PartialDate | null
  durationMs: number | null
  sources: Source[]
}

/**
 * A name music is released under — a solo act, a band, a one-off collaboration.
 *
 * `MusicGroup`. Closer to a brand than to a human: it is the credit line, which is why a
 * band that renamed mid-career is two `Artist` records sharing the same
 * {@link Membership} people. schema.org offers no former-name property, only
 * `alternateName`, so the tie between the two names is this shared membership and
 * nothing else.
 *
 * @property kind - Whether the name stands for one person or several. A solo artist still
 * gets a `Membership`, to the person who is them.
 * @property memberships - Who is behind the name, and when.
 */
export type Artist = {
  id: ArtistId
  name: string
  nameAliases: string[]
  kind: 'solo' | 'group'
  memberships: Membership[]
  sources: IdentitySource[]
}

/**
 * One person's time inside one {@link Artist}.
 *
 * `member` qualified by a `Role` — the dates are what make a name change legible, since
 * the same people leaving one `Artist` and appearing in another is the only evidence the
 * two are the same act.
 *
 * @property roles - Free text for now: `vocals`, `bass`. A controlled vocabulary is a
 * later problem and a bad early one.
 * @property isPrincipal - Whether this is what the person is known for in this act.
 */
export type Membership = {
  personId: PersonId
  roles: string[]
  isPrincipal: boolean
  from: PartialDate | null
  to: PartialDate | null
}

/**
 * A human being, as distinct from any name they record under.
 *
 * `Person`. Deliberately thin: it exists so that two {@link Artist} records can be known
 * to be the same people, and so a composer can be credited without inventing an act for
 * them.
 */
export type Person = {
  id: PersonId
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
 * Eight names for 303 embeds: YouTube 262, Spotify 14, Vimeo 12, SoundCloud 6, Grooveshark
 * 6, and one each of Bandcamp, Mixcloud and SoundOwl. Grooveshark and SoundOwl are long
 * dead and stay in the list because the links are still in the data — a host earns its
 * place by having been used, not by still working.
 */
export const mediaServices = [
  'youtube',
  'spotify',
  'vimeo',
  'soundcloud',
  'grooveshark',
  'bandcamp',
  'mixcloud',
  'soundowl'
] as const

/** Which host a single playable source sits on. */
export type MediaService = typeof mediaServices[number]

/**
 * Something that can actually be heard or watched.
 *
 * `AudioObject` / `VideoObject`.
 *
 * @property embedUrl - `embedUrl`, when the host offers one distinct from `url`.
 */
export type MediaSource = {
  nature: 'media'
  service: MediaService
  kind: 'audio' | 'video'
  url: string
  embedUrl: string | null
}

/**
 * One entry on the blog.
 *
 * `BlogPosting` with `about` pointing at the recording. The post is the writing; the music
 * is its subject and outlives it.
 *
 * @property recordingId - What this post is about. Exactly one: the old blog posted one
 * track at a time and there is no reason to loosen that.
 */
export type Post = {
  id: PostId
  publishedOn: PartialDate
  recordingId: RecordingId
}
