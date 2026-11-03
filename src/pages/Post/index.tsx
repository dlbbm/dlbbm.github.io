import { useEffect, useState } from 'preact/hooks'
import { clss } from '@design-edito/tools/agnostic/css/clss/index.js'
import type { PostId } from '../../../shared/types/index.js'
import type { BuiltPost } from '../../../shared/types/built.js'
import { Post as PostArticle } from '../../components/Post/index.js'
import { fetchPost } from '../../utils/fetch/index.js'
import { useDocumentTitle } from '../../utils/title/index.js'
import './styles.css'

const bem = clss('page-post')

export type PostProps = {
  id: PostId
}

// One post, read the way the stream reads it. `loaded` holds three states and not two:
// `null` while it is being fetched, a post, or `{ post: null }` once it is known there
// is none — a post that is missing looks exactly like one that has not arrived yet.
export function Post ({ id }: PostProps) {
  const [loaded, setLoaded] = useState<{ post: BuiltPost | null } | null>(null)
  useDocumentTitle(loaded === null ? undefined : loaded.post?.title ?? null)

  useEffect(() => {
    let current = true
    setLoaded(null)
    void fetchPost(id).then(post => { if (current) setLoaded({ post }) })
    return () => { current = false }
  }, [id])

  if (loaded === null) return <div class={bem(null, 'loading')} />
  if (loaded.post === null) return <div class={bem(null, 'missing')}>
    <p class={bem('message')}>There is no such post.</p>
  </div>
  return <div class={bem()}>
    <PostArticle post={loaded.post} />
  </div>
}
