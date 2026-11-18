import { clss } from '@design-edito/tools/agnostic/css/clss/index.js'
import { pageNames } from '../../../shared/titles/index.js'
import { Link } from '../../components/Link/index.js'
import { FailureNotice } from '../../components/Notice/index.js'
import { fetchArtists } from '../../utils/fetch/index.js'
import { useFetched } from '../../utils/fetched/index.js'
import { useDocumentTitle } from '../../utils/title/index.js'
import './styles.css'

const bem = clss('page-artists')

export function Artists () {
  const fetched = useFetched(async () => await fetchArtists(), [])
  useDocumentTitle(pageNames.artists)

  if (fetched.status === 'loading') return <div class={bem(null, 'loading')} />
  if (fetched.status === 'failed') return <div class={bem(null, 'failed')}>
    <FailureNotice />
  </div>
  return <div class={bem()}>
    <ul class={bem('list')}>
      {fetched.value.map(artist => <li class={bem('item')} key={artist.id}>
        <Link href={artist.url} className={bem('link')}>{artist.name}</Link>
      </li>)}
    </ul>
  </div>
}
