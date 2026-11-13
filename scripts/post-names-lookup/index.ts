/**
 * The posts whose names have never been read against MusicBrainz, walked one at a time.
 *
 * It opens on the oldest post carrying no `namesCheckedOn` and shows it, with four
 * answers: `look up` asks MusicBrainz about that one post and comes back for the next,
 * `auto look up` stops asking and runs, `skip` moves on and leaves the post unread, `quit`
 * stops there. What gets looked up is every artist the post credits — played by,
 * featuring, remixed by, and the work's original artists — and then the work's title,
 * narrowed by who plays it. Two or three requests a post, a second apart.
 *
 * **`auto look up` is the sweep.** It reads post after post without a question: a name the
 * register spells the way this data does needs no decision, and a name that differs is put
 * aside in `.names-pending.ndjson` rather than asked. So the hundreds of posts that want
 * nothing are gone in one run, and what is left is a list of decisions with nothing to
 * fetch behind them — which the run then goes through, and which is what it is waiting on
 * when you come back.
 *
 * Those put-aside questions are answered first on the next run too, before any request is
 * made: a decision already fetched is cheaper than the one being fetched.
 *
 * A post is marked read once it has been through, whether or not anything changed, so the
 * walk resumes without a cursor file: the data says where it got to. A post whose
 * questions are pending stays unread, since reading it is the decision.
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
import { answerQuestions, deferNames, lookUpNames, namesOf, readQuestions } from '../_names/index.js'

const db: Db = await readDb()

console.log('')
console.log(styles.title('Reading the posts against MusicBrainz...'))

if (db.posts.length === 0) {
  console.log(styles.warning('No post to read.'))
  process.exit(0)
}

const [, , askedId] = process.argv

let corrected = 0
let read = 0
let stopped = false

/** The store, emptied one post at a time. Nothing here asks MusicBrainz anything. */
async function answerPending (): Promise<void> {
  const pending = await readQuestions()
  if (pending.length === 0) return
  const posts = new Set(pending.map(question => question.postId)).size
  console.log('')
  console.log(styles.info('Put aside'))
  console.log(styles.light(`> ${pending.length} name${pending.length === 1 ? '' : 's'} across ${posts} post${posts === 1 ? '' : 's'}, nothing to fetch`))
  const answered = await answerQuestions()
  corrected += answered.corrected
  read += answered.posts
  if (answered.stopped) stopped = true
}

function report (): void {
  console.log('')
  console.log(styles.title('Posts read.'))
  if (stopped) console.log(styles.warning('Stopped on a name, and that post is left unread.'))
  console.log(styles.light(`> ${read} post${read === 1 ? '' : 's'} through, ${corrected} name${corrected === 1 ? '' : 's'} corrected`))
  console.log('')
}

// Answered before anything is fetched: a decision already paid for comes first.
if (askedId === undefined) await answerPending()

if (stopped) {
  const left = (await readQuestions()).length
  report()
  console.log(styles.warning(`${left} name${left === 1 ? '' : 's'} still put aside, answered first on the next run.`))
  console.log('')
  process.exit(0)
}

let walking: Post[]
if (askedId !== undefined) {
  const asked = db.posts.find(candidate => candidate.id === askedId)
  if (asked === undefined) {
    console.log(styles.error(`No post with id ${askedId}.`))
    process.exit(1)
  }
  walking = [asked]
} else {
  const fresh: Db = await readDb()
  walking = fresh.posts
    .filter(post => post.namesCheckedOn === null)
    .sort((one, other) => one.publishedOn.localeCompare(other.publishedOn))
  console.log('')
  console.log(styles.light(`> ${walking.length} of ${fresh.posts.length} posts never read`))
  if (walking.length === 0) {
    console.log('')
    console.log(styles.success('Every post has been through.'))
    console.log('')
    process.exit(0)
  }
}

const LOOK = 'look up'
const AUTO = 'auto look up'

let sweeping = false
let deferred = 0

for (const [index, post] of walking.entries()) {
  const names = namesOf(post.id, db)
  if (names === null) continue

  const described = describePost(post, db)
  console.log('')
  console.log(styles.title(`${index + 1} of ${walking.length}`))
  console.log(styles.info(described.name))
  console.log(styles.light(`> ${described.description}`))
  console.log(styles.light(`> ${names.credited.length} name${names.credited.length === 1 ? '' : 's'} and one title to ask about`))

  if (!sweeping) {
    console.log('')
    const action = await select<typeof LOOK | typeof AUTO | 'skip' | 'quit'>({
      message: post.id,
      choices: [
        { name: LOOK, value: LOOK },
        { name: AUTO, value: AUTO },
        { name: 'skip', value: 'skip' },
        { name: 'quit', value: 'quit' }
      ]
    })
    if (action === 'quit') break
    if (action === 'skip') continue
    if (action === AUTO) sweeping = true
  }

  // Read again inside, since a name answered on an earlier post has moved the lines this
  // one may be about to show.
  const looked = sweeping ? await deferNames(post.id) : await lookUpNames(post.id)
  if (looked.nature === 'missing') continue
  if (looked.nature === 'stopped') { stopped = true; break }
  if (looked.nature === 'deferred') { deferred += looked.questions; continue }
  corrected += looked.corrected
  read += 1
}

// What the sweep put aside, now that there is nothing left to fetch: the decisions arrive
// together, which is the whole point of having walked past them.
if (!stopped && deferred > 0) await answerPending()

report()

const left = (await readQuestions()).length
if (left > 0) {
  console.log(styles.warning(`${left} name${left === 1 ? '' : 's'} still put aside, answered first on the next run.`))
  console.log('')
}
