import { Fragment } from 'preact'
import { Link } from 'wouter-preact'
import { clss } from '@design-edito/tools/agnostic/css/clss/index.js'
import { DateComponent } from '@mxfb/tools/components/Date/index.js'
import { Embed } from '@mxfb/tools/components/Embed/index.js'
import type { BuiltArtist, BuiltPost } from '../../../shared/types/built.js'
import type { FileSource, MediaSource, Source } from '../../../shared/types/index.js'
import { formatPlace } from '../../utils/format/index.js'
import { FileMedia } from '../FileMedia/index.js'
import './styles.css'

const bem = clss('post')

type PlayableSource = MediaSource | FileSource

// An identity source is a claim that this is the same thing as that one. Nothing to hear,
// so it belongs with the metadata and never in the media block.
function isPlayable (source: Source): source is PlayableSource {
  return source.nature !== 'identity'
}

function Media ({ source, title }: { source: PlayableSource, title: string }) {
  // A stored path is relative to the repository root — `data/files/…` — and `build:data`
  // copies that tree into `dist` as it stands.
  if (source.nature === 'file') return <FileMedia src={`/${source.path}`} kind={source.kind} title={title} />
  return <Embed url={source.url} title={title} />
}

function Credit ({ artist }: { artist: BuiltArtist }) {
  return <Link href={artist.url} className={bem('artist')}>{artist.name}</Link>
}

// `Song — Artist, Artist, ft. Artist`, the line `build:data` writes into `title`, except
// that each name here is its own link. The two have to say the same thing.
function Credits ({ credits, featuring }: { credits: BuiltArtist[], featuring: BuiltArtist[] }) {
  return <>
    {credits.map((artist, index) => <Fragment key={artist.id}>
      {index === 0 ? null : ', '}
      <Credit artist={artist} />
    </Fragment>)}
    {featuring.map((artist, index) => <Fragment key={artist.id}>
      {index === 0 ? ', ft. ' : ', '}
      <Credit artist={artist} />
    </Fragment>)}
  </>
}

export type PostProps = {
  post: BuiltPost
}

export function Post ({ post }: PostProps) {
  const { recording } = post
  const played = recording.sources.find(isPlayable)
  const performedAt = recording.performedAt === null ? null : formatPlace(recording.performedAt)
  const occasion = [recording.kind, performedAt].filter(part => part !== null).join(' at ')
  // The date is shown as the data holds it until `formatDate` learns to write a partial
  // one out in full.
  const performedOn = recording.performedOn === null
    ? null
    : [recording.performedOn.year, recording.performedOn.month, recording.performedOn.day]
      .filter(part => part !== null)
      .join('-')
  const occasionAndDate = [occasion, performedOn].filter(part => part !== '' && part !== null).join(' — ')
  // The edition belongs to the source rather than to the take, so it is set apart rather
  // than listed alongside: what was played, then in brackets which audio of it this is.
  const edition = played?.name ?? null
  const details = [occasionAndDate, edition === null || edition === '' ? null : `(${edition})`]
    .filter(part => part !== '' && part !== null)
    .join(' ')

  return <article class={bem()}>
    <Link href={post.url} className={bem('permalink')}>
      <DateComponent
        date={new Date(post.publishedOn)}
        format="{{ddd}}, {{MMM}} {{D}}{{th}}, {{YYYY}}"
        className={bem('date')} />
    </Link>
    <div class={bem('media')}>
      {played === undefined
        ? <a class={bem('missing')} href={post.url}>no playable source</a>
        : <Media source={played} title={post.title} />}
    </div>
    <div class={bem('meta')}>
      <h2 class={bem('title')}>
        <span class={bem('song')}>{post.song.title}</span>
        {' — '}
        <Credits credits={post.credits} featuring={post.featuring} />
      </h2>
      {details === '' ? null : <p class={bem('details')}>{details}</p>}
      {post.body === null ? null : <p class={bem('body')}>{post.body}</p>}
    </div>
  </article>
}
