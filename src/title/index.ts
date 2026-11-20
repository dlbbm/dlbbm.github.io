/**
 * Keeping the tab in step with the router: wouter navigates without a document swap, so
 * nothing else would update `<title>` after the shell's own.
 */

import { useEffect } from 'preact/hooks'
import * as titles from '../../shared/titles/index.js'
import * as data from '../data/index.js'
import { useFetched } from '../fetched/index.js'

export type PageName =
  | { status: 'unknown' }
  | { status: 'known', name: string | null }

export const unknown: PageName = { status: 'unknown' }

/** `null` is the site's own front page. */
export function known (name: string | null): PageName {
  return { status: 'known', name }
}

/** Left as it was while `unknown`, rather than flickering through a loading state. */
export function useDocumentTitle (page: PageName): void {
  const site = useFetched(async () => await data.about(), [])

  useEffect(() => {
    if (site.status !== 'loaded' || page.status !== 'known') return
    document.title = titles.title(page.name, site.value.title)
  }, [site, page])
}
