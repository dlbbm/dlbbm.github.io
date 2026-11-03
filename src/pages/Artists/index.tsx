import { useEffect, useState } from 'preact/hooks'
import { Link } from 'wouter-preact'
import { clss } from '@design-edito/tools/agnostic/css/clss/index.js'
import type { BuiltArtistIndexEntry } from '../../../shared/types/built.js'
import { fetchArtists } from '../../utils/fetch/index.js'
import './styles.css'

const bem = clss('page-artists')

export function Artists () {
  const [artists, setArtists] = useState<BuiltArtistIndexEntry[] | null>(null)

  useEffect(() => {
    let current = true
    void fetchArtists().then(next => { if (current) setArtists(next) })
    return () => { current = false }
  }, [])

  if (artists === null) return <div class={bem(null, 'loading')} />
  return <div class={bem()}>
    <ul class={bem('list')}>
      {artists.map(artist => <li class={bem('item')} key={artist.id}>
        <Link href={artist.url} className={bem('link')}>{artist.name}</Link>
      </li>)}
    </ul>
  </div>
}
