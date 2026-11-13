import { clss } from '@design-edito/tools/agnostic/css/clss/index.js'
import { Link } from '../Link/index.js'
import { routePatterns } from '../../../shared/routes/index.js'
import './styles.css'

const bem = clss('logo')

// Two circles of r=10 at (10,10) and (22,10): left-only, right-only, and the lens they
// share, as three disjoint regions so each one takes its own fill.
export function Logo () {
  return <Link href={routePatterns.home} className={bem()}>
    <svg class={bem('mark')} viewBox="0 0 32 20" xmlns="http://www.w3.org/2000/svg">
      <rect class="bg" width="32" height="20" />
      <path class="fill-1" d="M16 2A10 10 0 1 0 16 18A10 10 0 0 1 16 2Z" />
      <path class="fill-2" d="M16 2A10 10 0 0 1 16 18A10 10 0 1 0 16 2Z" />
      <path class="fill-3" d="M16 2A10 10 0 0 1 16 18A10 10 0 0 1 16 2Z" />
    </svg>
    <span class={bem('word')}>dlbbm</span>
  </Link>
}
