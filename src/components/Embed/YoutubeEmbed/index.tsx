import { clss } from '@design-edito/tools/agnostic/css/clss/index.js'

const bem = clss('youtube-embed')

export type YoutubeEmbedProps = {
  url: string
  title: string
}

// The forms `post:create` accepts, which is what the data holds.
function videoId (raw: string): string | null {
  let url: URL
  try { url = new URL(raw) }
  catch { return null }
  if (url.hostname === 'youtu.be') {
    const fromPath = url.pathname.slice(1).split('/')[0] ?? ''
    return fromPath === '' ? null : fromPath
  }
  const fromQuery = url.searchParams.get('v')
  if (fromQuery !== null && fromQuery !== '') return fromQuery
  return /^\/(?:shorts|embed|live|v)\/([^/]+)/.exec(url.pathname)?.[1] ?? null
}

export function YoutubeEmbed ({ url, title }: YoutubeEmbedProps) {
  const id = videoId(url)
  if (id === null) return <a class={bem('link')} href={url}>{title}</a>
  return <iframe
    class={bem()}
    src={`https://www.youtube.com/embed/${id}`}
    title={title}
    loading="lazy"
    allow="accelerometer; clipboard-write; encrypted-media; fullscreen; picture-in-picture" />
}
