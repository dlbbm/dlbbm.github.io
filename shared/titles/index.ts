/**
 * What a page calls itself, in the tab and in a paste.
 *
 * One grammar, read twice: `build:data` composes these into `routes.json`, out of which
 * `build:shells` writes a `<title>` per file, and the front composes the same string again
 * when the router moves without a document to swap. Reading the 850 built titles back
 * would be one source of truth too, and a 118 KB fetch to set one line of text.
 */

// A pipe rather than a dash: a post's own title already holds one, between the song and
// who played it.
const SEPARATOR = ' | '

/** The name of a page, trailed by the name of the site. `null` is the site itself. */
export function pageTitle (name: string | null, siteTitle: string): string {
  return name === null ? siteTitle : `${name}${SEPARATOR}${siteTitle}`
}

/** The pages whose name is not the name of something in the data. */
export const pageNames = {
  posts: 'All posts',
  artists: 'Artists',
  about: 'About'
} as const
