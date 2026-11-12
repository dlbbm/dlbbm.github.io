/**
 * Choosing the two records a merge joins, and which of them survives.
 *
 * Shared by `artist:merge` and `song:merge`, which differ in what they then repoint, not
 * in how the pair is picked: the duplicate report is the list, since a pair worth merging
 * is almost always a pair it already found.
 */

import { input, select } from '@inquirer/prompts'
import { styles } from '@design-edito/tools/agnostic/misc/logs/styles/index.js'
import { comparisonKey } from '../_check/index.js'
import type { Described } from '../_describe/index.js'

/** The two records a merge was asked for: `from` is dropped, `into` is kept. */
export type Pair<T> = {
  from: T
  into: T
}

export type Asking<T> = {
  /** What the records are, for the one line that says nothing was found. */
  kind: string
  records: T[]
  pairs: Array<{ one: T, other: T, reason: string }>
  describe: (record: T) => Described
  /** The name to match an answer against, and to print in a choice. */
  nameOf: (record: T) => string
  /** The other names it goes by, so an alias answers too. */
  aliasesOf: (record: T) => string[]
}

async function askByName<T> (asking: Asking<T>, message: string): Promise<T> {
  const answer = await input({
    message,
    validate: value => {
      const key = comparisonKey(value)
      return asking.records.some(record => comparisonKey(asking.nameOf(record)) === key
        || asking.aliasesOf(record).some(alias => comparisonKey(alias) === key))
        || `No ${asking.kind} called that.`
    }
  })
  const key = comparisonKey(answer)
  const found = asking.records.find(record => comparisonKey(asking.nameOf(record)) === key
    || asking.aliasesOf(record).some(alias => comparisonKey(alias) === key))
  if (found === undefined) return askByName(asking, message)
  return found
}

/**
 * Which two records, and which way round.
 *
 * The survivor is always asked, arguments or not: it is the one decision a merge cannot
 * take back, and a pair copied out of the report carries no opinion about it. The second
 * record is the default, so the line the report prints answers itself.
 */
export async function askPair<T> (asking: Asking<T>, given: Pair<T> | null): Promise<Pair<T> | null> {
  if (asking.records.length < 2) {
    console.log(styles.warning(`Fewer than two ${asking.kind}s in the data.`))
    return null
  }

  let one: T
  let other: T
  if (given !== null) {
    one = given.from
    other = given.into
  } else {
    const picked = asking.pairs.length === 0
      ? null
      : await select<{ one: T, other: T } | null>({
        message: 'Pair',
        choices: [
          ...asking.pairs.map(pair => ({
            name: `${asking.nameOf(pair.one)} / ${asking.nameOf(pair.other)}`,
            description: pair.reason,
            value: { one: pair.one, other: pair.other }
          })),
          { name: 'another pair', value: null }
        ]
      })
    if (picked === null) {
      one = await askByName(asking, 'From')
      other = await askByName(asking, 'Into')
    } else {
      one = picked.one
      other = picked.other
    }
  }

  if (one === other) {
    console.log(styles.warning('That is one record, twice.'))
    return null
  }

  for (const record of [one, other]) {
    const described = asking.describe(record)
    console.log('')
    console.log(styles.important(described.name))
    console.log(styles.light(described.description))
  }

  console.log('')
  const into = await select<T>({
    message: 'Survives',
    default: other,
    choices: [one, other].map(record => ({ name: asking.nameOf(record), value: record }))
  })
  return { from: into === one ? other : one, into }
}

/** Two lists joined, in order, with nothing said twice. */
export function union<T> (kept: T[], added: T[], sameAs: (one: T, other: T) => boolean): T[] {
  const joined = [...kept]
  for (const candidate of added) {
    if (joined.some(found => sameAs(found, candidate))) continue
    joined.push(candidate)
  }
  return joined
}
