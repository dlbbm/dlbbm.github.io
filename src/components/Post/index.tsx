import { Component } from 'react'
import ReactYoutube from 'react-youtube'
import { Posts } from '~/utils/posts'
import styles from './style.module.scss'

type YoutubePlayerProps = {
  id: string
}

const YoutubePlayer = (props: YoutubePlayerProps) => <>
  <ReactYoutube videoId={props.id} opts={{ width: '100%' }} />
</>



type Props = Posts.Post

export default class Post extends Component<Props> {
  render () {
    const {
      publishOn,
      publishOnRaw,
      songTitle,
      youtubeId,
      youtubeTitle,
      postUrl,
      postId
    } = this.props
    const isToBePublished = publishOn > Date.now()
    const wrapperClasses = [styles['wrapper']]
    if (isToBePublished) wrapperClasses.push(styles['wrapper_to-be-published'])
    return <div className={wrapperClasses.join(' ')}>
      <div className={styles['media']}>
        {youtubeId !== null && <YoutubePlayer id={youtubeId} />}
      </div>
      <div className={styles['song-meta']}>
        <div className={styles['song-title']}>{songTitle}</div>
      </div>
      <div className={styles['post-meta']}>
        <div className={styles['post-date']}>{publishOnRaw}</div>
      </div>
    </div>
  }
}
