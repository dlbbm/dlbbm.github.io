import { clss } from '@design-edito/tools/agnostic/css/clss/index.js'
import type { Slug } from '../../../types/index.js'

const bem = clss('page-artist')

export type ArtistProps = {
  slug: Slug['slug']
}

export function Artist ({ slug }: ArtistProps) {
  return <div class={bem()} data-artist={slug} />
}
