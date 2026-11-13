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
import { cp, readdir, rm, writeFile } from 'node:fs/promises'
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

// And that commit has to be somewhere other than this laptop. `production` is derived in
// full from it, so a deploy from an unpushed commit puts a site online that nobody can
// rebuild — and the branch would name a commit the remote has never heard of. Compared
// against the tracking ref as it stands locally: nothing here fetches, so a push of your
// own is all this asks for.
const tracking = spawnSync('git', ['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}'], {
  cwd: CWD,
  encoding: 'utf-8'
})
if (tracking.status !== 0) {
  console.log(styles.error(`${branch} tracks nothing. Push it before deploying.`))
  process.exit(1)
}
const ahead = run('git', ['rev-list', '--count', '@{u}..HEAD'])
if (ahead !== '0') {
  console.log(styles.error(`${ahead} commit${ahead === '1' ? '' : 's'} not on ${tracking.stdout.trim()}. Push before deploying.`))
  console.log(styles.light(run('git', ['log', '--oneline', '@{u}..HEAD'])))
  process.exit(1)
}

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

  // Pages runs Jekyll on whatever it serves unless this file is there. Nothing the build
  // emits starts with an underscore today, so this buys insurance rather than fixing
  // anything — and it skips a build step on every deploy.
  await writeFile(path.join(worktree, '.nojekyll'), '', { encoding: 'utf-8' })

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
