import { clss } from '@design-edito/tools/agnostic/css/clss/index.js'

const bem = clss('page-posts')

export function Posts () {
  return <div class={bem()} />
}
