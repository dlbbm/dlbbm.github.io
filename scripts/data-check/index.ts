/**
 * Reads the database against itself and says what it finds.
 *
 * `npm run data:check` runs the three passes; `npm run data:check-references` and its two
 * siblings take one. It gates nothing and always exits 0 — a finding here is a question
 * for a human, not a build error, and `build:data` is what refuses to emit a broken site.
 *
 * The orphan pass is the only one that writes: it offers each record it found for
 * deletion, one at a time, and nothing is rewritten until the whole list has been
 * answered.
 */

import process from 'node:process'
import { confirm, select } from '@inquirer/prompts'
import { styles } from '@design-edito/tools/agnostic/misc/logs/styles/index.js'
import {
  findDanglingReferences,
  findDuplicates,
  findOrphans,
  findStrandedFiles,
  type DuplicatePair,
  type Orphan
} from '../_check/index.js'
import { readDb, write, type Db } from '../_db/index.js'
import {
  describeArtist,
  describeRecording,
  describeSlug,
  describeSong,
  type Described
} from '../_describe/index.js'

const passes = ['references', 'orphans', 'duplicates'] as const

type Pass = typeof passes[number]

const [, , asked] = process.argv
if (asked !== undefined && !passes.includes(asked as Pass)) {
  console.log('')
  console.log(styles.error(`No pass called ${asked}.`))
  console.log(styles.light(`> one of ${passes.join(', ')}, or none for all of them`))
  process.exit(1)
}

const running: Pass[] = asked === undefined ? [...passes] : [asked as Pass]
let db: Db = await readDb()
const outstanding: string[] = []

function describeOrphan (orphan: Orphan, pool: Db): Described {
  if (orphan.collection === 'recordings') return describeRecording(orphan.record, pool)
  if (orphan.collection === 'songs') return describeSong(orphan.record, pool)
  if (orphan.collection === 'artists') return describeArtist(orphan.record, pool)
  return describeSlug(orphan.record, pool)
}

function nameOf (orphan: Orphan): string {
  return orphan.collection === 'slugs'
    ? `${orphan.record.kind}/${orphan.record.slug}`
    : orphan.record.id
}

function describePair (pair: DuplicatePair, pool: Db): [Described, Described] {
  return pair.collection === 'artists'
    ? [describeArtist(pair.one, pool), describeArtist(pair.other, pool)]
    : [describeSong(pair.one, pool), describeSong(pair.other, pool)]
}

async function checkReferences (): Promise<void> {
  console.log('')
  console.log(styles.title('Checking references...'))
  const findings = findDanglingReferences(db)
  const stranded = await findStrandedFiles(db)
  for (const finding of findings) {
    console.log(`${styles.warning(finding.where)} ${finding.says}`)
  }
  for (const file of stranded) {
    console.log(`${styles.warning(`file ${file}`)} is pointed at by no recording`)
  }
  const total = findings.length + stranded.length
  if (total === 0) { console.log(styles.light('> every id resolves')) }
  else { outstanding.push(`${total} dangling reference${total === 1 ? '' : 's'}`) }
}

