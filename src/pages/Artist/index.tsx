import { useEffect, useState } from 'preact/hooks'
import { clss } from '@design-edito/tools/agnostic/css/clss/index.js'
import { Post } from '../../components/Post/index.js'
import { fetchArtistPage, type ArtistPage } from '../../utils/fetch/index.js'
import { useDocumentTitle } from '../../utils/title/index.js'
import './styles.css'

const bem = clss('page-artist')

export type ArtistProps = {
  slug: string
}

export function Artist ({ slug }: ArtistProps) {
  const [loaded, setLoaded] = useState<{ page: ArtistPage | null } | null>(null)
  useDocumentTitle(loaded === null ? undefined : loaded.page?.artist.name ?? null)

  useEffect(() => {
    let current = true
    setLoaded(null)
    void fetchArtistPage(slug).then(page => { if (current) setLoaded({ page }) })
    return () => { current = false }
  }, [slug])

  if (loaded === null) return <div class={bem(null, 'loading')} />
  if (loaded.page === null) return <div class={bem(null, 'missing')}>
    <p class={bem('message')}>There is no such artist.</p>
  </div>
  return <div class={bem()}>
    <h1 class={bem('name')}>{loaded.page.artist.name}</h1>
    <ol class={bem('posts')}>
      {loaded.page.posts.map(post => <li class={bem('post')} key={post.id}>
        <Post post={post} />
      </li>)}
    </ol>
  </div>
}
