import { clss } from '@design-edito/tools/agnostic/css/clss/index.js'

const bem = clss('page-artists')

export function Artists () {
  return <div class={bem()} />
}
