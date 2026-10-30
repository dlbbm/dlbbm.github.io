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
- **`src/`** — the Preact app, plus `shell.html`, the page `build:shells` fills in once
  per URL. Nothing generated lives here.
- **`dist/`** — everything the site is made of, written by the build and served as is, in
  development as well as in production. Never committed.

## Running it

| Command | What it does |
| --- | --- |
| `npm start` | Builds, then watches `src` and serves `dist` on port 3000 |
| `npm run build` | `build:data`, then `build:src`, then `build:shells` |
| `npm run deploy` | Builds and pushes `dist` to the `production` branch |
| `npm run typecheck` | `check:scripts` and `check:src` |
| `npm run post` | Writes a post, by asking for it (alias of `post:create`) |
| `npm run post:edit` | Asks a post again, prefilled. Takes `-- <postId>` |
| `npm run list` | Shows what is in the data. Also `list:posts`, `list:artists`, … |
| `npm run data:generate-slugs` | Mints a slug for anything addressable that lacks one |
| `npm run data:generate-test-data` | Replaces the database with fifty test posts |

The pieces are meant to be run on their own as much as together: `build:data`, `build:src`
and `build:shells` each do one thing, `watch:src` and `serve:dist` are what `start`
composes, and `clean:scripts` is what `build:scripts` runs first.

Two typecheck passes rather than one, because `src` is a different language setting from
the rest: it is JSX resolved for the bundler, while `scripts` is NodeNext and emits.

## How it is served

The site is a Preact app that fetches JSON. The build does every join, so the browser
never resolves an id: `build:data` reads `data/` and writes `dist/data/` as `posts.json`,
the whole stream in order and lean, one file per post, one per artist, and the index
`/artists` needs.

Pagination belongs to the front, not to the build. It fetches `posts.json` once, drops
what is still ahead of now, and page N is a slice of what remains — always ten, whatever
the build thought. Pages cut at build time would read short, and fixed-size slabs would
leave the front unable to say where page ten starts without reading the nine before it.

A post marked `hidden` is dropped at that point: it is a standing decision, so nothing
ships. A scheduled post — one whose `publishedOn` is still ahead — does ship, and the front
is what withholds it, which is the only way it can appear at the minute it names instead of
at the next deploy. So anything that displays a post compares `publishedOn` with now first.
The trade is that a scheduled post's JSON and its shell can be read before its date.

`build:shells` then writes one HTML file per URL, each carrying its own `<title>` and
OpenGraph tags, so a link pasted into a conversation says what it is. They all load the
same bundle; the content still arrives as JSON.

`deploy` copies `dist/` into a worktree on the `production` branch, which is what GitHub
Pages serves, and pushes it. A worktree rather than a checkout, so it never moves the
branch you are working on. It refuses a dirty tree, since the commit it names has to
exist, and it keeps a normal history there rather than squashing: `production` is derived
in full from that commit, so nothing in it is worth a force push. It is the only command
in this repository that pushes.

# Roadmap

- **The app itself.** The router, the data split and the shells exist; no page displays
  anything yet. The first real decision is what a post looks like.
- **`/posts` and `/artists`** are routes with nothing behind them, waiting for a visual
  idea of what a register is.
- **A scheduled post coming of age while the tab is open.** `posts.json` gives the trigger
  for free: the nearest `publishedOn` ahead of now. Schedule one timer at a time, capped at
  around ten minutes and re-armed on each fire, and re-check on `visibilitychange` — a
  sleeping laptop makes a long timer fire late, and `setTimeout` overflows past 24.8 days
  anyway. When it fires, prepend rather than re-slice: a page showing eleven posts until
  the reader navigates is gentler than a post vanishing under their eyes. A client whose
  clock is behind shows it late, which is nobody's problem.
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