async function checkOrphans (): Promise<void> {
  console.log('')
  console.log(styles.title('Checking orphans...'))
  const orphans = findOrphans(db)
  if (orphans.length === 0) {
    console.log(styles.light('> everything is pointed at'))
    return
  }

  console.log(styles.light(`> ${orphans.length} record${orphans.length === 1 ? '' : 's'} nothing points at`))
  const doomed: Orphan[] = []
  let stopped = false
  for (const [index, orphan] of orphans.entries()) {
    const described = describeOrphan(orphan, db)
    console.log('')
    console.log(styles.info(`${index + 1} of ${orphans.length} — ${orphan.collection}`))
    console.log(styles.important(described.name))
    console.log(styles.light(described.description))
    if (stopped) continue
    const action = await select<'keep' | 'delete' | 'stop'>({
      message: nameOf(orphan),
      choices: [
        { name: 'keep', value: 'keep' },
        { name: 'delete', value: 'delete' },
        { name: 'stop', value: 'stop' }
      ]
    })
    if (action === 'stop') { stopped = true; continue }
    if (action === 'delete') doomed.push(orphan)
  }

  if (doomed.length === 0) {
    outstanding.push(`${orphans.length} orphan${orphans.length === 1 ? '' : 's'}`)
    console.log('')
    console.log(styles.warning('Nothing deleted.'))
    return
  }

  // An artist's URL cannot outlive the artist, so its slug lines go along rather than
  // becoming orphans of their own on the next run.
  const artists = db.artists.filter(artist =>
    !doomed.some(orphan => orphan.collection === 'artists' && orphan.record === artist))
  const slugs = db.slugs.filter(slug =>
    !doomed.some(orphan => orphan.collection === 'slugs' && orphan.record === slug)
    && artists.some(artist => artist.id === slug.targetId))
  const songs = db.songs.filter(song =>
    !doomed.some(orphan => orphan.collection === 'songs' && orphan.record === song))
  const recordings = db.recordings.filter(recording =>
    !doomed.some(orphan => orphan.collection === 'recordings' && orphan.record === recording))

  const touched: Array<[keyof Db, number]> = [
    ['artists', db.artists.length - artists.length],
    ['slugs', db.slugs.length - slugs.length],
    ['songs', db.songs.length - songs.length],
    ['recordings', db.recordings.length - recordings.length]
  ]
  console.log('')
  console.log(styles.info('To be deleted'))
  for (const [collection, dropped] of touched) {
    if (dropped === 0) continue
    console.log(styles.light(`> ${dropped} line${dropped === 1 ? '' : 's'} out of ${collection}.ndjson`))
  }
  console.log('')
  console.log(styles.danger(`${touched
    .filter(([, dropped]) => dropped > 0)
    .map(([collection]) => `${collection}.ndjson`)
    .join(', ')} rewritten whole.`))

  if (!await confirm({ message: 'Delete?', default: false })) {
    outstanding.push(`${orphans.length} orphan${orphans.length === 1 ? '' : 's'}`)
    console.log(styles.warning('Nothing written.'))
    return
  }

  if (artists.length !== db.artists.length) await write('artists', artists)
  if (slugs.length !== db.slugs.length) await write('slugs', slugs)
  if (songs.length !== db.songs.length) await write('songs', songs)
  if (recordings.length !== db.recordings.length) await write('recordings', recordings)
  // Read back rather than patch in memory: the duplicate pass describes from this.
  db = await readDb()
  console.log(styles.success(`${doomed.length} record${doomed.length === 1 ? '' : 's'} deleted.`))
  const left = orphans.length - doomed.length
  if (left > 0) outstanding.push(`${left} orphan${left === 1 ? '' : 's'}`)
}

function checkDuplicates (): void {
  console.log('')
  console.log(styles.title('Checking duplicates...'))
  const { pairs, slugLines } = findDuplicates(db)

  for (const pair of pairs) {
    const [one, other] = describePair(pair, db)
    console.log('')
    console.log(`${styles.important(one.name)} ${styles.light(pair.one.id)}`)
    console.log(styles.light(`  ${one.description}`))
    console.log(`${styles.important(other.name)} ${styles.light(pair.other.id)}`)
    console.log(styles.light(`  ${other.description}`))
    console.log(styles.warning(`> ${pair.reason}`))
    console.log(styles.light(`> npm run ${pair.collection === 'artists' ? 'artist' : 'song'}:merge -- ${pair.one.id} ${pair.other.id}`))
  }

  if (slugLines.length > 0) {
    const lines = slugLines.reduce((total, line) => total + line.times - 1, 0)
    console.log('')
    console.log(styles.warning(`${slugLines.length} slug${slugLines.length === 1 ? '' : 's'} written more than once, ${lines} line${lines === 1 ? '' : 's'} over`))
    console.log(styles.light('> every one of them was created by data:import, which pushed each slug twice'))
    outstanding.push(`${lines} repeated slug line${lines === 1 ? '' : 's'}`)
  }

  if (pairs.length === 0) { console.log(styles.light('> no two records look like one')) }
  else {
    console.log('')
    console.log(styles.light('> npm run data:merge-duplicates walks all of them, one question each'))
    outstanding.push(`${pairs.length} pair${pairs.length === 1 ? '' : 's'} to decide on`)
  }
}

for (const pass of running) {
  if (pass === 'references') await checkReferences()
  if (pass === 'orphans') await checkOrphans()
  if (pass === 'duplicates') checkDuplicates()
}

console.log('')
console.log(styles.title('Check complete.'))
console.log(outstanding.length === 0
  ? styles.success('Nothing outstanding.')
  : styles.warning(outstanding.join(', ')))
console.log('')
