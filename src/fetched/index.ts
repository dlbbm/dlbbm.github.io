/**
 * One read from `dist/data`, and what came back.
 *
 * Six pages fetched one thing each and wrote the same race by hand: a `null` state, an
 * effect, and a `let` the cleanup closes over to drop an answer that arrives after the
 * reader has moved. Written once here, with the state named rather than encoded in
 * `null` — a value the read answers `null` for is loaded and empty, which two of those
 * pages used to tell apart by wrapping the value in an object.
 *
 * Three states and not two, because a read that failed is not a thing that is absent:
 * `fetch/index.ts` answers `null` for the file the site does not have, and rejects for
 * everything else, which is what arrives here as `failed`.
 */

import { useEffect, useState } from 'preact/hooks'

export type Fetched<T> =
  | { status: 'loading' }
  | { status: 'failed', error: unknown }
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
    void read().then(
      value => { if (isLatestRequest) setFetched({ status: 'loaded', value }) },
      error => {
        // Logged because it is caught: an uncaught rejection used to print itself, and
        // what the reader is shown says nothing about what went wrong.
        console.error(error)
        if (isLatestRequest) setFetched({ status: 'failed', error })
      }
    )
    return () => { isLatestRequest = false }
  }, deps)

  return fetched
}
