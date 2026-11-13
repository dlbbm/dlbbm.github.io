/**
 * Reading the blog before its time: `?preview` on any URL shows the posts whose date has
 * not come.
 *
 * Read once, at import, and held in memory for the life of the tab. The flag is not read
 * again because the router rewrites the URL as the reader moves — but `previewHref` puts
 * it back on every internal link, so the address bar keeps saying what the page is doing
 * and a refresh, or a link pasted to someone else, stays in preview.
 *
 * In memory and nowhere else: nothing is stored, so closing the tab ends it.
 */

export const previewing = new URLSearchParams(window.location.search).has('preview')

/** An internal URL as it should be followed from here. Untouched when not previewing. */
export function previewHref (href: string): string {
  return !previewing || href.includes('?') ? href : `${href}?preview`
}
