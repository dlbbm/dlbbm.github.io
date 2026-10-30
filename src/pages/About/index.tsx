import { clss } from '@design-edito/tools/agnostic/css/clss/index.js'

const bem = clss('page-about')

export function About () {
  return <div class={bem()} />
}
