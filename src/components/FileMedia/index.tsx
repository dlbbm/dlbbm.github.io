import { clss } from '@design-edito/tools/agnostic/css/clss/index.js'
import type { FileSource } from '../../../shared/types/index.js'

const bem = clss('file-media')

export type FileMediaProps = {
  kind: FileSource['kind']
  path: FileSource['path']
  title: string
}

export function FileMedia ({ kind, path, title }: FileMediaProps) {
  // A stored path is relative to the repository root — `data/files/…` — and `build:data`
  // copies that tree into `dist` as it stands.
  const src = `/${path}`
  if (kind === 'video') return <video class={bem(null, kind)} src={src} title={title} controls preload="metadata" />
  return <audio class={bem(null, kind)} src={src} title={title} controls preload="metadata" />
}
