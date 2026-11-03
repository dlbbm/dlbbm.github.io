import { clss } from '@design-edito/tools/agnostic/css/clss/index.js'
import { useDocumentTitle } from '../../utils/title/index.js'

const bem = clss('page-not-found')

export function NotFound () {
  useDocumentTitle(null)
  return <div class={bem()} />
}
