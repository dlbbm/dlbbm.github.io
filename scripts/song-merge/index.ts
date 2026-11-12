/**
 * Joins two works into one and repoints every recording of them onto the survivor.
 *
 * `npm run song:merge` offers the song pairs `data:check-duplicates` found; `-- <from>
 * <into>` goes straight to two ids. What the merge itself does lives in `scripts/_merge`,
 * which `data:merge-duplicates` drives over every pair of both collections in one pass.
 */

import process from 'node:process'
import { styles } from '@design-edito/tools/agnostic/misc/logs/styles/index.js'
import type { Song } from '../../shared/types/index.js'
import { readDb, type Db } from '../_db/index.js'
import { askingSongs, askPair, mergeSongs, type Pair } from '../_merge/index.js'

const db: Db = await readDb()

console.log('')
console.log(styles.title('Merging two songs...'))

const [, , fromId, intoId] = process.argv
let given: Pair<Song> | null = null
if (fromId !== undefined || intoId !== undefined) {
  const from = db.songs.find(candidate => candidate.id === fromId)
  const into = db.songs.find(candidate => candidate.id === intoId)
  if (from === undefined || into === undefined) {
    console.log(styles.error(`Takes two song ids: ${fromId ?? '—'} and ${intoId ?? '—'} are not both in the data.`))
    process.exit(1)
  }
  given = { from, into }
}

const picked = await askPair<Song>(askingSongs(db), given)

if (picked === null) {
  console.log(styles.warning('Nothing written.'))
  process.exit(0)
}

await mergeSongs(db, picked)
console.log('')
