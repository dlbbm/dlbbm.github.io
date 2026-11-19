import { clss } from '@design-edito/tools/agnostic/css/clss/index.js'
import { MissingNotice } from '../../components/Notice/index.js'
import { Pagination } from '../../components/Pagination/index.js'
import { PostArticle } from '../../components/PostArticle/index.js'
import { WhenLoaded } from '../../components/WhenLoaded/index.js'
import { fetchStreamPage } from '../../utils/fetch/index.js'
import { useFetched } from '../../utils/fetched/index.js'
import { useDocumentTitle } from '../../utils/title/index.js'
import './styles.css'

const bem = clss('page-home')

export type HomeProps = {
  page: number
}

export function Home ({ page }: HomeProps) {
  const fetched = useFetched(async () => await fetchStreamPage(page), [page])
  useDocumentTitle(page === 1 ? null : `Page ${page}`)

  return <WhenLoaded fetched={fetched} bem={bem}>
    {streamPage => {
      // The pagination stays on a page that does not exist: the stream may have moved
      // since the URL was shared, so the two ends are the way back.
      if (!streamPage.exists) return <div class={bem(null, 'missing')}>
        <MissingNotice>There is no such page.</MissingNotice>
        <Pagination page={streamPage.page} pageCount={streamPage.pageCount} pageExists={false} />
      </div>
      return <div class={bem()}>
        {streamPage.page === 1
          ? null
          : <Pagination page={streamPage.page} pageCount={streamPage.pageCount} />}
        <ol class={bem('posts')}>
          {streamPage.posts.map(post => <li class={bem('post')} key={post.id}>
            <PostArticle post={post} />
          </li>)}
        </ol>
        <Pagination page={streamPage.page} pageCount={streamPage.pageCount} />
      </div>
    }}
  </WhenLoaded>
}
