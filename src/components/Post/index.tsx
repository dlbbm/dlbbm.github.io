import { Component } from 'react'
import { Posts } from '~/utils/posts'
import styles from './style.module.scss'

type YoutuvePlayerProps = {
  url: string
}

const YoutubePlayer = (props: YoutuvePlayerProps) => <></>

type Props = Posts.Post

export default class Post extends Component<Props> {
  render () {
    const {
      songTitle,
      songPerformer,
      performanceType,
      performanceVenue,
      performanceDate,
      sourceType,
      sourceUrl,
      publishOn
    } = this.props
    const isToBePublished = publishOn > Date.now()
    const wrapperClasses = [styles['wrapper']]
    if (isToBePublished) wrapperClasses.push(styles['wrapper_to-be-published'])
    return <div className={wrapperClasses.join(' ')}>
      <div className={styles['media']}>
        {sourceType === 'youtube' && <YoutubePlayer url={sourceUrl} />}
      </div>
      <div className={styles['meta']}>
        <span className={styles['song-title']}>{songTitle}</span><span className={styles['song-performer']}>{songPerformer}</span>
        {performanceType === 'live' && <div className='meta-live'>
          <span className={styles['performance-type']}>{performanceType}</span>
          <span className={styles['performance-venue']}>{performanceVenue}</span>
          <span className={styles['performance-date']}>({performanceDate})</span>
        </div>}
      </div>
    </div>
  }
}
