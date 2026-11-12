/**
 * Creating the names things go by in URLs.
 *
 * A slug is drawn once, from whatever the thing was called at the time, and then belongs
 * to the record rather than to the name — which is the point: the name can change
 * afterwards without the URL moving. Nothing here recomputes an existing one.
 */

import type { Slug, SlugKind } from '../../shared/types/index.js'

/**
 * A name as it reads in a URL.
 *
 * Diacritics are folded rather than dropped, so Télépopmusik is `telepopmusik` and not
 * `tlpopmusik`, and anything else that is not a letter or a digit becomes a single dash.
 */
export function slugify (name: string): string {
  const folded = name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
  const dashed = folded
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return dashed === '' ? 'untitled' : dashed
}

/**
 * The slug a thing already has, or a new one nothing else is using.
 *
 * Uniqueness is per kind, and a collision gets a number rather than a longer name, which
 * keeps `/artist/crazy-2` legible. The returned record is appended by the caller: nothing
 * here writes.
 */
export function createSlug (kind: SlugKind, targetId: string, name: string, pool: Slug[]): Slug {
  const existing = pool.find(candidate => candidate.kind === kind && candidate.targetId === targetId)
  if (existing !== undefined) return existing
  const taken = new Set(pool
    .filter(candidate => candidate.kind === kind)
    .map(candidate => candidate.slug))
  const base = slugify(name)
  let slug = base
  let suffix = 1
  while (taken.has(slug)) {
    suffix += 1
    slug = `${base}-${suffix}`
  }
  const created: Slug = { kind, targetId, slug }
  pool.push(created)
  return created
}

/** The slug addressing a record, when it has one. */
export function findSlug (kind: SlugKind, targetId: string, pool: Slug[]): Slug | undefined {
  return pool.find(candidate => candidate.kind === kind && candidate.targetId === targetId)
}
