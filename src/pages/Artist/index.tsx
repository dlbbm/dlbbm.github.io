import { clss } from '@design-edito/tools/agnostic/css/clss/index.js'
import { MissingNotice } from '../../components/Notice/index.js'
import { PostArticle } from '../../components/PostArticle/index.js'
import { WhenLoaded } from '../../components/WhenLoaded/index.js'
import { fetchArtistWithPosts } from '../../utils/fetch/index.js'
import { useFetched } from '../../utils/fetched/index.js'
import { useDocumentTitle } from '../../utils/title/index.js'
import './styles.css'

const c = clss('page-artist')

export type ArtistProps = {
  slug: string
}

export function Artist ({ slug }: ArtistProps) {
  const fetched = useFetched(async () => await fetchArtistWithPosts(slug), [slug])
  useDocumentTitle(fetched.status === 'loaded' ? fetched.value?.artist.name ?? null : undefined)

  return <WhenLoaded fetched={fetched} c={c}>
    {artistWithPosts => {
      if (artistWithPosts === null) return <div class={c(null, 'missing')}>
        <MissingNotice>There is no such artist.</MissingNotice>
      </div>
      return <div class={c()}>
        <h1 class={c('name')}>{artistWithPosts.artist.name}</h1>
        <ol class={c('posts')}>
          {artistWithPosts.posts.map(post => <li class={c('post')} key={post.id}>
            <PostArticle post={post} />
          </li>)}
        </ol>
      </div>
    }}
  </WhenLoaded>
}
