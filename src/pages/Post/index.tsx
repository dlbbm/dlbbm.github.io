import { clss } from '@design-edito/tools/agnostic/css/clss/index.js'
import type { PostId } from '../../../shared/types/index.js'
import { MissingNotice } from '../../components/Notice/index.js'
import { PostArticle } from '../../components/PostArticle/index.js'
import { WhenLoaded } from '../../components/WhenLoaded/index.js'
import * as data from '../../data/index.js'
import { useFetched } from '../../fetched/index.js'
import { known, unknown, useDocumentTitle } from '../../title/index.js'

const c = clss('page-post')

export type PostProps = {
  id: PostId
}

// One post, read the way the stream reads it. A post that is missing is `null` and loaded,
// which is not the same thing as one that has not arrived: the title waits for the first
// and says the site's own name for the second.
export function Post ({ id }: PostProps) {
  const fetched = useFetched(async () => await data.post(id), [id])
  useDocumentTitle(fetched.status === 'loaded' ? known(fetched.value?.title ?? null) : unknown)

  return <WhenLoaded fetched={fetched} c={c}>
    {post => {
      if (post === null) return <div class={c(null, 'missing')}>
        <MissingNotice>There is no such post.</MissingNotice>
      </div>
      return <div class={c()}>
        <PostArticle post={post} />
      </div>
    }}
  </WhenLoaded>
}
