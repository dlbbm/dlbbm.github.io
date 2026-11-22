import { Link, useLocation } from 'wouter-preact'
import { clss } from '@design-edito/tools/agnostic/css/clss/index.js'
import * as routes from '../../../shared/routes/index.js'
import * as data from '../../data/index.js'
import './styles.css'

const c = clss('main-nav')

const links = [
  { label: 'about', href: routes.patterns.about },
  { label: 'artists', href: routes.patterns.artists },
  { label: 'posts', href: routes.patterns.posts }
]

export function MainNav () {
  const [, navigate] = useLocation()

  // Random has no URL of its own: it reads the index, picks, and goes there. A `/random`
  // route would need a shell, and a shared link would land somewhere else on reload.
  // Reading the whole index on each click is the point — it is one file the browser has
  // cached by then, and a count held from an earlier read would miss a post that came of
  // age since.
  async function goToRandomPost (): Promise<void> {
    const posts = await data.publishedPosts()
    const picked = posts[Math.floor(Math.random() * posts.length)]
    if (picked !== undefined) navigate(picked.url)
  }

  return <nav class={c()}>
    <ul class={c('list')}>
      {links.map(link => <li class={c('item')} key={link.href}>
        <Link
          href={link.href}
          className={(isCurrent: boolean) => c('link', { current: isCurrent })}>{link.label}</Link>
      </li>)}
      <li class={c('item')}>
        <button
          class={c('link')}
          type="button"
          onClick={() => { void goToRandomPost() }}>random</button>
      </li>
    </ul>
  </nav>
}
