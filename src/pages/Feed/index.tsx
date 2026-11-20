import { clss } from '@design-edito/tools/agnostic/css/clss/index.js'
import { MissingNotice } from '../../components/Notice/index.js'
import { Pagination } from '../../components/Pagination/index.js'
import { PostArticle } from '../../components/PostArticle/index.js'
import { WhenLoaded } from '../../components/WhenLoaded/index.js'
import * as data from '../../data/index.js'
import { useFetched } from '../../fetched/index.js'
import { known, useDocumentTitle } from '../../title/index.js'
import './styles.css'

const c = clss('page-feed')

export type FeedProps = {
  page: number
}

export function Feed ({ page }: FeedProps) {
  const fetched = useFetched(async () => await data.streamPage(page), [page])
  useDocumentTitle(known(page === 1 ? null : `Page ${page}`))

  return <WhenLoaded fetched={fetched} c={c}>
    {streamPage => {
      // The pagination stays on a page that does not exist: the stream may have moved
      // since the URL was shared, so the two ends are the way back.
      if (!streamPage.exists) return <div class={c(null, 'missing')}>
        <MissingNotice>There is no such page.</MissingNotice>
        <Pagination page={streamPage.page} pageCount={streamPage.pageCount} pageExists={false} />
      </div>
      return <div class={c()}>
        {streamPage.page === 1
          ? null
          : <Pagination page={streamPage.page} pageCount={streamPage.pageCount} />}
        <ol class={c('posts')}>
          {streamPage.posts.map(post => <li class={c('post')} key={post.id}>
            <PostArticle post={post} />
          </li>)}
        </ol>
        <Pagination page={streamPage.page} pageCount={streamPage.pageCount} />
      </div>
    }}
  </WhenLoaded>
}
