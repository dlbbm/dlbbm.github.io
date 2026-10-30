/**
 * Bundles the app into `dist`.
 *
 * esbuild and nothing else: one entry point, ESM out, code split so a route can be lazy
 * the day it needs to be. `ESBUILD_WATCH=true` keeps it running and rebuilding, which is
 * what `npm start` uses while `http-server` serves the same directory.
 */

import path from 'node:path'
import process from 'node:process'
import esbuild, { type BuildOptions } from 'esbuild'
import { styles } from '@design-edito/tools/agnostic/misc/logs/styles/index.js'
import { CWD, DIST } from '../_config/index.js'

const WATCH = process.env.ESBUILD_WATCH === 'true'
const PROD = process.env.DLBBM_MODE === 'production'

const options: BuildOptions = {
  entryPoints: [path.join(CWD, 'src/index.tsx')],
  outdir: DIST,
  tsconfig: path.join(CWD, 'src/tsconfig.json'),
  format: 'esm',
  platform: 'browser',
  target: ['esnext'],
  bundle: true,
  splitting: true,
  chunkNames: 'chunks/[name].[hash]',
  jsx: 'automatic',
  jsxImportSource: 'preact',
  minify: PROD,
  sourcemap: !PROD,
  metafile: true,
  logLevel: 'info'
}

console.log('')
console.log(styles.title(WATCH ? 'Watching the app...' : 'Building the app...'))
console.log(styles.light(`> ${PROD ? 'production' : 'development'}`))

if (WATCH) {
  const context = await esbuild.context(options)
  await context.watch()
} else {
  await esbuild.build(options)
  console.log('')
  console.log(styles.success('App built.'))
  console.log('')
}
