import { clss } from '@design-edito/tools/agnostic/css/clss/index.js'

const bem = clss('vimeo-embed')

export type VimeoEmbedProps = {
  url: string
  title: string
}

// The id is the last run of digits in the path: `/123`, `/video/123`, `/channels/x/123`.
// An unlisted video carries a hash after it (`/123/abcdef`), which the player needs as `h`.
function videoId (raw: string): { id: string, hash: string | null } | null {
  let url: URL
  try { url = new URL(raw) }
  catch { return null }
  const match = /\/(\d+)(?:\/([A-Za-z0-9]+))?\/?$/.exec(url.pathname)
  if (match?.[1] === undefined) return null
  return { id: match[1], hash: match[2] ?? null }
}

export function VimeoEmbed ({ url, title }: VimeoEmbedProps) {
  const video = videoId(url)
  if (video === null) return <a class={bem('link')} href={url}>{title}</a>
  const query = video.hash === null ? '' : `?h=${video.hash}`
  return <iframe
    class={bem()}
    src={`https://player.vimeo.com/video/${video.id}${query}`}
    title={title}
    loading="lazy"
    allow="autoplay; fullscreen; picture-in-picture" />
}
