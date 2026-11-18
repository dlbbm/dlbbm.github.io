import { clss } from '@design-edito/tools/agnostic/css/clss/index.js'
import { FailureNotice, MissingNotice } from '../../components/Notice/index.js'
import { Pagination } from '../../components/Pagination/index.js'
import { PostArticle } from '../../components/PostArticle/index.js'
import { fetchPostPage } from '../../utils/fetch/index.js'
import { useFetched } from '../../utils/fetched/index.js'
import { useDocumentTitle } from '../../utils/title/index.js'
import './styles.css'

const bem = clss('page-home')

export type HomeProps = {
  page: number
}

export function Home ({ page }: HomeProps) {
  const fetched = useFetched(async () => await fetchPostPage(page), [page])
  useDocumentTitle(page === 1 ? null : `Page ${page}`)

  if (fetched.status === 'loading') return <div class={bem(null, 'loading')} />
  if (fetched.status === 'failed') return <div class={bem(null, 'failed')}>
    <FailureNotice />
  </div>
  const postPage = fetched.value
  // The pagination stays on a page that does not exist: the stream may have moved since
  // the URL was shared, so the two ends are the way back.
  if (!postPage.exists) return <div class={bem(null, 'missing')}>
    <MissingNotice>There is no such page.</MissingNotice>
    <Pagination page={postPage.page} pageCount={postPage.pageCount} pageExists={false} />
  </div>
  return <div class={bem()}>
    {postPage.page === 1
      ? null
      : <Pagination page={postPage.page} pageCount={postPage.pageCount} />}
    <ol class={bem('posts')}>
      {postPage.posts.map(post => <li class={bem('post')} key={post.id}>
        <PostArticle post={post} />
      </li>)}
    </ol>
    <Pagination page={postPage.page} pageCount={postPage.pageCount} />
  </div>
}
