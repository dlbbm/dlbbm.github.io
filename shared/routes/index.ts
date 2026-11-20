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
