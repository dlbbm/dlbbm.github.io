import { clss } from '@design-edito/tools/agnostic/css/clss/index.js'
import type { BuiltPost } from '../../../types/built.js'

const bem = clss('post')

export type PostProps = {
  post: BuiltPost
}

export function Post ({ post }: PostProps) {
  return <article class={bem()}>
    <h2 class={bem('title')}>{post.title}</h2>
  </article>
}
