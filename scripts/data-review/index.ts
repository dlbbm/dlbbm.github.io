/**
 * Walks the imported posts one at a time, and hands the ones that need it to the editor.
 *
 * `IMPORT-REVIEW.md` says which posts there are, in which order, and what the import could
 * not read; everything shown comes from the database itself, so nothing here depends on
 * the table's columns — only on the id at the end of a row and the flags at the start.
 *
 * `npm run data:review` walks all of them, `npm run data:review -- no-source` only the
 * posts carrying that flag. Quitting writes where you stopped into `.data-review`, and
 * the next run offers to start from there.
 */

import path from 'node:path'
import process from 'node:process'
import { existsSync } from 'node:fs'
import { readFile, writeFile } from 'node:fs/promises'
import { confirm, select } from '@inquirer/prompts'
import { styles } from '@design-edito/tools/agnostic/misc/logs/styles/index.js'
import type { Post, Recording } from '../../shared/types/index.js'
import { askDraft, printDraft, storeDraftFile } from '../_ask/index.js'
import { CWD } from '../_config/index.js'
import { append, readDb, saveSong, write, type Db } from '../_db/index.js'
import { findArtistById } from '../_describe/index.js'

const REVIEW = path.join(CWD, 'IMPORT-REVIEW.md')
const CURSOR = path.join(CWD, '.data-review')

type Row = { postId: string, flags: string[] }

/** The id closing a table row, and the flags opening it. Nothing in between is read. */
function readRows (markdown: string): Row[] {
  const rows: Row[] = []
  for (const line of markdown.split('\n')) {
    const closing = /\|\s*`([0-9a-f]{16})`\s*\|$/v.exec(line)
    if (closing === null) continue
    const opening = /^\|\s*([^\|]*)\|/v.exec(line)
    const flags = [...(opening?.[1] ?? '').matchAll(/`([a-z\-]+)`/gv)].map(found => found[1] ?? '')
    rows.push({ postId: closing[1] ?? '', flags })
  }
  return rows
}

const field = (name: string, value: string | null): string =>
  `${styles.light(name.padEnd(11))}${value === null || value === '' ? styles.light('—') : value}`

function show (post: Post, recording: Recording, db: Db, flags: string[]): void {
  const names = (ids: string[]): string => ids
    .map(id => findArtistById(id, db.artists)?.name ?? id)
    .join(', ')
  const song = db.songs.find(candidate => candidate.id === recording.songId)
  const where = recording.performedAt
  const when = recording.performedOn
  console.log('')
  console.log(field('flags', flags.map(flag => styles.warning(flag)).join(' ')))
  console.log(field('post', post.id))
  console.log(field('published', post.publishedOn))
  console.log(field('hidden', post.hidden ? 'true' : null))
  console.log(field('song', song?.title ?? recording.songId))
  console.log(field('artists', names(recording.byArtistIds)))
  console.log(field('featuring', names(recording.featuringArtistIds)))
  console.log(field('remixed by', names(recording.remixedByArtistIds)))
  console.log(field('originally', song === undefined ? null : names(song.originalArtistIds)))
  console.log(field('kind', recording.kind))
  console.log(field('performed', when === null
    ? null
    : [when.year, when.month, when.day].filter(part => part !== null).join('-')))
  console.log(field('at', where === null
    ? null
    : [where.venue, where.city, where.country].filter(part => part !== null).join(', ')))
  for (const [index, source] of recording.sources.entries()) {
    const said = source.nature === 'file'
      ? `file · ${source.kind} · ${source.path}`
      : `${source.nature} · ${source.service} · ${source.url}`
    console.log(field(index === 0 ? 'sources' : '', said))
  }
  if (recording.sources.length === 0) console.log(field('sources', null))
  console.log(field('body', post.body))
}

if (!existsSync(REVIEW)) {
  console.log('')
  console.log(styles.error('No IMPORT-REVIEW.md. Run `npm run data:import` first.'))
  process.exit(1)
}

const wanted = process.argv[2]
const rows = readRows(await readFile(REVIEW, { encoding: 'utf-8' }))
  .filter(row => wanted === undefined || row.flags.includes(wanted))

console.log('')
console.log(styles.title('Reviewing the import...'))
console.log(styles.light(`> ${rows.length} posts${wanted === undefined ? '' : ` flagged ${wanted}`}`))

if (rows.length === 0) {
  console.log('')
  console.log(styles.warning('Nothing to review.'))
  process.exit(0)
}

let start = 0
if (existsSync(CURSOR)) {
  const stored = (await readFile(CURSOR, { encoding: 'utf-8' })).trim()
  const at = rows.findIndex(row => row.postId === stored)
  if (at > 0) {
    const resume = await confirm({ message: `Resume at ${at + 1} of ${rows.length}?`, default: true })
    if (resume) start = at
  }
}

let db: Db = await readDb()
for (const [index, row] of rows.entries()) {
  if (index < start) continue
  const post = db.posts.find(candidate => candidate.id === row.postId)
  const recording = db.recordings.find(candidate => candidate.id === post?.recordingId)
  if (post === undefined || recording === undefined) {
    console.log(styles.warning(`\n${row.postId} is not in the data any more.`))
    continue
  }

  console.log('')
  console.log(styles.title(`${index + 1} of ${rows.length}`))
  show(post, recording, db, row.flags)
  console.log('')

  const action = await select<'edit' | 'skip' | 'quit'>({
    message: row.postId,
    choices: [
      { name: 'skip', value: 'skip' },
      { name: 'edit', value: 'edit' },
      { name: 'quit', value: 'quit' }
    ]
  })

  if (action === 'quit') {
    await writeFile(CURSOR, row.postId, { encoding: 'utf-8' })
    console.log('')
    console.log(styles.info('Stopped'))
    console.log(styles.light(`> ${index + 1} of ${rows.length} · the next run offers to resume here`))
    console.log('')
    process.exit(0)
  }
  if (action === 'skip') continue

  console.log('')
  const draft = await askDraft(db, { post, recording })
  printDraft(draft)
  console.log('')
  if (!await confirm({ message: 'Save?', default: true })) {
    console.log(styles.warning('Nothing written.'))
    continue
  }

  await storeDraftFile(draft)
  await append('artists', draft.createdArtists)
  await append('slugs', draft.createdSlugs)
  await saveSong(draft.song, draft.createdSongs, db.songs)
  await write('recordings', db.recordings.map(candidate =>
    candidate.id === draft.recording.id ? draft.recording : candidate))
  await write('posts', db.posts.map(candidate =>
    candidate.id === draft.post.id ? draft.post : candidate))
  // Read back rather than patch in memory: the next post is described from this.
  db = await readDb()
  console.log(styles.success('Saved.'))
}

await writeFile(CURSOR, '', { encoding: 'utf-8' })
console.log('')
console.log(styles.success('Review complete.'))
console.log('')
