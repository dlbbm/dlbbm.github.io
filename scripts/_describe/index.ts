/**
 * One line about a record, for the commands that show them rather than ask for them.
 *
 * Ids are resolved to names here and nowhere else: a prompt listing posts to edit and a
 * `list` command showing the same posts should not disagree about how one reads.
 */

import type { Artist, Post, Recording, Slug, Song } from '../../shared/types/index.js'
import { formatPartialDate } from '../_date/index.js'
import type { Db } from '../_db/index.js'

/** What a record reads as: a `name` that identifies it, and the detail under it. */
export type Described = {
  name: string
  description: string
}

export function findArtistById (id: string, pool: Artist[]): Artist | undefined {
  return pool.find(artist => artist.id === id)
}

function namesOf (ids: string[], pool: Artist[]): string {
  return ids.map(id => findArtistById(id, pool)?.name ?? id).join(', ')
}

function describeSource (recording: Recording): string | null {
  const source = recording.sources.find(candidate =>
    candidate.nature === 'media' || candidate.nature === 'file')
  if (source === undefined) return null
  if (source.nature === 'file') return `file ${source.path}`
  return source.service
}

export function describeRecording (recording: Recording, db: Db): Described {
  const song = db.songs.find(candidate => candidate.id === recording.songId)
  const featuring = recording.featuringArtistIds.length === 0
    ? ''
    : ` (ft. ${namesOf(recording.featuringArtistIds, db.artists)})`
  return {
    name: `${namesOf(recording.byArtistIds, db.artists)}${featuring} — ${recording.title ?? song?.title ?? 'unknown song'}`,
    description: [
      recording.title === null ? null : `a version of ${song?.title ?? 'unknown song'}`,
      recording.kind,
      recording.remixedByArtistIds.length === 0
        ? null
        : `remixed by ${namesOf(recording.remixedByArtistIds, db.artists)}`,
      recording.performedOn === null ? null : `played ${formatPartialDate(recording.performedOn)}`,
      describeSource(recording)
    ].filter((part): part is string => part !== null && part !== undefined).join(' · ')
  }
}

export function describePost (post: Post, db: Db): Described {
  const recording = db.recordings.find(candidate => candidate.id === post.recordingId)
  if (recording === undefined) {
    return {
      name: `${post.hidden ? '(hidden) ' : ''}unknown recording`,
      description: `${post.publishedOn} · points at ${post.recordingId}`
    }
  }
  const described = describeRecording(recording, db)
  return {
    name: `${post.hidden ? '(hidden) ' : ''}${described.name}`,
    description: [post.publishedOn, described.description].filter(part => part !== '').join(' · ')
  }
}

export function describeSong (song: Song, db: Db): Described {
  const recordings = db.recordings.filter(candidate => candidate.songId === song.id)
  return {
    name: song.title,
    description: [
      song.originalArtistIds.length === 0
        ? 'unclaimed'
        : `originally ${namesOf(song.originalArtistIds, db.artists)}`,
      `${recordings.length} recording${recordings.length === 1 ? '' : 's'}`
    ].join(' · ')
  }
}

export function describeArtist (artist: Artist, db: Db): Described {
  const count = (pick: (recording: Recording) => string[]): number =>
    db.recordings.filter(recording => pick(recording).includes(artist.id)).length
  const credited = count(recording => recording.byArtistIds)
  const featured = count(recording => recording.featuringArtistIds)
  const remixed = count(recording => recording.remixedByArtistIds)
  const original = db.songs.filter(song => song.originalArtistIds.includes(artist.id)).length
  return {
    name: artist.name,
    description: [
      credited === 0 ? null : `credited on ${credited}`,
      featured === 0 ? null : `featured on ${featured}`,
      remixed === 0 ? null : `remixed ${remixed}`,
      original === 0 ? null : `originally wrote ${original}`
    ].filter((part): part is string => part !== null).join(' · ') || 'nothing points at it'
  }
}

export function describeSlug (slug: Slug, db: Db): Described {
  const target = slug.kind === 'artist'
    ? findArtistById(slug.targetId, db.artists)?.name
    : undefined
  return {
    name: `${slug.kind}/${slug.slug}`,
    description: target ?? 'points at nothing'
  }
}
