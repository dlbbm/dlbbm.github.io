import { Link, useLocation } from 'wouter-preact'
import { clss } from '@design-edito/tools/agnostic/css/clss/index.js'
import { routePatterns } from '../../../routes/index.js'
import { fetchPublishedPosts } from '../../fetch/index.js'

const bem = clss('main-nav')

const links = [
  { label: 'about', href: routePatterns.about },
  { label: 'artists', href: routePatterns.artists },
  { label: 'posts', href: routePatterns.posts }
]

export function MainNav () {
  const [, navigate] = useLocation()

  // Random has no URL of its own: it reads the index, picks, and goes there. A `/random`
  // route would need a shell, and a shared link would land somewhere else on reload.
  async function goToRandomPost (): Promise<void> {
    const posts = await fetchPublishedPosts()
    const picked = posts[Math.floor(Math.random() * posts.length)]
    if (picked !== undefined) navigate(picked.url)
  }

  return <nav class={bem()}>
    <ul class={bem('list')}>
      {links.map(link => <li class={bem('item')} key={link.href}>
        <Link
          href={link.href}
          className={isCurrent => bem('link', { current: isCurrent })}>{link.label}</Link>
      </li>)}
      <li class={bem('item')}>
        <button
          class={bem('link')}
          type="button"
          onClick={() => { void goToRandomPost() }}>random</button>
      </li>
    </ul>
  </nav>
}
