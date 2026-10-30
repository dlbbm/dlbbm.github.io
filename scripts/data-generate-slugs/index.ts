/**
 * Mints a slug for everything addressable that lacks one.
 *
 * Append-only, like every other write to `data/`: an existing slug is left exactly as it
 * is, whatever the record is called today. The build reads this file and refuses to emit a
 * page for a record with no slug, so this is the command that answers that error.
 */

import { styles } from '@design-edito/tools/agnostic/misc/logs/styles/index.js'
import { append, readDb, type Db } from '../_db/index.js'
import { mintSlug } from '../_slug/index.js'

const db: Db = await readDb()

console.log('')
console.log(styles.title('Generating slugs...'))

const pool = [...db.slugs]
const before = pool.length

for (const artist of db.artists) {
  mintSlug('artist', artist.id, artist.name, pool)
}

const minted = pool.slice(before)
await append('slugs', minted)

console.log(styles.light(`> ${db.slugs.length} slugs already there, ${db.artists.length} artists to cover`))
for (const slug of minted) {
  const name = db.artists.find(artist => artist.id === slug.targetId)?.name ?? slug.targetId
  console.log(styles.light(`  ${slug.kind}/${slug.slug} · ${name}`))
}
console.log('')
console.log(minted.length === 0
  ? styles.success('Nothing to mint.')
  : styles.success(`${minted.length} slug${minted.length === 1 ? '' : 's'} minted.`))
console.log('')
