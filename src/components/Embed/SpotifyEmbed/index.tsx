import { clss } from '@design-edito/tools/agnostic/css/clss/index.js'

const bem = clss('spotify-embed')

export type SpotifyEmbedProps = {
  url: string
  title: string
}

// `/intl-fr/track/ID` is the shape a shared link has these days, hence the optional locale.
function embedPath (raw: string): string | null {
  let url: URL
  try { url = new URL(raw) }
  catch { return null }
  const match = /^(?:\/intl-[a-z]{2})?\/(track|album|playlist|episode)\/([A-Za-z0-9]+)/.exec(url.pathname)
  if (match === null) return null
  return `${match[1]}/${match[2]}`
}

export function SpotifyEmbed ({ url, title }: SpotifyEmbedProps) {
  const path = embedPath(url)
  if (path === null) return <a class={bem('link')} href={url}>{title}</a>
  return <iframe
    class={bem()}
    src={`https://open.spotify.com/embed/${path}`}
    title={title}
    loading="lazy"
    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" />
}
