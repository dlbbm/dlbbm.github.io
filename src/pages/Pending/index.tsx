import { clss } from '@design-edito/tools/agnostic/css/clss/index.js'
import * as titles from '../../../shared/titles/index.js'
import { MissingNotice } from '../../components/Notice/index.js'
import { PostArticle } from '../../components/PostArticle/index.js'
import { WhenLoaded } from '../../components/WhenLoaded/index.js'
import * as data from '../../data/index.js'
import { useFetched } from '../../fetched/index.js'
import { known, useDocumentTitle } from '../../title/index.js'
import './styles.css'

const c = clss('page-pending')

// Like the feed, but the other way round: what has not come of age yet, soonest first.
export function Pending () {
  const fetched = useFetched(async () => await data.pendingPosts(), [])
  useDocumentTitle(known(titles.names.pending))

  return <WhenLoaded fetched={fetched} c={c}>
    {posts => posts.length === 0
      ? <div class={c(null, 'missing')}>
        <MissingNotice>Nothing scheduled.</MissingNotice>
      </div>
      : <ol class={c()}>
        {posts.map(post => <li class={c('post')} key={post.id}>
          <PostArticle post={post} />
        </li>)}
      </ol>}
  </WhenLoaded>
}
