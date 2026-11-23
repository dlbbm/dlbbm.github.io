/**
 * Every URL the site answers to.
 *
 * Imported by the app, which routes on these patterns, and by `build:data`, which expands
 * them into the concrete URLs `build:shells` writes a file for. One list, so that a URL
 * which works when clicked cannot 404 when pasted.
 */

export const patterns = {
  home: '/',
  page: '/page/:page',
  post: '/post/:id',
  posts: '/posts',
  // Scheduled posts, read before their date. In no nav and in no link — the URL itself is
  // what grants it, so knowing it is the only way in.
  pending: '/pending',
  // [WIP] Temporary — a playground for mf-tools' form-items, gone before the blog
  // publishes. No link anywhere; the URL itself is the only way in.
  compsDemo: '/comps-demo',
  artists: '/artists',
  artist: '/artist/:slug',
  about: '/about'
} as const

export type Kind = keyof typeof patterns

/** The pattern with its `:params` filled in — `routes.url('post', { id })`. */
export function url (kind: Kind, params: Record<string, string | number> = {}): string {
  let filled: string = patterns[kind]
  for (const [name, value] of Object.entries(params)) {
    filled = filled.replace(`:${name}`, `${value}`)
  }
  return filled
}
