/**
 * `?preview` on any URL shows posts whose date has not come, read once at import: the
 * router rewrites the URL as the reader moves, so `preview.href` is what puts the
 * parameter back on every internal link rather than this being re-read.
 */

export const active = new URLSearchParams(window.location.search).has('preview')

export function href (to: string): string {
  return !active || to.includes('?') ? to : `${to}?preview`
}
