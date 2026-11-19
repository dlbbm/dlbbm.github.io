import { clss } from '@design-edito/tools/agnostic/css/clss/index.js'
import { routePatterns, routeUrl } from '../../../shared/routes/index.js'
import { Link } from '../Link/index.js'
import './styles.css'

const c = clss('pagination')

export type PaginationProps = {
  page: number
  pageCount: number
  /**
   * Whether `page` is a page there is. `false` means the URL named none, so the two ends
   * are offered and the two steps are not: nowhere has no neighbour, and a clamped
   * position would make one of the ends look already reached.
   */
  pageExists?: boolean
}

// Page one is `/`, never `/page/1`, which redirects to it.
function pageUrl (page: number): string {
  return page <= 1 ? routePatterns.home : routeUrl('page', { page })
}

type StepProps = {
  label: string
  href: string | null
  chevron?: 'before' | 'after'
}

// The chevron sits outside the word, which is what the underline is drawn under: a line
// running beneath an arrow reads as part of the arrow.
function Step ({ label, href, chevron }: StepProps) {
  const content = <>
    {chevron === 'before' ? <span class={c('chevron')}>{'‹ '}</span> : null}
    <span class={c('word')}>{label}</span>
    {chevron === 'after' ? <span class={c('chevron')}>{' ›'}</span> : null}
  </>
  if (href === null) return <span class={c('button', 'inert')}>{content}</span>
  return <Link href={href} className={c('button')}>{content}</Link>
}

export function Pagination ({ page, pageCount, pageExists = true }: PaginationProps) {
  const hasPrevious = pageExists && page > 1
  const hasNext = pageExists && page < pageCount
  return <nav class={c()}>
    <Step label="first" href={hasPrevious || !pageExists ? pageUrl(1) : null} />
    <Step label="prev" href={hasPrevious ? pageUrl(page - 1) : null} chevron="before" />
    <Step label="next" href={hasNext ? pageUrl(page + 1) : null} chevron="after" />
    <Step label="last" href={hasNext || !pageExists ? pageUrl(pageCount) : null} />
  </nav>
}
