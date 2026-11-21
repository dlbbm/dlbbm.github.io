/**
 * Tag lookup, creation and attachment — the one write path both a future CLI command and
 * the dev server's HTTP routes go through.
 */

import type { Recording, Tag, TagId } from '../../shared/types/index.js'
import { createId } from '../_db/index.js'

export function findTag (name: string, group: string, pool: Tag[]): Tag | undefined {
  const needle = name.trim().toLowerCase()
  const groupNeedle = group.trim().toLowerCase()
  return pool.find(tag => tag.group.toLowerCase() === groupNeedle && tag.name.toLowerCase() === needle)
}

/** Reuses a matching tag or mints one, the same move `resolveArtist` makes for a name. */
export function resolveTag (name: string, group: string, pool: Tag[], created: Tag[]): Tag {
  const existing = findTag(name, group, pool)
  if (existing !== undefined) return existing
  const tag: Tag = { id: createId(), name: name.trim(), group: group.trim() }
  pool.push(tag)
  created.push(tag)
  return tag
}

/** `true` when the tag was not already there, which is what tells a caller to persist. */
export function attachTag (recording: Recording, tagId: TagId): boolean {
  if (recording.tagIds.includes(tagId)) return false
  recording.tagIds.push(tagId)
  return true
}

/** `true` when the tag was actually carried, same reasoning as {@link attachTag}. */
export function detachTag (recording: Recording, tagId: TagId): boolean {
  const index = recording.tagIds.indexOf(tagId)
  if (index === -1) return false
  recording.tagIds.splice(index, 1)
  return true
}
