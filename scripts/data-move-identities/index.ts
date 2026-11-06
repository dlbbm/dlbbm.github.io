/**
 * Strips the tumblr identities off the recordings, now that the posts carry them.
 *
 * The second half of the move: the pass before this one copied every permalink onto the
 * post that names the recording, so what is still on a recording is a duplicate. Nothing
 * is dropped unless the post already holds the same URL, which is what makes this
 * recoverable from the data rather than from git.
 *
 * Spent once it has run, like the copy before it.
 */

import process from 'node:process'
import { confirm } from '@inquirer/prompts'
import { styles } from '@design-edito/tools/agnostic/misc/logs/styles/index.js'
import type { IdentitySource, Recording, RecordingId } from '../../shared/types/index.js'
import { readDb, write, type Db } from '../_db/index.js'

function identitiesOf (recording: Recording): IdentitySource[] {
  return recording.sources.filter((source): source is IdentitySource => source.nature === 'identity')
}

const db: Db = await readDb()

console.log('')
console.log(styles.title('Stripping the tumblr identities off the recordings...'))

const keptByRecording = new Map<RecordingId, Set<string>>()
for (const post of db.posts) {
  const kept = keptByRecording.get(post.recordingId) ?? new Set<string>()
  for (const source of post.sources) { kept.add(source.url) }
  keptByRecording.set(post.recordingId, kept)
}

const holding = db.recordings.filter(recording => identitiesOf(recording).length > 0)

const unsaved: string[] = []
for (const recording of holding) {
  const kept = keptByRecording.get(recording.id) ?? new Set<string>()
  for (const identity of identitiesOf(recording)) {
    if (!kept.has(identity.url)) unsaved.push(`${recording.id} — ${identity.url}`)
  }
}

if (unsaved.length > 0) {
  console.log(styles.error(`${unsaved.length} identities sit on a recording and on no post, so dropping them would lose them.`))
  for (const line of unsaved) { console.log(styles.light(`> ${line}`)) }
  process.exit(1)
}

console.log(styles.light(`> ${holding.length} recordings hold an identity, every one of them already on its post`))

const stripped: Recording[] = db.recordings.map(recording => ({
  ...recording,
  sources: recording.sources.filter(source => source.nature !== 'identity')
}))

console.log(styles.info('\nTo be written'))
console.log(styles.light(`${holding.length} of ${db.recordings.length} recordings lose a source`))
console.log('')
console.log(styles.danger('recordings.ndjson is rewritten whole. The posts are left untouched.'))

const confirmed = await confirm({ message: 'Strip?', default: true })
if (!confirmed) {
  console.log(styles.warning('Nothing written.'))
  process.exit(0)
}

await write('recordings', stripped)

console.log('')
console.log(styles.title('Identities stripped.'))
console.log(styles.success(`${holding.length} recordings no longer claim a tumblr entry`))
console.log('')
