import { clss } from '@design-edito/tools/agnostic/css/clss/index.js'

const bem = clss('file-media')

export type FileMediaProps = {
  src: string
  kind: 'audio' | 'video'
  title: string
}

export function FileMedia ({ src, kind, title }: FileMediaProps) {
  if (kind === 'video') return <video class={bem(null, kind)} src={src} title={title} controls preload="metadata" />
  return <audio class={bem(null, kind)} src={src} title={title} controls preload="metadata" />
}
