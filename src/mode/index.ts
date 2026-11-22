/**
 * Whether this bundle was built for development — the gate anything dev-only reads, the
 * tag-editing UI being the first to come.
 *
 * `DLBBM_MODE` is an esbuild `define`, read once at build time and inlined as a string
 * literal, not a runtime env var: a `dev`-only branch is dead code the minifier drops from
 * the production bundle rather than a flag a reader in devtools could flip.
 */

export const dev: boolean = process.env.DLBBM_MODE !== 'production'
