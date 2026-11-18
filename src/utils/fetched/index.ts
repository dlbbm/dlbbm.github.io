/**
 * One read from `dist/data`, and what came back.
 *
 * Six pages fetched one thing each and wrote the same race by hand: a `null` state, an
 * effect, and a `let` the cleanup closes over to drop an answer that arrives after the
 * reader has moved. Written once here, with the state named rather than encoded in
 * `null` — a value the read answers `null` for is loaded and empty, which two of those
 * pages used to tell apart by wrapping the value in an object.
 *
 * A failed read is not a state here, and that is the state of things rather than a
 * decision: `fetch/index.ts` answers `null` where a file that cannot be read is a thing
 * that is not there, and rejects everywhere else, which leaves the page loading for ever.
 * Giving failure a state of its own is the next pass, and this is the shape it goes into.
 */

import { useEffect, useState } from 'preact/hooks'

export type Fetched<T> =
  | { status: 'loading' }
  | { status: 'loaded', value: T }

/**
 * Calls `read` on mount and whenever `deps` change, and answers what it resolved with.
 *
 * `read` is not itself a dependency: a page writes it inline, so a fresh closure on every
 * render would fetch for ever.
 */
export function useFetched<T> (read: () => Promise<T>, deps: unknown[]): Fetched<T> {
  const [fetched, setFetched] = useState<Fetched<T>>({ status: 'loading' })

  useEffect(() => {
    let isLatestRequest = true
    // The same object when it is already loading, so a mount does not render twice.
    setFetched(current => current.status === 'loading' ? current : { status: 'loading' })
    void read().then(value => { if (isLatestRequest) setFetched({ status: 'loaded', value }) })
    return () => { isLatestRequest = false }
  }, deps)

  return fetched
}
