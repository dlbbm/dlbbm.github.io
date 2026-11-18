/**
 * What a page says when it has nothing to show.
 *
 * Two things a reader has to be able to tell apart: the blog does not have what was
 * asked for, which is a fact about the site, and the page could not read what it needed,
 * which is a fact about this moment and goes away on a reload. Same shape on every page,
 * so neither sentence is written twice.
 *
 * Nothing to press: a reload is the only answer to a failed read, and the browser already
 * has that button.
 */

import type { ComponentChildren } from 'preact'
import { clss } from '@design-edito/tools/agnostic/css/clss/index.js'
import './styles.css'

const bem = clss('notice')

export type MissingNoticeProps = {
  children: ComponentChildren
}

/** Something the blog does not have. The page names what was looked for. */
export function MissingNotice ({ children }: MissingNoticeProps) {
  return <p class={bem(null, 'missing')}>{children}</p>
}

/** A read that did not arrive. The same sentence wherever it happens. */
export function FailureNotice () {
  return <p class={bem(null, 'failed')}>This did not load. Reload the page to try again.</p>
}
