/**
 * `IDEAS.md`, the posts to write one day.
 *
 * Free markdown rather than a collection in `data/`: an idea has no recording, no work and
 * no artist, so there would be nothing to validate and nothing to build from. The file's
 * raw lines are carried around so a heading or a paragraph written by hand survives a
 * rewrite — only the bullets are ideas.
 */

import { existsSync } from 'node:fs'
import { readFile, writeFile } from 'node:fs/promises'
import { IDEAS_FILE } from '../_config/index.js'

const BULLET = /^\s*-\s+(.*\S)\s*$/

export type Idea = {
  /** Which of the file's lines holds it, which is how it is struck off again. */
  line: number
  text: string
}

async function readLines (): Promise<string[]> {
  if (!existsSync(IDEAS_FILE)) return []
  return (await readFile(IDEAS_FILE, { encoding: 'utf-8' })).split('\n')
}

export async function readIdeas (): Promise<Idea[]> {
  const ideas: Idea[] = []
  for (const [line, text] of (await readLines()).entries()) {
    const found = BULLET.exec(text)?.[1]
    if (found !== undefined) ideas.push({ line, text: found })
  }
  return ideas
}

export async function appendIdea (text: string): Promise<void> {
  const lines = await readLines()
  const kept = lines.length === 0 ? ['# Ideas', ''] : [...lines]
  while (kept.length > 0 && kept[kept.length - 1]?.trim() === '') { kept.pop() }
  kept.push(`- ${text}`)
  await writeFile(IDEAS_FILE, `${kept.join('\n')}\n`, { encoding: 'utf-8' })
}

/** Drops the bullets sitting on those lines, rewriting the file whole. */
export async function removeIdeas (lines: number[]): Promise<void> {
  const kept = (await readLines()).filter((_, line) => !lines.includes(line))
  await writeFile(IDEAS_FILE, `${kept.join('\n').replace(/\n+$/, '')}\n`, { encoding: 'utf-8' })
}
