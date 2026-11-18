import { clss } from '@design-edito/tools/agnostic/css/clss/index.js'
import { DateComponent } from '@mxfb/tools/components/Date/index.js'
import { pageNames } from '../../../shared/titles/index.js'
import type { BuiltPostIndexEntry } from '../../../shared/types/built.js'
import { Link } from '../../components/Link/index.js'
import { fetchPublishedPosts } from '../../utils/fetch/index.js'
import { useFetched } from '../../utils/fetched/index.js'
import { useDocumentTitle } from '../../utils/title/index.js'
import './styles.css'

const bem = clss('page-posts')

// What the title alone does not say: which version of the song this is. `kind` is free
// text, so whatever the data wrote is what shows.
function formatVersionNote (entry: BuiltPostIndexEntry): string | null {
  const parts = [entry.kind, entry.isCover ? 'cover' : null].filter(part => part !== null)
  return parts.length === 0 ? null : `(${parts.join(', ')})`
}

export function Posts () {
  const fetched = useFetched(async () => await fetchPublishedPosts(), [])
  useDocumentTitle(pageNames.posts)

  if (fetched.status === 'loading') return <div class={bem(null, 'loading')} />
  return <div class={bem()}>
    <ul class={bem('list')}>
      {fetched.value.map(entry => {
        const versionNote = formatVersionNote(entry)
        return <li class={bem('item')} key={entry.id}>
          <DateComponent
            date={new Date(entry.publishedOn)}
            format="{{MMM}} {{D}}{{th}}, {{YYYY}}"
            className={bem('date')} />
          <span class={bem('name')}>
            <Link href={entry.url} className={bem('link')}>{entry.title}</Link>
            {versionNote === null ? null : <span class={bem('qualifier')}>{` ${versionNote}`}</span>}
          </span>
        </li>
      })}
    </ul>
  </div>
}
