/**
 * Writes one HTML file per URL the site answers to.
 *
 * GitHub Pages serves files, not routes, so `/post/<id>` has to exist on disk or it 404s
 * however well the router handles it. Each file is the same shell loading the same bundle,
 * with its own `<title>` and OpenGraph tags, which is what makes a link pasted into a
 * conversation say what it is.
 *
 * The URLs come from `dist/data/routes.json`, written by `build:data` out of the route
 * patterns the app itself routes on — so a URL that works when clicked is a URL that
 * exists when pasted.
 */

import { cp, mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { styles } from '@design-edito/tools/agnostic/misc/logs/styles/index.js'
import type { BuiltManifest, BuiltRoute } from '../../shared/types/built.js'
import { CWD, DIST, DIST_DATA } from '../_config/index.js'
import { readJson } from '../_db/index.js'

const SHELL = path.join(CWD, 'src/index.html')
const ICONS = path.join(CWD, 'src/icons')

console.log('')
console.log(styles.title('Building the shells...'))

const routes = await readJson<BuiltRoute[]>(path.join(DIST_DATA, 'routes.json'))
if (routes === null) {
  console.log(styles.error('No dist/data/routes.json to read.'))
  console.log(styles.warning('> npm run build:data'))
  process.exit(1)
}

const manifest = await readJson<BuiltManifest>(path.join(DIST_DATA, 'manifest.json'))
if (manifest === null) {
  console.log(styles.error('No dist/data/manifest.json to read.'))
  console.log(styles.warning('> npm run build:data'))
  process.exit(1)
}

const shell = await readFile(SHELL, { encoding: 'utf-8' })

// `og:url` is read by machines that have no idea where the page is served from, so it is
// the only url here that cannot be relative.
const siteUrl = manifest.about.url.replace(/\/+$/, '')

// Only the five characters that can close an attribute or open a tag. The values are a
// blog's own titles, not anybody's input, but a quote in a song title would be enough.
function escapeHtml (value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function fill (route: BuiltRoute): string {
  return shell
    .replace(/\{\{title\}\}/g, escapeHtml(route.title))
    .replace(/\{\{description\}\}/g, escapeHtml(route.description))
    .replace(/\{\{url\}\}/g, escapeHtml(`${siteUrl}${route.url}`))
}

// `/` is `index.html`; every other URL is a directory with one inside, so the path serves
// without an extension and without a trailing-slash redirect.
function fileFor (url: string): string {
  const trimmed = url.replace(/^\/+|\/+$/g, '')
  return trimmed === ''
    ? path.join(DIST, 'index.html')
    : path.join(DIST, trimmed, 'index.html')
}

for (const route of routes) {
  const file = fileFor(route.url)
  await mkdir(path.dirname(file), { recursive: true })
  await writeFile(file, fill(route), { encoding: 'utf-8' })
}

// What Pages serves for anything else. It boots the same app, which renders its own
// not-found route — the status stays 404, which is the truth.
const notFound = routes.find(route => route.kind === 'home')
await writeFile(
  path.join(DIST, '404.html'),
  fill({
    kind: 'home',
    url: '/404.html',
    title: notFound?.title ?? 'Not found',
    description: 'This page does not exist.'
  }),
  { encoding: 'utf-8' }
)

// The icons travel with the shells rather than with the bundle: nothing imports them,
// and a browser asks for them at the root whether or not the app ever boots.
await cp(ICONS, DIST, { recursive: true })

console.log(styles.light(`> ${routes.length} shells, plus 404.html and the icons`))
console.log('')
console.log(styles.success('Shells built.'))
console.log('')
