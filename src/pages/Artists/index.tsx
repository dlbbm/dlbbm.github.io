import { clss } from '@design-edito/tools/agnostic/css/clss/index.js'
import { pageNames } from '../../../shared/titles/index.js'
import { Link } from '../../components/Link/index.js'
import { WhenLoaded } from '../../components/WhenLoaded/index.js'
import { fetchArtists } from '../../utils/fetch/index.js'
import { useFetched } from '../../utils/fetched/index.js'
import { useDocumentTitle } from '../../utils/title/index.js'
import './styles.css'

const c = clss('page-artists')

export function Artists () {
  const fetched = useFetched(async () => await fetchArtists(), [])
  useDocumentTitle(pageNames.artists)

  return <WhenLoaded fetched={fetched} c={c}>
    {artists => <div class={c()}>
      <ul class={c('list')}>
        {artists.map(artist => <li class={c('item')} key={artist.id}>
          <Link href={artist.url} className={c('link')}>{artist.name}</Link>
        </li>)}
      </ul>
    </div>}
  </WhenLoaded>
}
