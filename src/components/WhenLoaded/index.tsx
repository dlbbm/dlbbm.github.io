/**
 * A page's body once its read has arrived, and what stands there until then.
 *
 * The six pages that fetch wrote the same two guards by hand before anything else they
 * had to say. The classes stay the page's own, so a page styles its own waiting state:
 * `bem` is the block's maker, and the modifiers are `--loading` and `--failed`.
 */

import type { ClssMaker } from '@design-edito/tools/agnostic/css/clss/index.js'
import type { VNode } from 'preact'
import type { Fetched } from '../../utils/fetched/index.js'
import { FailureNotice } from '../Notice/index.js'

export type WhenLoadedProps<T> = {
  fetched: Fetched<T>
  bem: ClssMaker
  children: (value: T) => VNode
}

export function WhenLoaded<T> ({
  fetched,
  bem,
  children
}: WhenLoadedProps<T>) {
  if (fetched.status === 'loading') return <div class={bem(null, 'loading')} />
  if (fetched.status === 'failed') return <div class={bem(null, 'failed')}>
    <FailureNotice />
  </div>
  return children(fetched.value)
}
