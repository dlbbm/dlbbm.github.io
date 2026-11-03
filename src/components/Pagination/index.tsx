import { Link } from 'wouter-preact'
import { clss } from '@design-edito/tools/agnostic/css/clss/index.js'
import { routePatterns, routeUrl } from '../../../shared/routes/index.js'
import './styles.css'

const bem = clss('pagination')

export type PaginationProps = {
  page: number
  pageCount: number
  /**
   * Whether `page` is a page the reader is actually on. `false` means the URL named
   * none, so the two ends are offered and the two steps are not: nowhere has no
   * neighbour, and a clamped position would make one of the ends look already reached.
   */
  onPage?: boolean
}

// Page one is `/`, never `/page/1`, which redirects to it.
function pageUrl (page: number): string {
  return page <= 1 ? routePatterns.home : routeUrl('page', { page })
}

function Step ({ label, href }: { label: string, href: string | null }) {
  if (href === null) return <span class={bem('button', 'inert')}>{label}</span>
  return <Link href={href} className={bem('button')}>{label}</Link>
}

export function Pagination ({ page, pageCount, onPage = true }: PaginationProps) {
  const back = onPage && page > 1
  const forward = onPage && page < pageCount
  return <nav class={bem()}>
    <Step label="first" href={back || !onPage ? pageUrl(1) : null} />
    <Step label="prev" href={back ? pageUrl(page - 1) : null} />
    <Step label="next" href={forward ? pageUrl(page + 1) : null} />
    <Step label="last" href={forward || !onPage ? pageUrl(pageCount) : null} />
  </nav>
}
