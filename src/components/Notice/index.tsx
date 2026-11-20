/**
 * What a page says when it has nothing to show: a fact about the site (`MissingNotice`)
 * or a fact about this moment (`FailureNotice`). Nothing to press — a reload is the only
 * answer to a failed read, and the browser already has that button.
 */

import type { ComponentChildren } from 'preact'
import { clss } from '@design-edito/tools/agnostic/css/clss/index.js'
import './styles.css'

const c = clss('notice')

export type MissingNoticeProps = {
  children: ComponentChildren
}

export function MissingNotice ({ children }: MissingNoticeProps) {
  return <p class={c()}>{children}</p>
}

export function FailureNotice () {
  return <p class={c()}>This did not load. Reload the page to try again.</p>
}
