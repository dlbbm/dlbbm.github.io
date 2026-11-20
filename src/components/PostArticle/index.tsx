import { Fragment, type VNode } from 'preact'
import { clss } from '@design-edito/tools/agnostic/css/clss/index.js'
import { DateComponent } from '@mxfb/tools/components/Date/index.js'
import { Embed } from '@mxfb/tools/components/Embed/index.js'
import type * as built from '../../../shared/types/built.js'
import type { MediaSource, Source } from '../../../shared/types/index.js'
import * as format from '../../format/index.js'
import { Link } from '../Link/index.js'
import { PartialDate } from '../PartialDate/index.js'
import './styles.css'

const c = clss('post-article')

// This blog only ever embeds: nothing in the archive is a stored file.
function isPlayable (source: Source): source is MediaSource {
  return source.nature === 'media'
}

function Media ({ source, title }: { source: MediaSource, title: string }) {
  return <Embed url={source.url} title={title} />
}

function Credit ({ artist }: { artist: built.Artist }) {
  return <Link href={artist.url} className={c('artist')}>{artist.name}</Link>
}

// `Song — Artist, Artist, ft. Artist`, the line `build:data` writes into `title`, except
// that each name here is its own link. The two have to say the same thing.
function Credits ({ credits, featuring = [] }: { credits: built.Artist[], featuring?: built.Artist[] }) {
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

export type PostArticleProps = {
  post: built.Post
}

export function PostArticle ({ post }: PostArticleProps) {
  const { recording } = post
  const playableSource = recording.sources.find(isPlayable)
  const performedAt = recording.performedAt === null ? null : format.place(recording.performedAt)
  // `remix` drops out when the remixers are named above: the word is already there.
  const kind = post.remixedBy.length > 0 && recording.kind === 'remix' ? null : recording.kind
  const kindAndPlace = [kind, performedAt].filter(part => part !== null).join(' at ')
  // The type allows a date that knows nothing, and `PartialDate` renders nothing for one:
  // dropped here so it does not take its separator along.
  const { performedOn } = recording
  const date = performedOn === null
    || (performedOn.year === null && performedOn.month === null && performedOn.day === null)
    ? null
    : <PartialDate date={performedOn} />
  // The edition belongs to the source rather than to the take, so it is set apart rather
  // than listed alongside: what was played, then in brackets which audio of it this is.
  const edition = playableSource?.name ?? null
  const parenthesisedEdition = edition === null || edition === '' ? null : `(${edition})`
  const rawDetails: Array<{ node: string | VNode, separator: string } | null> = [
    kindAndPlace === '' ? null : { node: kindAndPlace, separator: '' },
    date === null ? null : { node: date, separator: ' — ' },
    parenthesisedEdition === null ? null : { node: parenthesisedEdition, separator: ' ' }
  ]
  const details = rawDetails.filter((part): part is { node: string | VNode, separator: string } => part !== null)

  return <article class={c()}>
    <Link href={post.url} className={c('permalink')}>
      <DateComponent
        date={new Date(post.publishedOn)}
        format="{{ddd}}, {{MMM}} {{D}}{{th}}, {{YYYY}}"
        className={c('date')} />
    </Link>
    <div class={c('media')}>
      {playableSource === undefined
        ? <Link href={post.url} className={c('missing')}>no playable source</Link>
        : <Media source={playableSource} title={post.title} />}
    </div>
    <div class={c('meta')}>
      <div class={c('heading')}>
        <h2 class={c('title')}>
          <span class={c('song')}>{post.recording.title ?? post.song.title}</span>
          {' — '}
          <Credits credits={post.credits} featuring={post.featuring} />
        </h2>
        {!post.isCover ? null : <p class={c('cover')}>
          <Credits credits={post.originalArtists} />
          {' cover'}
        </p>}
        {!post.isMedley ? null : <p class={c('medley')}>(Medley)</p>}
        {post.remixedBy.length === 0 ? null : <p class={c('remix')}>
          <Credits credits={post.remixedBy} />
          {' remix'}
        </p>}
        {details.length === 0 ? null : <p class={c('details')}>
          {details.map((part, index) => <Fragment key={index}>
            {index === 0 ? null : part.separator}
            {part.node}
          </Fragment>)}
        </p>}
      </div>
      {post.body === null ? null : <p class={c('body')}>{post.body}</p>}
    </div>
  </article>
}
