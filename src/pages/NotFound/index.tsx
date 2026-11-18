import { clss } from '@design-edito/tools/agnostic/css/clss/index.js'
import { routePatterns } from '../../../shared/routes/index.js'
import { Link } from '../../components/Link/index.js'
import { MissingNotice } from '../../components/Notice/index.js'
import { useDocumentTitle } from '../../utils/title/index.js'
import './styles.css'

const bem = clss('page-not-found')

// What the router falls through to, and what a mistyped address lands on: the shells are
// written per post, so an unknown URL is served the 404 shell and read by this page.
export function NotFound () {
  useDocumentTitle(null)
  return <div class={bem()}>
    <MissingNotice>There is nothing at this address.</MissingNotice>
    <Link href={routePatterns.home} className={bem('link')}>back to the blog</Link>
  </div>
}
