import { clss } from '@design-edito/tools/agnostic/css/clss/index.js'
import * as routes from '../../../shared/routes/index.js'
import { Link } from '../../components/Link/index.js'
import { MissingNotice } from '../../components/Notice/index.js'
import { known, useDocumentTitle } from '../../title/index.js'
import './styles.css'

const c = clss('page-not-found')

// What the router falls through to, and what a mistyped address lands on: the shells are
// written per post, so an unknown URL is served the 404 shell and read by this page.
export function NotFound () {
  useDocumentTitle(known(null))
  return <div class={c()}>
    <MissingNotice>There is nothing at this address.</MissingNotice>
    <Link href={routes.patterns.home} className={c('link')}>back to the blog</Link>
  </div>
}
