import isRecord from '@mxfb/tools/utils/agnostic/is-record'

export namespace Posts {
  type AnyPost = {
    song_title: string
    song_performer: string
    performance_type: 'studio' | 'live'
    performance_venue: string | null
    performance_date: string | null
    source_type: 'youtube'
    source_url: string
  }
  
  export type JsonPost = AnyPost & { publish_on: string }
  export type Post = AnyPost & { publish_on: number }

  export async function fetch () {
    const response = await window.fetch('/data/posts.json')
    const data = await response.text()
    const posts = JSON.parse(data)
    if (!Array.isArray(posts)) return []
    return posts.map(format)
  }

  export function makeDefault (): Post {
    return {
      publish_on: 0,
      song_title: '<unnamed song>',
      song_performer: '<unnamed performer>',
      performance_type: 'studio',
      performance_venue: null,
      performance_date: null,
      source_type: 'youtube',
      source_url: ''
    }
  }

  export function format (input: unknown) {
    const defaultPost = makeDefault()
    if (!isRecord(input)) return defaultPost
    const allowedKeys = Object.keys(defaultPost)
    const returned: Post = { ...defaultPost }
    allowedKeys.forEach(key => {
      if (!(key in input)) return;
      if (key === 'publish_on') {
        const raw = input[key] as string
        const date = new Date(raw)
        const millis = date.getTime()
        return Object.assign(returned, { [key]: millis })  
      }
      Object.assign(returned, { [key]: input[key] })
    })
    return returned
  }

  export function toJson (input: Post) {
    const publishOnMs = input.publish_on
    const publishOnDate = new Date(publishOnMs)
    const publishOnStr = publishOnDate.toISOString()
    const inputCopy = { ...input }
    delete (inputCopy as any).publish_on;
    const returned: JsonPost = {
      publish_on: publishOnStr,
      ...inputCopy as AnyPost
    }
    return returned
  }

  export function isPublished (post: Post) {
    const now = new Date()
    const postMillis = new Date(post.publish_on)
    return now >= postMillis
  }
}
