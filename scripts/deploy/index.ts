/**
 * Puts the built site on the branch GitHub Pages serves.
 *
 * Plain git and nothing else: `dist` is copied into a worktree on `production`, committed
 * and pushed. A worktree rather than a checkout means this never moves the branch you are
 * working on, and nothing has to be stashed for it to run.
 *
 * The history there is kept, not squashed. `production` is derived in full from the commit
 * this names, so there is nothing in it worth a force push — and a command whose normal
 * operation is a force push is one typo away from doing it to `main`.
 *
 * This is the only command in the repository that pushes.
 */

import { spawnSync } from 'node:child_process'
import { mkdtempSync } from 'node:fs'
import { cp, readdir, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { confirm } from '@inquirer/prompts'
import { styles } from '@design-edito/tools/agnostic/misc/logs/styles/index.js'
import { CWD, DIST } from '../_config/index.js'

const BRANCH = 'production'
const REMOTE = 'origin'

function run (command: string, args: string[], cwd = CWD): string {
  const result = spawnSync(command, args, { cwd, encoding: 'utf-8' })
  if (result.status !== 0) {
    console.log(styles.error(`${command} ${args.join(' ')} failed`))
    console.log(styles.light(result.stderr.trim() || result.stdout.trim()))
    process.exit(1)
  }
  return result.stdout.trim()
}

function runLive (command: string, args: string[]): void {
  const result = spawnSync(command, args, { cwd: CWD, stdio: 'inherit' })
  if (result.status !== 0) {
    console.log(styles.error(`${command} ${args.join(' ')} failed`))
    process.exit(1)
  }
}

console.log('')
console.log(styles.title('Deploying...'))

// A deploy names the commit it was built from, so that commit has to exist: anything
// uncommitted would ship without being recorded anywhere.
const dirty = run('git', ['status', '--porcelain'])
if (dirty !== '') {
  console.log(styles.error('The tree is dirty. Commit or stash before deploying.'))
  console.log(styles.light(dirty))
  process.exit(1)
}

const branch = run('git', ['rev-parse', '--abbrev-ref', 'HEAD'])
const commit = run('git', ['rev-parse', '--short', 'HEAD'])
const subject = run('git', ['log', '-1', '--pretty=%s'])

console.log(styles.light(`> ${branch} at ${commit} — ${subject}`))
console.log(styles.danger(`This builds and pushes to ${REMOTE}/${BRANCH}, which is what the site serves.`))
console.log('')

const confirmed = await confirm({ message: 'Deploy?', default: false })
if (!confirmed) {
  console.log(styles.warning('Nothing deployed.'))
  process.exit(0)
}

runLive('npm', ['run', 'build'])

const worktree = mkdtempSync(path.join(os.tmpdir(), 'dlbbm-deploy-'))
const hasBranch = spawnSync('git', ['rev-parse', '--verify', '--quiet', `refs/heads/${BRANCH}`], { cwd: CWD }).status === 0

console.log('')
console.log(styles.title('Copying into the worktree...'))
console.log(styles.light(`> ${worktree}`))

if (hasBranch) { run('git', ['worktree', 'add', worktree, BRANCH]) }
else { run('git', ['worktree', 'add', '--orphan', '-b', BRANCH, worktree]) }

try {
  // The branch holds the site and nothing else, so whatever a previous deploy left that
  // this one does not produce has to go.
  for (const entry of await readdir(worktree)) {
    if (entry === '.git') continue
    await rm(path.join(worktree, entry), { recursive: true, force: true })
  }
  await cp(DIST, worktree, { recursive: true })

  run('git', ['add', '--all'], worktree)
  const staged = run('git', ['status', '--porcelain'], worktree)
  if (staged === '') {
    console.log(styles.warning(`${BRANCH} already holds this build. Nothing to push.`))
  } else {
    run('git', ['commit', '-m', `deploy - ${branch} ${commit} (${subject})`], worktree)
    console.log('')
    console.log(styles.title('Pushing...'))
    runLive('git', ['-C', worktree, 'push', REMOTE, BRANCH])
    console.log('')
    console.log(styles.success(`${BRANCH} updated from ${commit}.`))
  }
} finally {
  run('git', ['worktree', 'remove', '--force', worktree])
  console.log(styles.light('> worktree removed'))
}

console.log('')
