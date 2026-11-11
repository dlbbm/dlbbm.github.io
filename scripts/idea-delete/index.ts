/**
 * Strikes ideas off `IDEAS.md`.
 *
 * A checkbox rather than one pick, since several go at once: a sitting spent writing posts
 * empties a handful of them. `post:create` strikes off the one it was handed on its own.
 */

import process from 'node:process'
import { checkbox, confirm } from '@inquirer/prompts'
import { styles } from '@design-edito/tools/agnostic/misc/logs/styles/index.js'
import { readIdeas, removeIdeas, type Idea } from '../_ideas/index.js'

const ideas = await readIdeas()

console.log('')
console.log(styles.title('Striking ideas off...'))

if (ideas.length === 0) {
  console.log(styles.warning('Nothing noted.'))
  process.exit(0)
}

console.log('')
const picked = await checkbox<Idea>({
  message: 'Ideas',
  choices: ideas.map(idea => ({ name: idea.text, value: idea }))
})

if (picked.length === 0) {
  console.log(styles.warning('Nothing written.'))
  process.exit(0)
}

console.log(styles.info('\nTo be struck off'))
for (const idea of picked) { console.log(styles.light(`> ${idea.text}`)) }

console.log('')
console.log(styles.danger('IDEAS.md is rewritten whole.'))
const confirmed = await confirm({ message: 'Strike?', default: false })
if (!confirmed) {
  console.log(styles.warning('Nothing written.'))
  process.exit(0)
}

await removeIdeas(picked.map(idea => idea.line))

console.log('')
console.log(styles.title('Ideas struck off.'))
console.log(styles.success(`${ideas.length - picked.length} ideas noted`))
console.log('')
