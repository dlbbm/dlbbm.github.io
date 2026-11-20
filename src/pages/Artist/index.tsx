import { clss } from '@design-edito/tools/agnostic/css/clss/index.js'
import { MissingNotice } from '../../components/Notice/index.js'
import { PostArticle } from '../../components/PostArticle/index.js'
import { WhenLoaded } from '../../components/WhenLoaded/index.js'
import * as data from '../../data/index.js'
import { useFetched } from '../../fetched/index.js'
import { known, unknown, useDocumentTitle } from '../../title/index.js'
import './styles.css'

const c = clss('page-artist')

export type ArtistProps = {
  slug: string
}

export function Artist ({ slug }: ArtistProps) {
  const fetched = useFetched(async () => await data.artistWithPosts(slug), [slug])
  useDocumentTitle(fetched.status === 'loaded' ? known(fetched.value?.artist.name ?? null) : unknown)

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
