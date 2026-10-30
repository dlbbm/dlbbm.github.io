import type { FunctionComponent } from 'preact'
import { clss } from '@design-edito/tools/agnostic/css/clss/index.js'
import type { MediaService } from '../../../shared/types/index.js'
import { SpotifyEmbed } from './SpotifyEmbed/index.js'
import { VimeoEmbed } from './VimeoEmbed/index.js'
import { YoutubeEmbed } from './YoutubeEmbed/index.js'

const bem = clss('embed')

type PlatformEmbedProps = {
  url: string
  title: string
}

// `null` is a platform with no player of its own, which gets a link instead. A host added
// to `mediaServices` fails to typecheck until it is named here, one way or the other.
const platformEmbeds: Record<MediaService, FunctionComponent<PlatformEmbedProps> | null> = {
  youtube: YoutubeEmbed,
  spotify: SpotifyEmbed,
  vimeo: VimeoEmbed,
  soundcloud: null,
  bandcamp: null,
  mixcloud: null
}

export type EmbedProps = {
  platform: MediaService
  url: string
  title: string
}

export function Embed ({ platform, url, title }: EmbedProps) {
  const PlatformEmbed = platformEmbeds[platform]
  return <div class={bem(null, platform)}>
    {PlatformEmbed === null
      ? <a class={bem('link')} href={url}>{title}</a>
      : <PlatformEmbed url={url} title={title} />}
  </div>
}
