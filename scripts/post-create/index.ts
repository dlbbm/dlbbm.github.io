/**
 * Writes one post into the database, by asking for it.
 *
 * The questions live in `scripts/_ask`, which `post:edit` asks again with every answer
 * prefilled. This command only reads what is there, confirms, and appends.
 */

import process from 'node:process'
import { confirm, select } from '@inquirer/prompts'
import { styles } from '@design-edito/tools/agnostic/misc/logs/styles/index.js'
import { askDraft, printDraft, printRecords, storeDraftFile } from '../_ask/index.js'
import { append, readDb, saveSong, type Db } from '../_db/index.js'
import { printPending } from '../_describe/index.js'
import { readIdeas, removeIdeas, type Idea } from '../_ideas/index.js'
import { offerLookUp } from '../_names/index.js'

const db: Db = await readDb()

console.log('')
console.log(styles.title('Writing a post...'))
console.log(styles.light(`> ${db.posts.length} posts, ${db.songs.length} songs, ${db.artists.length} artists so far`))

// Before the first question, because a slot taken is what the prompts cannot show.
printPending(db)
console.log('')

const ideas = await readIdeas()
let noted: Idea | null = null
if (ideas.length > 0) {
  console.log(styles.light('> an idea noted in IDEAS.md, struck off once the post is written'))
  noted = await select<Idea | null>({
    message: 'Idea',
    choices: [
      { name: 'null', value: null },
      ...ideas.map(idea => ({ name: idea.text, value: idea as Idea | null }))
    ]
  })
  console.log('')
}

const draft = await askDraft(db, null)

printDraft(draft)

const newRecords = [
  draft.createdArtists.length === 0 ? null : `${draft.createdArtists.length} artist`,
  draft.createdSlugs.length === 0 ? null : `${draft.createdSlugs.length} slug`,
  draft.createdSongs.length === 0 ? null : '1 song',
  '1 recording',
  '1 post'
].filter((part): part is string => part !== null)
console.log(styles.info('\nTo be appended'))
console.log(styles.light(newRecords.join(', ')))
console.log('')

const confirmed = await confirm({ message: 'Post?', default: true })
if (!confirmed) {
  console.log(styles.warning('Nothing written.'))
  process.exit(0)
}

// The file before the records that name it, for the same reason the records go in this
// order: a crash leaves something unreferenced rather than a reference to nothing.
await storeDraftFile(draft)

// Entities before the post that points at them: a crash between two appends leaves an
// unreferenced song or artist, never a post pointing at a recording that is not there.
await append('artists', draft.createdArtists)
await append('slugs', draft.createdSlugs)
await saveSong(draft.song, draft.createdSongs, db.songs)
await append('recordings', [draft.recording])
await append('posts', [draft.post])

// Last, and only once the post it stood for exists.
if (noted !== null) await removeIdeas([noted.line])

console.log('')
console.log(styles.title('Post written.'))
console.log(styles.success(`${db.posts.length + 1} posts in the data`))
if (noted !== null) { console.log(styles.light(`> struck off IDEAS.md: ${noted.text}`)) }

printRecords({
  artists: draft.createdArtists,
  slugs: draft.createdSlugs,
  songs: draft.createdSongs,
  recordings: [draft.recording],
  posts: [draft.post]
})

// The names are read while the post is still in front of you, rather than months later in
// `post:names-lookup`. Declining leaves the post to that walk.
await offerLookUp(draft.post.id)
console.log('')
