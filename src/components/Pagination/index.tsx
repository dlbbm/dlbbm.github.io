import { Link } from 'wouter-preact'
import { clss } from '@design-edito/tools/agnostic/css/clss/index.js'
import { routePatterns, routeUrl } from '../../../shared/routes/index.js'
import './styles.css'

const bem = clss('pagination')

export type PaginationProps = {
  page: number
  pageCount: number
}

// Page one is `/`, never `/page/1`, which redirects to it.
function pageUrl (page: number): string {
  return page <= 1 ? routePatterns.home : routeUrl('page', { page })
}

function Step ({ label, href }: { label: string, href: string | null }) {
  if (href === null) return <span class={bem('button', 'inert')}>{label}</span>
  return <Link href={href} className={bem('button')}>{label}</Link>
}

export function Pagination ({ page, pageCount }: PaginationProps) {
  const back = page > 1
  const forward = page < pageCount
  return <nav class={bem()}>
    <Step label="first" href={back ? pageUrl(1) : null} />
    <Step label="prev" href={back ? pageUrl(page - 1) : null} />
    <Step label="next" href={forward ? pageUrl(page + 1) : null} />
    <Step label="last" href={forward ? pageUrl(pageCount) : null} />
  </nav>
}
