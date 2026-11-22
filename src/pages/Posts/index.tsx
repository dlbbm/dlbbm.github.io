import { Link } from 'wouter-preact'
import { clss } from '@design-edito/tools/agnostic/css/clss/index.js'
import { DateComponent } from '@mxfb/tools/components/Date/index.js'
import * as titles from '../../../shared/titles/index.js'
import type * as built from '../../../shared/types/built.js'
import { WhenLoaded } from '../../components/WhenLoaded/index.js'
import * as data from '../../data/index.js'
import { useFetched } from '../../fetched/index.js'
import { known, useDocumentTitle } from '../../title/index.js'
import './styles.css'

const c = clss('page-posts')

// What the title alone does not say: which version of the song this is. `kind` is free
// text, so whatever the data wrote is what shows.
function formatVersionNote (entry: built.PostIndexEntry): string | null {
  const parts = [entry.kind, entry.isCover ? 'cover' : null].filter(part => part !== null)
  return parts.length === 0 ? null : `(${parts.join(', ')})`
}

export function Posts () {
  const fetched = useFetched(async () => await data.publishedPosts(), [])
  useDocumentTitle(known(titles.names.posts))

  // The index is written by the build, so it is never missing without being broken: there
  // is nothing to say here that the failure does not already say.
  return <WhenLoaded fetched={fetched} c={c}>
    {entries => <div class={c()}>
      <ul class={c('list')}>
        {entries.map(entry => {
          const versionNote = formatVersionNote(entry)
          return <li class={c('item')} key={entry.id}>
            <DateComponent
              date={new Date(entry.publishedOn)}
              format="{{MMM}} {{D}}{{th}}, {{YYYY}}"
              className={c('date')} />
            <span class={c('name')}>
              <Link href={entry.url} className={c('link')}>{entry.title}</Link>
              {versionNote === null ? null : <span class={c('qualifier')}>{` ${versionNote}`}</span>}
            </span>
          </li>
        })}
      </ul>
    </div>}
  </WhenLoaded>
}
