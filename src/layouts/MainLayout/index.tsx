import type { ComponentChildren } from 'preact'
import { clss } from '@design-edito/tools/agnostic/css/clss/index.js'
import { Logo } from '../../components/Logo/index.js'
import { MainNav } from '../../components/MainNav/index.js'
import './styles.css'

const bem = clss('main-layout')

export type MainLayoutProps = {
  children: ComponentChildren
}

// Wrapped once around the router rather than called by each page: with a single layout,
// a page calling it would unmount the header on every navigation.
export function MainLayout ({ children }: MainLayoutProps) {
  return <div class={bem()}>
    <div class={bem('rule')} />
    <div class={bem('body')}>
      <header class={bem('header')}>
        <Logo />
        <MainNav />
      </header>
      <main class={bem('main')}>{children}</main>
    </div>
  </div>
}
