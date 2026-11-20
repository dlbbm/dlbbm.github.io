/**
 * Keeping the tab in step with the router.
 *
 * Each URL gets its `<title>` from the shell `build:shells` wrote for it, which is right
 * when the page is loaded or pasted and then frozen: wouter navigates without a document
 * swap, so nothing would ever set it again. Each page says its own name here, and the
 * grammar around it is the one the shells were filled with.
 */

import { useEffect } from 'preact/hooks'
import { pageTitle } from '../../../shared/titles/index.js'
import { fetchAbout } from '../fetch/index.js'
import { useFetched } from '../fetched/index.js'

/**
 * Names the current page in the tab: `null` for the site's own front page, `undefined`
 * while the page does not yet know what it holds — a title is left as it was rather than
 * flickering through a loading state. A read that failed leaves it alone too, the shell's
 * own title being the last thing that was true.
 *
 * Every page mounts this, so it runs on every navigation and costs one request a tab: the
 * manifest the blog's own title comes out of is read once and held in `fetch`.
 */
export function useDocumentTitle (name: string | null | undefined): void {
  const site = useFetched(async () => await fetchAbout(), [])

  useEffect(() => {
    if (site.status !== 'loaded' || name === undefined) return
    document.title = pageTitle(name, site.value.title)
  }, [site, name])
}
