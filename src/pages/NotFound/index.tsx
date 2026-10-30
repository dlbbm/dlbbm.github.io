import { clss } from '@design-edito/tools/agnostic/css/clss/index.js'

const bem = clss('page-not-found')

export function NotFound () {
  return <div class={bem()} />
}
