import { useEffect, useState } from 'preact/hooks'
import { clss } from '@design-edito/tools/agnostic/css/clss/index.js'
import { Pagination } from '../../components/Pagination/index.js'
import { Post } from '../../components/Post/index.js'
import { fetchPostPage, type PostPage } from '../../utils/fetch/index.js'
import './styles.css'

const bem = clss('page-home')

export type HomeProps = {
  page: number
}

export function Home ({ page }: HomeProps) {
  const [loaded, setLoaded] = useState<PostPage | null>(null)

  useEffect(() => {
    let current = true
    setLoaded(null)
    void fetchPostPage(page).then(next => { if (current) setLoaded(next) })
    return () => { current = false }
  }, [page])

  if (loaded === null) return <div class={bem(null, 'loading')} />
  return <div class={bem()}>
    <ol class={bem('posts')}>
      {loaded.posts.map(post => <li class={bem('post')} key={post.id}>
        <Post post={post} />
      </li>)}
    </ol>
    <Pagination page={loaded.page} pageCount={loaded.pageCount} />
  </div>
}
