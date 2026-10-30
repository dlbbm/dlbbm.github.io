# De la bien bonne musique

The blog, rebuilt: a database of posts under `data/`, a handful of commands to administer
it, and a Preact app that reads what the build emits.

One post is one recording of one song, credited to one or more artists, with somewhere to
hear it. The shapes live in [`types/index.ts`](./types/index.ts), which says for each one
how it maps onto schema.org and where it deliberately diverges.

## Layout

- **`data/`** — the database, hand-editable, committed. Five NDJSON files, one record per
  line, appended in creation order and never rewritten by a build, plus `about.json`.
- **`types/`** — the shapes `data/` holds (`index.ts`) and the shapes the build emits for
  the front (`built.ts`).
- **`scripts/`** — one directory per command, named after it: `npm run post:create` is
  `scripts/post-create`. Compiled in place, next to its sources.
- **`routes/`** — the URL patterns, imported by the app and by the shell generator, so the
  two cannot disagree about what a URL looks like.
- **`src/`** — the Preact app. Nothing generated lives here.
- **`dist/`** — everything the site is made of, written by the build and served as is, in
  development as well as in production. Never committed.

## Running it

| Command | What it does |
| --- | --- |
| `npm start` | Builds, then watches `src` and serves `dist` |
| `npm run build` | `build:data`, `build:src` and `build:shells` |
| `npm run deploy` | Builds and publishes `dist` to the `production` branch |
| `npm run post` | Writes a post, by asking for it (alias of `post:create`) |
| `npm run post:edit` | Asks a post again, prefilled. Takes `-- <postId>` |
| `npm run list` | Shows what is in the data. Also `list:posts`, `list:artists`, … |
| `npm run data:generate-slugs` | Mints a slug for anything addressable that lacks one |
| `npm run data:generate-test-data` | Replaces the database with fifty test posts |
| `npm run typecheck` | Everything, in one pass |

## How it is served

The site is a Preact app that fetches JSON. The build does every join, so the browser
never resolves an id: `build:data` reads `data/` and writes `dist/data/` as pages of ten
posts, one file per post, one per artist, and the indexes the registers need.

Two things are dropped at that point rather than filtered in the browser, because a record
sitting in a public file is published whatever the page does with it: a post marked
`hidden`, and a post whose `publishedOn` is still in the future. Which means a scheduled
post appears at the next deploy, not at the moment it names.

`build:shells` then writes one HTML file per URL, each carrying its own `<title>` and
OpenGraph tags, so a link pasted into a conversation says what it is. They all load the
same bundle; the content still arrives as JSON.

`deploy` copies `dist/` into a worktree on the `production` branch, which is what GitHub
Pages serves, and pushes it. It is the only command in this repository that pushes.

# Roadmap

- **The app itself.** The router, the data split and the shells exist; no page displays
  anything yet. The first real decision is what a post looks like.
- **`/posts` and `/artists`** are routes with nothing behind them, waiting for a visual
  idea of what a register is.
- **Genres.** A `genre` on `Song` — schema.org has the property — plus `/genres` and
  `/genre/<slug>`. Worth doing once the stream exists and the vocabulary is obvious.
- **The archive.** 401 posts live in `maximefabas/_DATA/delabienbonnemusique.tumblr.com/`
  and are not imported yet. The import wants the dash splitting and the trailing
  parenthetical parsing that `post:create` dropped when it stopped reading title lines,
  and it should reuse `scripts/_db` rather than grow its own writer.
- **`post:delete`**, which rewrites the file the way `post:edit` already does.
- **`data:check-references`**, for dangling ids and a `FileSource` whose file is missing.
- **`data:list-orphans`**, for what `post:edit` leaves behind when a credit is replaced:
  an artist nothing points at any more.
- **`data:generate-test-data` is temporary.** Delete it when the real posts outnumber what
  it can teach.
- **Media weight.** A local file lives twice, in `data/files` and in the published branch,
  and Pages caps a site at 1 GB. If local files become the norm rather than the exception,
  they will have to be served from somewhere else, with only the reference kept here.
- **Postponed on purpose:** `/venue`, `/album`, and anything else that would need a shape
  the data does not have.
