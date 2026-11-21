/**
 * Dev-only tag editing, reachable from the front while `npm start` is running.
 *
 * Never built, never deployed: `server/` sits outside everything `build` and `deploy`
 * touch, and nothing in `dist/` ever points at it. A write here goes straight to `data/`,
 * the same files every CLI command reads and rewrites — `readDb` fresh on every request,
 * never cached, so an edit made through `post:edit` in a terminal while this is running is
 * never shadowed by a stale copy.
 */

import http from 'node:http'
import cors from 'cors'
import express, { type Request, type Response } from 'express'
import { styles } from '@design-edito/tools/agnostic/misc/logs/styles/index.js'
import type { Tag } from '../shared/types/index.js'
import { append, readDb, write } from '../scripts/_db/index.js'
import { attachTag, detachTag, resolveTag } from '../scripts/_tags/index.js'

const PORT = Number(process.env.TAGS_SERVER_PORT ?? 3001)

const app = express()
app.use(cors())
app.use(express.json())

app.get('/api/tags', async (req: Request, res: Response) => {
  const db = await readDb()
  const group = typeof req.query.group === 'string' ? req.query.group.toLowerCase() : null
  res.json(group === null ? db.tags : db.tags.filter(tag => tag.group.toLowerCase() === group))
})

app.post('/api/posts/:postId/tags', async (req: Request<{ postId: string }>, res: Response) => {
  const { group, name } = req.body as { group?: unknown, name?: unknown }
  if (typeof group !== 'string' || group.trim() === '' || typeof name !== 'string' || name.trim() === '') {
    res.status(400).json({ error: 'group and name are required' })
    return
  }

  const db = await readDb()
  const post = db.posts.find(candidate => candidate.id === req.params.postId)
  if (post === undefined) {
    res.status(404).json({ error: 'No such post' })
    return
  }
  const recording = db.recordings.find(candidate => candidate.id === post.recordingId)
  if (recording === undefined) {
    res.status(404).json({ error: 'No such recording' })
    return
  }

  const created: Tag[] = []
  const tag = resolveTag(name, group, db.tags, created)
  const attached = attachTag(recording, tag.id)
  if (created.length > 0) await append('tags', created)
  if (attached) {
    await write('recordings', db.recordings.map(candidate =>
      candidate.id === recording.id ? recording : candidate))
  }
  console.log(styles.light(`> ${tag.group}/${tag.name} attached to recording ${recording.id}`))
  res.json({ tag, tagIds: recording.tagIds })
})

app.delete('/api/posts/:postId/tags/:tagId', async (req: Request<{ postId: string, tagId: string }>, res: Response) => {
  const db = await readDb()
  const post = db.posts.find(candidate => candidate.id === req.params.postId)
  if (post === undefined) {
    res.status(404).json({ error: 'No such post' })
    return
  }
  const recording = db.recordings.find(candidate => candidate.id === post.recordingId)
  if (recording === undefined) {
    res.status(404).json({ error: 'No such recording' })
    return
  }

  const detached = detachTag(recording, req.params.tagId)
  if (detached) {
    await write('recordings', db.recordings.map(candidate =>
      candidate.id === recording.id ? recording : candidate))
    console.log(styles.light(`> tag ${req.params.tagId} detached from recording ${recording.id}`))
  }
  res.json({ tagIds: recording.tagIds })
})

const server = http.createServer(app)
server.listen(PORT, () => {
  console.log('')
  console.log(styles.title('Tag server listening...'))
  console.log(styles.light(`> http://localhost:${PORT}`))
})
server.on('error', (error: NodeJS.ErrnoException) => {
  console.log(styles.error(error.code === 'EADDRINUSE' ? `Port ${PORT} is already in use.` : error.message))
  process.exit(1)
})
