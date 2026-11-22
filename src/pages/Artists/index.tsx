import { Link } from 'wouter-preact'
import { clss } from '@design-edito/tools/agnostic/css/clss/index.js'
import * as titles from '../../../shared/titles/index.js'
import { WhenLoaded } from '../../components/WhenLoaded/index.js'
import * as data from '../../data/index.js'
import { useFetched } from '../../fetched/index.js'
import { known, useDocumentTitle } from '../../title/index.js'
import './styles.css'

const c = clss('page-artists')

export function Artists () {
  const fetched = useFetched(async () => await data.artists(), [])
  useDocumentTitle(known(titles.names.artists))

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
