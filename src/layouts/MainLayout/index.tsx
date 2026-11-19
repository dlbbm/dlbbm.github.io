import type { ComponentChildren } from 'preact'
import { clss } from '@design-edito/tools/agnostic/css/clss/index.js'
import { Logo } from '../../components/Logo/index.js'
import { MainNav } from '../../components/MainNav/index.js'
import './styles.css'

const c = clss('main-layout')

export type MainLayoutProps = {
  children: ComponentChildren
}

// Wrapped once around the router rather than called by each page: with a single layout,
// a page calling it would unmount the header on every navigation.
export function MainLayout ({ children }: MainLayoutProps) {
  return <div class={c()}>
    <div class={c('rule')} />
    <div class={c('body')}>
      <header class={c('header')}>
        <Logo />
        <MainNav />
      </header>
      <main class={c('main')}>{children}</main>
    </div>
  </div>
}
