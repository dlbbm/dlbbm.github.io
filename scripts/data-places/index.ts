/**
 * The place strings every recording carries, read side by side and renamed one by one.
 *
 * A place is not a record: `performedAt` holds a venue, a city and a country inline, with
 * no id and nothing pointing at it, so nothing validates them and two spellings of one
 * venue are two venues. Listing them together is the only way to see that `Austin` and
 * `Austin, TX` are the same city, or that an article crept into a venue out of the
 * sentence it was first read in.
 *
 * Each distinct string is offered with itself as the default: `Enter` keeps it, anything
 * else renames it in every recording that carries it, and `quit` ends the walk the way
 * `idea` does. Nothing is written until the whole walk has been answered and confirmed.
 *
 * The country is left out on purpose: eight values across 27 recordings, and a country is
 * not a string anyone mistypes twice.
 */

import process from 'node:process'
import { confirm, input } from '@inquirer/prompts'
import { styles } from '@design-edito/tools/agnostic/misc/logs/styles/index.js'
import type { Recording } from '../../shared/types/index.js'
import { readDb, write, type Db } from '../_db/index.js'

const db: Db = await readDb()

console.log('')
console.log(styles.title('Reading the places...'))

const fields = ['venue', 'city'] as const

type Field = typeof fields[number]

const QUIT = 'quit'

function distinct (field: Field): Array<{ value: string, times: number }> {
  const counted = new Map<string, number>()
  for (const recording of db.recordings) {
    const value = recording.performedAt?.[field] ?? null
    if (value === null) continue
    counted.set(value, (counted.get(value) ?? 0) + 1)
  }
  return [...counted.entries()]
    .map(([value, times]) => ({ value, times }))
    .sort((one, other) => one.value.localeCompare(other.value))
}

/** A rename, keyed by the field it belongs to: one string may be a venue and a city. */
function keyOf (field: Field, value: string): string {
  return `${field}\n${value}`
}

const renames = new Map<string, string>()
let stopped = false

for (const field of fields) {
  const values = distinct(field)
  const carried = values.reduce((total, value) => total + value.times, 0)

  console.log('')
  console.log(styles.info(field))
  console.log(styles.light(`> ${values.length} distinct, across ${carried} recording${carried === 1 ? '' : 's'}`))

  for (const { value, times } of values) {
    if (stopped) {
      console.log(styles.light(`  ${value}`))
      continue
    }
    console.log('')
    console.log(styles.light(`> ${times} recording${times === 1 ? '' : 's'}, ${QUIT} to stop here`))
    const answer = (await input({ message: field, default: value })).trim()
    if (answer === QUIT) { stopped = true; continue }
    if (answer === '' || answer === value) continue
    renames.set(keyOf(field, value), answer)
  }
}

if (renames.size === 0) {
  console.log('')
  console.log(styles.title('Places read.'))
  console.log(styles.warning('Nothing renamed.'))
  console.log('')
  process.exit(0)
}

const renamed = (field: Field, value: string | null): string | null => {
  if (value === null) return null
  return renames.get(keyOf(field, value)) ?? value
}

const recordings: Recording[] = db.recordings.map(recording => {
  const at = recording.performedAt
  if (at === null) return recording
  const venue = renamed('venue', at.venue)
  const city = renamed('city', at.city)
  if (venue === at.venue && city === at.city) return recording
  return { ...recording, performedAt: { ...at, venue, city } }
})

const touched = recordings.filter((recording, index) =>
  JSON.stringify(recording) !== JSON.stringify(db.recordings[index])).length

console.log('')
console.log(styles.info('Renamed'))
for (const [key, to] of renames) {
  const [field, from] = key.split('\n')
  console.log(`${styles.light(`${field}`)} ${styles.regular(from ?? '')} ${styles.important(`→ ${to}`)}`)
}
console.log(styles.light(`> ${touched} recording${touched === 1 ? '' : 's'} rewritten`))

console.log('')
console.log(styles.danger('recordings.ndjson is rewritten whole.'))

if (!await confirm({ message: 'Rename?', default: false })) {
  console.log(styles.warning('Nothing written.'))
  process.exit(0)
}

await write('recordings', recordings)

console.log('')
console.log(styles.title('Places renamed.'))
console.log(styles.success(`${renames.size} string${renames.size === 1 ? '' : 's'} renamed, ${touched} recording${touched === 1 ? '' : 's'} rewritten`))
console.log('')
