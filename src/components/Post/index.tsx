import type { ComponentChildren } from 'preact'
import { Link } from 'wouter-preact'
import { clss } from '@design-edito/tools/agnostic/css/clss/index.js'
import { Embed } from '@mxfb/tools/components/Embed/index.js'
import type { BuiltArtist, BuiltPost } from '../../../shared/types/built.js'
import type { FileSource, MediaSource, Source } from '../../../shared/types/index.js'
import { formatPlace } from '../../utils/format/index.js'
import { FileMedia } from '../FileMedia/index.js'
import { PartialDate } from '../PartialDate/index.js'

const bem = clss('post')

type PlayableSource = MediaSource | FileSource

// An identity source is a claim that this is the same thing as that one. Nothing to hear,
// so it belongs with the metadata and never in the media block.
function isPlayable (source: Source): source is PlayableSource {
  return source.nature !== 'identity'
}

function sourceLink (source: Source): { href: string, label: string } {
  if (source.nature === 'file') return { href: `/${source.path}`, label: source.path }
  return { href: source.url, label: source.service }
}

function Media ({ source, title }: { source: PlayableSource, title: string }) {
  // A stored path is relative to the repository root — `data/files/…` — and `build:data`
  // copies that tree into `dist` as it stands.
  if (source.nature === 'file') return <FileMedia src={`/${source.path}`} kind={source.kind} title={title} />
  return <Embed url={source.url} title={title} />
}

function ArtistList ({ artists }: { artists: BuiltArtist[] }) {
  return <ul class={bem('artists')}>
    {artists.map(artist => <li class={bem('artist')} key={artist.id}>
      <Link href={artist.url} className={bem('artist-link')}>{artist.name}</Link>
    </li>)}
  </ul>
}

function MetaRow ({ label, children }: { label: string, children: ComponentChildren }) {
  return <>
    <dt class={bem('label')}>{label}</dt>
    <dd class={bem('value')}>{children}</dd>
  </>
}

export type PostProps = {
  post: BuiltPost
}

export function Post ({ post }: PostProps) {
  const { recording } = post
  const [played, ...alternates] = recording.sources.filter(isPlayable)
  const others = [...alternates, ...recording.sources.filter(source => source.nature === 'identity')]
  const performedAt = recording.performedAt === null ? null : formatPlace(recording.performedAt)

  return <article class={bem()}>
    <div class={bem('media')}>
      {played === undefined
        ? <a class={bem('missing')} href={post.url}>no playable source</a>
        : <Media source={played} title={post.title} />}
    </div>
    <div class={bem('meta')}>
      <h2 class={bem('title')}>
        <Link href={post.url} className={bem('permalink')}>{post.title}</Link>
      </h2>
      <dl class={bem('fields')}>
        <MetaRow label="artist"><ArtistList artists={post.credits} /></MetaRow>
        {post.featuring.length === 0
          ? null
          : <MetaRow label="featuring"><ArtistList artists={post.featuring} /></MetaRow>}
        {post.remixedBy.length === 0
          ? null
          : <MetaRow label="remixed by"><ArtistList artists={post.remixedBy} /></MetaRow>}
        <MetaRow label="song">{post.song.title}</MetaRow>
        {post.isCover
          ? <MetaRow label="originally by"><ArtistList artists={post.originalArtists} /></MetaRow>
          : null}
        {recording.kind === null ? null : <MetaRow label="kind">{recording.kind}</MetaRow>}
        {recording.performedOn === null
          ? null
          : <MetaRow label="performed on"><PartialDate date={recording.performedOn} /></MetaRow>}
        {performedAt === null ? null : <MetaRow label="performed at">{performedAt}</MetaRow>}
        <MetaRow label="published on">
          <time class={bem('published')} dateTime={post.publishedOn}>{post.publishedOn}</time>
        </MetaRow>
        {others.length === 0
          ? null
          : <MetaRow label="sources">
            <ul class={bem('sources')}>
              {others.map(source => {
                const link = sourceLink(source)
                return <li class={bem('source')} key={link.href}>
                  <a class={bem('source-link')} href={link.href}>{link.label}</a>
                </li>
              })}
            </ul>
          </MetaRow>}
      </dl>
    </div>
  </article>
}
