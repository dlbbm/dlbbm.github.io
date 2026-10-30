/**
 * Every URL the site answers to.
 *
 * Imported by the app, which routes on these patterns, and by `build:data`, which expands
 * them into the concrete URLs `build:shells` writes a file for. One list, so that a URL
 * which works when clicked cannot 404 when pasted.
 */

export const routePatterns = {
  home: '/',
  page: '/page/:page',
  post: '/post/:id',
  posts: '/posts',
  artists: '/artists',
  artist: '/artist/:slug',
  about: '/about'
} as const

export type RouteKind = keyof typeof routePatterns

/** The pattern with its `:params` filled in — `routeUrl('post', { id })`. */
export function routeUrl (kind: RouteKind, params: Record<string, string | number> = {}): string {
  let url: string = routePatterns[kind]
  for (const [name, value] of Object.entries(params)) {
    url = url.replace(`:${name}`, `${value}`)
  }
  return url
}
