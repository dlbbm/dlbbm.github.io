/**
 * Copies every tumblr identity onto the post it identifies.
 *
 * The import stored the permalink of the archived entry on the recording, where it never
 * belonged: what it identifies is the post. The ones `post:edit` has been dropping since
 * are read back out of the file's own history — the newest revision that still holds one
 * for a given recording id wins — so this both copies and restores.
 *
 * Additive on purpose: the recordings keep theirs, and stripping them is a second pass.
 */

import { execFile } from 'node:child_process'
import process from 'node:process'
import { promisify } from 'node:util'
import { confirm } from '@inquirer/prompts'
import { styles } from '@design-edito/tools/agnostic/misc/logs/styles/index.js'
import type { IdentitySource, Post, Recording, RecordingId } from '../../shared/types/index.js'
import { readDb, write, type Db } from '../_db/index.js'

const RECORDINGS = 'data/recordings.ndjson'

const run = promisify(execFile)

function identitiesOf (recording: Recording): IdentitySource[] {
  return recording.sources.filter((source): source is IdentitySource => source.nature === 'identity')
}

/**
 * Every revision of the recordings file, newest first, as the ids and identities it held.
 *
 * A revision that predates the last re-import carries ids nothing points at any more,
 * which is why the caller keeps the first identity it sees for an id rather than the
 * oldest: an id that stopped existing never matches a recording to write onto.
 */
async function* history (): AsyncGenerator<Recording[]> {
  const { stdout } = await run('git', ['log', '--format=%H', '--', RECORDINGS])
  for (const sha of stdout.split('\n').filter(line => line !== '')) {
    const { stdout: file } = await run('git', ['show', `${sha}:${RECORDINGS}`], { maxBuffer: 64 * 1024 * 1024 })
    const records: Recording[] = []
    for (const line of file.split('\n')) {
      if (line.trim() === '') continue
      // A revision written before a shape change parses into something this type no longer
      // describes. Only the id and the sources are read, and both have been there all along.
      try { records.push(JSON.parse(line) as Recording) } catch { continue }
    }
    yield records
  }
}

const db: Db = await readDb()

console.log('')
console.log(styles.title('Moving the tumblr identities onto the posts...'))

const live = new Map<RecordingId, IdentitySource[]>()
for (const recording of db.recordings) {
  const identities = identitiesOf(recording)
  if (identities.length > 0) live.set(recording.id, identities)
}

const known = new Set(db.recordings.map(recording => recording.id))
const recovered = new Map<RecordingId, IdentitySource[]>()
for await (const records of history()) {
  for (const record of records) {
    if (!known.has(record.id) || live.has(record.id) || recovered.has(record.id)) continue
    const identities = identitiesOf(record)
    if (identities.length > 0) recovered.set(record.id, identities)
  }
}

console.log(styles.light(`> ${live.size} still on a recording, ${recovered.size} read back out of the history`))

const nextPosts: Post[] = db.posts.map(post => {
  const identities = [
    ...post.sources ?? [],
    ...live.get(post.recordingId) ?? [],
    ...recovered.get(post.recordingId) ?? []
  ]
  const seen = new Set<string>()
  return {
    ...post,
    sources: identities.filter(source => {
      if (seen.has(source.url)) return false
      seen.add(source.url)
      return true
    })
  }
})

const claimed = new Map<string, Post[]>()
for (const post of nextPosts) {
  for (const source of post.sources) {
    claimed.set(source.url, [...claimed.get(source.url) ?? [], post])
  }
}
const collisions = [...claimed].filter(([, posts]) => posts.length > 1)
if (collisions.length > 0) {
  console.log(styles.warning(`${collisions.length} permalinks land on more than one post, which two posts of one recording do.`))
  for (const [url, posts] of collisions) { console.log(styles.light(`> ${url} — ${posts.map(post => post.id).join(', ')}`)) }
}

const withIdentity = nextPosts.filter(post => post.sources.length > 0)
console.log(styles.info('\nTo be written'))
console.log(styles.light(`${withIdentity.length} of ${db.posts.length} posts carry an identity, ${db.posts.length - withIdentity.length} none`))
console.log('')
console.log(styles.danger('posts.ndjson is rewritten whole. The recordings are left untouched.'))

const confirmed = await confirm({ message: 'Write?', default: true })
if (!confirmed) {
  console.log(styles.warning('Nothing written.'))
  process.exit(0)
}

await write('posts', nextPosts)

console.log('')
console.log(styles.title('Identities attached.'))
console.log(styles.success(`${withIdentity.length} posts know which tumblr entry they came from`))
console.log('')
