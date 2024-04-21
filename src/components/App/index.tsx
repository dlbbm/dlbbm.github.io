import { Component } from 'react'
import Post from '~/components/Post'
import Logo from '~/components/Logo'
import { Posts } from '~/utils/posts'
import styles from './styles.module.scss'
import './styles.scss'

type Props = {}
type State = {
  posts: Posts.Post[] | null
  posts_loading: boolean
  posts_error: Error | null
  posts_display_limit: number
  posts_display_start: number
  posts_per_page: number
}

export default class App extends Component<Props, State> {
  state: State = {
    posts: null,
    posts_loading: true,
    posts_error: null,
    posts_display_start: 0,
    posts_display_limit: 10,
    posts_per_page: 10
  }

  constructor (props: Props) {
    super(props)
    this.handleNextClick = this.handleNextClick.bind(this)
    this.handlePrevClick = this.handlePrevClick.bind(this)
    this.getPageNumber = this.getPageNumber.bind(this)
  }

  async componentDidMount() {
    const posts = await Posts.fetch()
    const sorted = posts.sort((a, b) => b.publishOn - a.publishOn)
    const published = sorted.filter(Posts.isPublished)
    this.setState({
      posts: published,
      posts_loading: false,
      posts_error: null
    })
  }

  handlePrevClick () {
    this.setState(curr => ({
      ...curr,
      posts_display_start: curr.posts_display_start - curr.posts_per_page,
      posts_display_limit: curr.posts_display_limit - curr.posts_per_page
    }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  handleNextClick () {
    this.setState(curr => ({
      ...curr,
      posts_display_start: curr.posts_display_start + curr.posts_per_page,
      posts_display_limit: curr.posts_display_limit + curr.posts_per_page
    }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
    
  }

  getPageNumber () {
    return Math.floor(this.state.posts_display_start / this.state.posts_per_page) + 1
  }

  render () {
    const { state, handlePrevClick, handleNextClick } = this
    const visiblePosts = state.posts?.slice(state.posts_display_start, state.posts_display_limit)
    const limitIsLowerThanPostsLength = state.posts_display_limit < (state.posts?.length ?? 0)
    return <div className={styles['wrapper']}>
      <div className={styles['inner']}>
        <div className={styles['head']}><Logo /></div>
        {state.posts_display_start > 0 && <div className={styles['actions']}>
        <div className={styles['pages-cnt']}>Page {this.getPageNumber()}</div>
            {state.posts_display_start > 0 && <><button className={styles['prev-page']} onClick={handlePrevClick}>← Newer posts</button>&nbsp;&nbsp;•&nbsp;&nbsp;</>}
            {limitIsLowerThanPostsLength && <button className={styles['next-page']} onClick={handleNextClick}>Older posts →</button>}
          </div>}
        <div className={styles['posts']}>{visiblePosts?.map(postData => <Post {...postData} />)}</div>
        <div className={styles['actions']}>
          {state.posts_display_start > 0 && <><button className={styles['prev-page']} onClick={handlePrevClick}>← Newer posts</button>&nbsp;&nbsp;•&nbsp;&nbsp;</>}
          {limitIsLowerThanPostsLength && <button className={styles['next-page']} onClick={handleNextClick}>Older posts →</button>}
        </div>
      </div>
    </div>
  }
}
