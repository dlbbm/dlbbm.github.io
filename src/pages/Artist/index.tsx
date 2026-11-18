import { clss } from '@design-edito/tools/agnostic/css/clss/index.js'
import { PostArticle } from '../../components/PostArticle/index.js'
import { fetchArtistPage } from '../../utils/fetch/index.js'
import { useFetched } from '../../utils/fetched/index.js'
import { useDocumentTitle } from '../../utils/title/index.js'
import './styles.css'

const bem = clss('page-artist')

export type ArtistProps = {
  slug: string
}

export function Artist ({ slug }: ArtistProps) {
  const fetched = useFetched(async () => await fetchArtistPage(slug), [slug])
  useDocumentTitle(fetched.status === 'loading' ? undefined : fetched.value?.artist.name ?? null)

  if (fetched.status === 'loading') return <div class={bem(null, 'loading')} />
  const artistPage = fetched.value
  if (artistPage === null) return <div class={bem(null, 'missing')}>
    <p class={bem('message')}>There is no such artist.</p>
  </div>
  return <div class={bem()}>
    <h1 class={bem('name')}>{artistPage.artist.name}</h1>
    <ol class={bem('posts')}>
      {artistPage.posts.map(post => <li class={bem('post')} key={post.id}>
        <PostArticle post={post} />
      </li>)}
    </ol>
  </div>
}
