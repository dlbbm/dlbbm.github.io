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
}

export default class App extends Component<Props, State> {
  state: State = {
    posts: null,
    posts_loading: true,
    posts_error: null,
    posts_display_limit: 10
  }

  constructor (props: Props) {
    super(props)
    this.handleLoadMore = this.handleLoadMore.bind(this)
  }

  async componentDidMount() {
    const posts = await Posts.fetch()
    const sorted = posts.sort((a, b) => b.publishOn - a.publishOn)
    const published = sorted.filter(() => true/*Posts.isPublished*/)
    this.setState({
      posts: published,
      posts_loading: false,
      posts_error: null
    })
  }

  handleLoadMore () {
    this.setState(curr => ({
      ...curr,
      posts_display_limit: curr.posts_display_limit + 10
    }))
  }

  render () {
    const { state, handleLoadMore } = this
    const visiblePosts = state.posts?.slice(0, state.posts_display_limit)
    const limitIsLowerThanPostsLength = state.posts_display_limit < (state.posts?.length ?? 0)
    return <div className={styles['wrapper']}>
      <div className={styles['inner']}>
        <div className={styles['head']}><Logo /></div>
        <div className={styles['posts']}>{visiblePosts?.map(postData => <Post {...postData} />)}</div>
        {limitIsLowerThanPostsLength && <button className={styles['load-more']} onClick={handleLoadMore}>Load more</button>}
      </div>
    </div>
  }
}
