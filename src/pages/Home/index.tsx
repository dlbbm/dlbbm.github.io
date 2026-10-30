import { clss } from '@design-edito/tools/agnostic/css/clss/index.js'

const bem = clss('page-home')

export type HomeProps = {
  page: number
}

export function Home ({ page }: HomeProps) {
  return <div class={bem()} data-page={page} />
}
