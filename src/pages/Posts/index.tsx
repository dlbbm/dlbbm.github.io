import { useEffect, useState } from 'preact/hooks'
import { Link } from 'wouter-preact'
import { clss } from '@design-edito/tools/agnostic/css/clss/index.js'
import { DateComponent } from '@mxfb/tools/components/Date/index.js'
import type { BuiltPostIndexEntry } from '../../../shared/types/built.js'
import { fetchPublishedPosts } from '../../utils/fetch/index.js'
import './styles.css'

const bem = clss('page-posts')

// What the title alone does not say: which version of the song this is. `kind` is free
// text, so whatever the data wrote is what shows.
function qualifier (entry: BuiltPostIndexEntry): string | null {
  const parts = [entry.kind, entry.isCover ? 'cover' : null].filter(part => part !== null)
  return parts.length === 0 ? null : `(${parts.join(', ')})`
}

export function Posts () {
  const [posts, setPosts] = useState<BuiltPostIndexEntry[] | null>(null)

  useEffect(() => {
    let current = true
    void fetchPublishedPosts().then(next => { if (current) setPosts(next) })
    return () => { current = false }
  }, [])

  if (posts === null) return <div class={bem(null, 'loading')} />
  return <div class={bem()}>
    <ul class={bem('list')}>
      {posts.map(entry => {
        const said = qualifier(entry)
        return <li class={bem('item')} key={entry.id}>
          <DateComponent
            date={new Date(entry.publishedOn)}
            format="{{MMM}} {{D}}{{th}}, {{YYYY}}"
            className={bem('date')} />
          <span class={bem('name')}>
            <Link href={entry.url} className={bem('link')}>{entry.title}</Link>
            {said === null ? null : <span class={bem('qualifier')}>{` ${said}`}</span>}
          </span>
        </li>
      })}
    </ul>
  </div>
}
