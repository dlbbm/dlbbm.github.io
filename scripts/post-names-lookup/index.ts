/**
 * The posts whose names have never been read against MusicBrainz, walked one at a time.
 *
 * It opens on the oldest post carrying no `namesCheckedOn` and shows it; `next` asks
 * MusicBrainz about it, `skip` moves on and leaves it unread, `quit` stops there. What
 * gets looked up is every artist the post credits — played by, featuring, remixed by, and
 * the work's original artists — and then the work's title, narrowed by who plays it. Two
 * or three requests a post, a second apart.
 *
 * A post is marked read as soon as it has been through, whether or not anything changed —
 * which is what makes the walk resumable without a cursor file: the data says where it got
 * to. The questions themselves are `_names`, which `post:create` and `post:edit` offer on
 * the post they have just written.
 *
 * `npm run post:names-lookup -- <postId>` reads that one post instead, read already or
 * not, and marks it the same way.
 *
 * `data:names` is the same question over every artist at once, from the lookups stored in
 * `.musicbrainz.ndjson`; this one asks live, about the handful of names one post carries.
 */

import process from 'node:process'
import { select } from '@inquirer/prompts'
import { styles } from '@design-edito/tools/agnostic/misc/logs/styles/index.js'
import type { Post } from '../../shared/types/index.js'
import { readDb, type Db } from '../_db/index.js'
import { describePost } from '../_describe/index.js'
import { lookUpNames, namesOf } from '../_names/index.js'

const db: Db = await readDb()

console.log('')
console.log(styles.title('Reading the posts against MusicBrainz...'))

if (db.posts.length === 0) {
  console.log(styles.warning('No post to read.'))
  process.exit(0)
}

const [, , askedId] = process.argv

const unread = db.posts
  .filter(post => post.namesCheckedOn === null)
  .sort((one, other) => one.publishedOn.localeCompare(other.publishedOn))

let walking: Post[]
if (askedId !== undefined) {
  const asked = db.posts.find(candidate => candidate.id === askedId)
  if (asked === undefined) {
    console.log(styles.error(`No post with id ${askedId}.`))
    process.exit(1)
  }
  walking = [asked]
} else {
  walking = unread
  console.log(styles.light(`> ${walking.length} of ${db.posts.length} posts never read`))
  if (walking.length === 0) {
    console.log('')
    console.log(styles.success('Every post has been through.'))
    console.log('')
    process.exit(0)
  }
}

let read = 0
let corrected = 0

for (const [index, post] of walking.entries()) {
  const names = namesOf(post.id, db)
  if (names === null) continue

  const described = describePost(post, db)
  console.log('')
  console.log(styles.title(`${index + 1} of ${walking.length}`))
  console.log(styles.info(described.name))
  console.log(styles.light(`> ${described.description}`))
  console.log(styles.light(`> ${names.credited.length} name${names.credited.length === 1 ? '' : 's'} and one title to ask about`))
  console.log('')

  const action = await select<'next' | 'skip' | 'quit'>({
    message: post.id,
    choices: [
      { name: 'next', value: 'next' },
      { name: 'skip', value: 'skip' },
      { name: 'quit', value: 'quit' }
    ]
  })
  if (action === 'quit') break
  if (action === 'skip') continue

  // Read again inside, since the names answered on an earlier post have moved the lines
  // this one may be about to show.
  const answered = await lookUpNames(post.id)
  if (answered === null) continue
  corrected += answered
  read += 1
}

const left = walking.length - read

console.log('')
console.log(styles.title('Posts read.'))
console.log(styles.light(`> ${read} post${read === 1 ? '' : 's'} through, ${corrected} name${corrected === 1 ? '' : 's'} corrected`))
if (left > 0) console.log(styles.light(`> ${left} left of what this run walked`))
else console.log(styles.success('Every post this run walked has been through.'))
console.log('')
