import { Link } from 'wouter-preact'
import { clss } from '@design-edito/tools/agnostic/css/clss/index.js'
import { routePatterns } from '../../../routes/index.js'

const bem = clss('logo')

export function Logo () {
  return <Link href={routePatterns.home} className={bem()}>LOGO</Link>
}
