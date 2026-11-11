/**
 * Notes an idea for a post, or shows the ones noted.
 *
 * `npm run idea -- Lewsberg, probably The Door` appends a bullet to `IDEAS.md`; with no
 * argument the list is printed. Nothing is read out of the text — an idea is a sentence to
 * oneself, and `post:create` offers the list rather than parsing it.
 */

import process from 'node:process'
import { styles } from '@design-edito/tools/agnostic/misc/logs/styles/index.js'
import { appendIdea, readIdeas } from '../_ideas/index.js'

const asked = process.argv.slice(2).join(' ').trim()

if (asked === '') {
  const noted = await readIdeas()
  console.log(styles.info('\nideas'))
  if (noted.length === 0) { console.log(styles.light('> nothing noted')) }
  for (const [index, idea] of noted.entries()) {
    console.log(`${styles.light(String(index + 1))} ${idea.text}`)
  }
  console.log('')
  process.exit(0)
}

await appendIdea(asked)
const ideas = await readIdeas()

console.log('')
console.log(styles.title('Idea noted.'))
console.log(styles.light(`> ${asked}`))
console.log(styles.success(`${ideas.length} ideas noted`))
console.log('')
