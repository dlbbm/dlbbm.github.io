/**
 * Notes ideas for posts.
 *
 * `npm run idea` asks for one, writes it, and asks again until `quit` — a sitting at the
 * keyboard usually empties a head of several. `npm run idea -- Lewsberg, probably The Door`
 * takes the one-liner instead and writes nothing else. Each idea is appended as it is
 * typed, so quitting never loses the ones before it.
 *
 * Nothing is read out of the text — an idea is a sentence to oneself, and `post:create`
 * offers the list rather than parsing it.
 */

import process from 'node:process'
import { input, select } from '@inquirer/prompts'
import { styles } from '@design-edito/tools/agnostic/misc/logs/styles/index.js'
import { appendIdea, readIdeas } from '../_ideas/index.js'

const asked = process.argv.slice(2).join(' ').trim()

if (asked !== '') {
  await appendIdea(asked)
  console.log('')
  console.log(styles.title('Idea noted.'))
  console.log(styles.light(`> ${asked}`))
  console.log(styles.success(`${(await readIdeas()).length} ideas noted`))
  console.log('')
  process.exit(0)
}

const noted = await readIdeas()

console.log('')
console.log(styles.title('Noting ideas...'))

// The list first, since the point of a prompt that comes back is to add to what is there.
console.log(styles.info('\nideas'))
if (noted.length === 0) { console.log(styles.light('> nothing noted')) }
for (const [index, idea] of noted.entries()) {
  console.log(`${styles.light(String(index + 1))} ${idea.text}`)
}
console.log('')

let written = 0
let going = true
while (going) {
  const text = (await input({
    message: 'Idea',
    validate: value => value.trim() !== '' || 'An idea is needed, or quit.'
  })).trim()
  await appendIdea(text)
  written += 1
  going = await select<boolean>({
    message: 'Next',
    choices: [
      { name: 'next', value: true },
      { name: 'quit', value: false }
    ]
  })
}

console.log('')
console.log(styles.title('Ideas noted.'))
console.log(styles.success(`${written} written, ${noted.length + written} ideas noted`))
console.log('')
