import { clss } from '@design-edito/tools/agnostic/css/clss/index.js'
import type { PostId } from '../../../shared/types/index.js'
import { PostArticle } from '../../components/PostArticle/index.js'
import { fetchPost } from '../../utils/fetch/index.js'
import { useFetched } from '../../utils/fetched/index.js'
import { useDocumentTitle } from '../../utils/title/index.js'
import './styles.css'

const bem = clss('page-post')

export type PostProps = {
  id: PostId
}

// One post, read the way the stream reads it. A post that is missing is `null` and loaded,
// which is not the same thing as one that has not arrived: the title waits for the first
// and says the site's own name for the second.
export function Post ({ id }: PostProps) {
  const fetched = useFetched(async () => await fetchPost(id), [id])
  useDocumentTitle(fetched.status === 'loading' ? undefined : fetched.value?.title ?? null)

  if (fetched.status === 'loading') return <div class={bem(null, 'loading')} />
  const post = fetched.value
  if (post === null) return <div class={bem(null, 'missing')}>
    <p class={bem('message')}>There is no such post.</p>
  </div>
  return <div class={bem()}>
    <PostArticle post={post} />
  </div>
}
