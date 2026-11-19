import { clss } from '@design-edito/tools/agnostic/css/clss/index.js'
import { FailureNotice, MissingNotice } from '../../components/Notice/index.js'
import { PostArticle } from '../../components/PostArticle/index.js'
import { fetchArtistWithPosts } from '../../utils/fetch/index.js'
import { useFetched } from '../../utils/fetched/index.js'
import { useDocumentTitle } from '../../utils/title/index.js'
import './styles.css'

const bem = clss('page-artist')

export type ArtistProps = {
  slug: string
}

export function Artist ({ slug }: ArtistProps) {
  const fetched = useFetched(async () => await fetchArtistWithPosts(slug), [slug])
  useDocumentTitle(fetched.status === 'loaded' ? fetched.value?.artist.name ?? null : undefined)

  if (fetched.status === 'loading') return <div class={bem(null, 'loading')} />
  if (fetched.status === 'failed') return <div class={bem(null, 'failed')}>
    <FailureNotice />
  </div>
  const artistWithPosts = fetched.value
  if (artistWithPosts === null) return <div class={bem(null, 'missing')}>
    <MissingNotice>There is no such artist.</MissingNotice>
  </div>
  return <div class={bem()}>
    <h1 class={bem('name')}>{artistWithPosts.artist.name}</h1>
    <ol class={bem('posts')}>
      {artistWithPosts.posts.map(post => <li class={bem('post')} key={post.id}>
        <PostArticle post={post} />
      </li>)}
    </ol>
  </div>
}
