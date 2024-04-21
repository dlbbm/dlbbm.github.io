import isRecord from '@design-edito/tools/utils/agnostic/is-record'

export namespace Posts {
  type AnyPost = {
    publishOnRaw: string | null
    songTitle: string | null
    youtubeId: string | null,
    youtubeTitle: string | null
    postUrl: string | null
    postId: string | null
  }
  
  export type JsonPost = AnyPost & { publishOn: string | null }
  export type Post = AnyPost & { publishOn: number }

  export async function fetch () {
    const response = await window.fetch('/data/posts.json')
    const data = await response.text()
    const posts = JSON.parse(data)
    if (!Array.isArray(posts)) return []
    return posts.map(format)
  }

  export function makeDefault (): Post {
    return {
      publishOn: 0,
      publishOnRaw: null,
      songTitle: '<unnamed song>',
      youtubeId: null,
      youtubeTitle: null,
      postUrl: null,
      postId: null
    }
  }

  export function format (input: unknown) {
    const defaultPost = makeDefault()
    if (!isRecord(input)) return defaultPost
    const allowedKeys = Object.keys(defaultPost)
    const returned: Post = { ...defaultPost }
    allowedKeys.forEach(key => {
      if (!(key in input)) return;
      if (key === 'publishOn') {
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
    const publishOnMs = input.publishOn
    const publishOnDate = new Date(publishOnMs)
    const publishOnStr = publishOnDate.toISOString()
    const inputCopy = { ...input }
    delete (inputCopy as any).publishOn;
    const returned: JsonPost = {
      publishOn: publishOnStr,
      ...inputCopy as AnyPost
    }
    return returned
  }

  export function isPublished (post: Post) {
    const now = new Date()
    const postMillis = new Date(post.publishOn)
    return now >= postMillis
  }
}
