import { Component } from 'react'
import { Posts } from '~/utils/posts'

type Props = Posts.Post

export default class Post extends Component<Props> {
  render () {
    return <>I am post</>
  }
}
