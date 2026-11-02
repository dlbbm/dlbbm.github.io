import { clss } from '@design-edito/tools/agnostic/css/clss/index.js'
import { Video } from '@design-edito/tools/components/Video/index.js'
import './styles.css'

const bem = clss('file-media')

const playGlyph = <svg class={bem('glyph')} viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
  <rect class="bg" width="16" height="16" />
  <path class="fill-1" d="M3 1L14 8L3 15Z" />
</svg>

const pauseGlyph = <svg class={bem('glyph')} viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
  <rect class="bg" width="16" height="16" />
  <path class="fill-1" d="M3 1H6.5V15H3ZM9.5 1H13V15H9.5Z" />
</svg>

export type FileMediaProps = {
  src: string
  kind: 'audio' | 'video'
  title: string
}

/**
 * A stored file, played by `Video` and dressed for this blog.
 *
 * Audio goes through the same `<video>` element as video — everything the player drives
 * is `HTMLMediaElement` — so a sound file is a picture-less video here, and what stands
 * in for its picture is a ground of its own until the data carries a cover image.
 */
export function FileMedia ({ src, kind, title }: FileMediaProps) {
  return <div class={bem(null, kind)}>
    <div class={bem('ground')} />
    <Video
      src={src}
      title={title}
      className={bem('player')}
      preload="metadata"
      timeFormat="{{mm}}:{{ss}}"
      togglePlayOnClick
      playBtnContent={playGlyph}
      pauseBtnContent={pauseGlyph} />
  </div>
}
