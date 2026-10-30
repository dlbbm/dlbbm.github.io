import { clss } from '@design-edito/tools/agnostic/css/clss/index.js'
import type { PostId } from '../../../shared/types/index.js'

const bem = clss('page-post')

export type PostProps = {
  id: PostId
}

export function Post ({ id }: PostProps) {
  return <div class={bem()} data-post={id} />
}
