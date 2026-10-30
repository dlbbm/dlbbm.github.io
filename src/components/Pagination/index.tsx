import { Link } from 'wouter-preact'
import { clss } from '@design-edito/tools/agnostic/css/clss/index.js'
import { routePatterns, routeUrl } from '../../../shared/routes/index.js'

const bem = clss('pagination')

export type PaginationProps = {
  page: number
  pageCount: number
}

// Page one is `/`, never `/page/1`, which redirects to it.
function pageUrl (page: number): string {
  return page <= 1 ? routePatterns.home : routeUrl('page', { page })
}

export function Pagination ({ page, pageCount }: PaginationProps) {
  const previous = page <= 1 ? null : pageUrl(page - 1)
  const next = page >= pageCount ? null : pageUrl(page + 1)
  return <nav class={bem()}>
    {previous === null
      ? <span class={bem('button', 'inert')}>prev</span>
      : <Link href={previous} className={bem('button')}>prev</Link>}
    {next === null
      ? <span class={bem('button', 'inert')}>next</span>
      : <Link href={next} className={bem('button')}>next</Link>}
  </nav>
}
