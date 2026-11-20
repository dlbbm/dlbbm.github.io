# De la bien bonne musique

The blog, rebuilt: a database of posts under `data/`, a handful of commands to administer
it, and a Preact app that reads what the build emits.

One post is one recording of one song, credited to one or more artists, with somewhere to
hear it. The shapes live in [`types/index.ts`](./types/index.ts), which says for each one
how it maps onto schema.org and where it deliberately diverges.

**Nothing in the archive is authoritative about itself.** Every name, title and place came
out of a Tumblr post typed by hand at the time, and the import only split those strings in
two — so a spelling in `data/` is one person's typing from years ago and not a record of
what the act calls itself. It is evidence, often the best there is, never a source of
truth: that is why every pass over these strings asks rather than substitutes, and why
`keep ours` is an answer and not a refusal.

## Layout

- **`IDEAS.md`** — posts to write one day, one markdown bullet each, free text. Not a
  collection: nothing parses it, `post:create` only offers the list and strikes off the
  line it was handed. Hand-editable, and `idea` is the shortcut — it prints what is
  noted, then asks for one idea after another until `quit`.
- **`dismissed-duplicate-pairs.ndjson`** — pairs `data:merge-duplicates` offered and was
  told are two things, not one, so the same two records are not asked about again. Not a
  cache: the decision has no other home, nothing in `data/` says two names were compared
  and found apart. Hand-editable — dropping a line makes that pair askable again.
- **`reviewed-places.ndjson`** — every venue and city string `data:places` has offered and
  was told to keep or rename, so the walk does not ask about it again. Same reasoning,
  same shape: hand-editable, and dropping a line reopens that string.
- **`data/`** — the database, hand-editable, committed. Five NDJSON files, one record per
  line, appended in creation order and never rewritten by a build, plus `about.json`.
- **`shared/`** — the only space `src/` and `scripts/` are allowed to import from, and the
  reason they never import from each other: `types/` holds the shapes `data/` holds
  (`index.ts`) and the ones the build emits for the front (`built.ts`), `routes/` the URL
  patterns, so the app and the shell generator cannot disagree about what a URL looks like.
- **`scripts/`** — one directory per command, named after it: `npm run post:create` is
  `scripts/post-create`. Compiled in place, next to its sources. A `_` prefix means the
  directory is not a command: the shared helpers. `USELESS-NOW-data-import` is the
  migration that ran once and must never run again, named so that nobody wonders.
- **`src/`** — the Preact app: `index.tsx` mounts it and holds the routes, `index.html` is
  the page `build:shells` fills in once per URL, and `components/`, `data/`, `fetched/`,
  `format/`, `pages/`, `preview/`, `styles/` and `title/` are what it is made of. Nothing
  generated lives here.
- **`dist/`** — everything the site is made of, written by the build and served as is, in
  development as well as in production. Never committed.

## Running it

| Command | What it does |
| --- | --- |
| `npm start` | Builds, then watches `src` and serves `dist` on port 3000 |
| `npm run build` | `clean:dist`, then `build:data`, `build:src` and `build:shells` |
| `npm run deploy` | Builds and pushes `dist` to the `production` branch |
| `npm run typecheck` | `check:scripts` and `check:src` |
| `npm run post` | Writes a post, by asking for it (alias of `post:create`), then offers the MusicBrainz lookup |
| `npm run post:edit` | Asks a post again, prefilled, and offers the lookup when its names have never been read. Takes `-- <postId>` |
| `npm run post:delete` | Removes a post and its recording. Takes `-- <postId>` |
| `npm run post:names-lookup` | Walks the posts never read against MusicBrainz — `look up` one, or `auto look up` to sweep and leave the decisions for the end. Opens on what is put aside. Takes `-- <postId>` |
| `npm run artist:merge` | Joins two artists into one. Takes `-- <from> <into>` |
| `npm run song:edit` | Asks a work again, prefilled. Takes `-- <songId>` |
| `npm run song:merge` | Joins two works into one. Takes `-- <from> <into>` |
| `npm run idea` | Notes ideas for posts in `IDEAS.md`, asking until `quit`. Takes `-- <text>` for one |
| `npm run idea:delete` | Strikes ideas off `IDEAS.md` |
| `npm run list` | Shows what is in the data. Also `list:posts`, `list:artists`, … |
| `npm run data:check` | Reads the data against itself. Also `data:check-references`, `data:check-orphans`, `data:check-duplicates` |
| `npm run data:merge-duplicates` | Drops the slug lines written twice, then walks every pair the duplicate pass finds, artists and works alike |
| `npm run data:places` | Lists every venue and city string with its count, and renames one everywhere |

The pieces are meant to be run on their own as much as together: `build:data`, `build:src`
and `build:shells` each do one thing, `watch:src` and `serve:dist` are what `start`
composes, and `clean:scripts` is what `build:scripts` runs first.

**A whole `build` starts from an empty `dist`.** Only `build:data` clears what it owns, so
a shell for a post deleted since would otherwise sit there for ever and ship with the next
deploy — 2856 of them had piled up by the time anyone looked. Run on its own, `build:shells`
still only writes, which is what makes it quick to re-run; `clean:dist` is the one that
makes a build true.

`build:data` is also the only thing that creates a missing slug, and the only write any
build makes to `data/`. An artist with no slug has no URL and no page, so the build names
the ones it found, says `slugs.ndjson` is about to be appended to, and asks — answering no
stops it as before. Every command that names an artist already creates one as it goes, so
this fires only after `data/` was edited by hand, which is why it is a question and not a
command of its own to go and run.

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

**Four phases to the first publication, in this order**, then the ideas that come after.
The order is the point: each phase leaves the data or the code in a state the next one
takes for granted, and an item that could sit in two phases sits in the later one.

## 1. Finishing the review — done

`data:review` walked all 401 archived posts, and **every recording has something to play**:
406 YouTube and one Mixcloud across 407 recordings, where the import had flagged 106 posts
with no embed left at all. The trailing parentheses, the ampersand credits, the five whole
albums and the one title with no dash were answered row by row along the way.

`IMPORT-REVIEW.md` and the `data:review` command that walked it are **deleted**, along with
the review's cursor file. The report was written whole by the import and by nothing else,
so every answer that went into `data/` left it further behind, and the only thing that
would have made it current again is another import — which would replace the data it
describes. `post:edit` is what edits one post now, and `scripts/USELESS-NOW-data-import` holds
the import itself, out of the commands and not to be run.

## 2. Consolidating the data

The commands are written. What is left is running them, which is answering one question at
a time — and all of it before anything is published.

- **`data:check` reads the data against itself in three passes** and gates nothing: a
  finding is a question for a human, and `build:data` is what refuses to emit a broken
  site. `data:check-references` is green today, ids and stored files both.
- **62 records nothing points at**, from `data:check-orphans` — 39 works and 23 artists,
  each one the record an edit replaced rather than corrected. The pass offers them for
  deletion one at a time, and deletes nothing it was not answered for. No cascade either:
  dropping a recording can strand its work, and the next run is what says so.
- **31 pairs to decide on**, from `data:check-duplicates`, and two families cover most of
  them. An artist the import stored as one credit and a later edit split —
  `J.J. Cale ft. Leon Russell`, `clipping. (ft. Cocc Pistol Cree)`, `Velvet Underground`
  against `The Velvet Underground`, `Connan Mockasin` against `Connan Mockassin`. And a
  work the import created out of a qualifier that belonged to the take:
  `Boots (Original Melody)` against `These Boots are Made for Walkin’`.
  **`data:merge-duplicates` is the pass that answers them**, both collections in one run:
  each pair is printed with the reason it was found, and saying which record survives is
  the answer — `leave them apart` and `stop` are the other two. The survivor is always
  asked, here and in `artist:merge` / `song:merge`, which answer a single pair and are what
  a copied `-- <from> <into>` line goes to: it is the one thing a merge cannot take back.
  The report is read again after each merge rather than walked as a list, since a merge can
  strand a pair that was in it and uncover one that was not; a pair left apart is set aside
  for the run.
- **340 slug lines written twice.** `data:import` created each artist's slug and pushed it
  twice; the line is fixed, so nothing new doubles, and `data:check-duplicates` counts what
  is already there. `data:merge-duplicates` drops them, first thing and under one
  confirmation of its own: the first line of each stays, which is the one `findSlug`
  answers with, so no address moves and there is nothing to decide one by one. A slug
  string two records answer to is the other thing entirely, and comes back as a pair.
- **Two cases already read, and neither is what it looked like.** `Gallows Pole`
  (`43f903513803d9b8`) is not a second record of `Gallows Tree`: Odetta's post already sits
  on the traditional, and `Gallows Pole` holds no recording at all, so it is one of the 39
  orphans. And the `Boots` family is three records of one work —
  `These Boots are Made for Walkin’` (`4c89bbcb0ed97c09`), `Boots (Original Melody)`
  (`b783860668156851`) and `Boots` (`78a7ecad3677cd95`) — where `Boots` is Hazlewood's cover
  of the first and the parenthesis was never a work of its own.

Then the two sweeps over the hand-written strings, which nothing validates. Each is read
one by one: a blind substitution would eat `The End`, which is a club called that, and
`The Beatles`, which keeps its article in both languages.

- **The article in an artist's name, and the spelling with it.** 39 of the 423 artists
  carry one. The piling under T on `/artists` is **not** the question — the display is fine
  as it is; the question is whether each name is the one the act uses, `Pixies` against
  `The Pixies`, and there is no industry rule to apply, only each band's own usage. So this
  one is read name by name against a reference, and the standard to follow is the English
  one, never the French.

  **It was read, and the pass that read it is gone.** Every name went through MusicBrainz
  once, from a file of stored lookups and a `data:names` command that compared the two
  lists; both were deleted afterwards, the file being unrebuildable and the command having
  nothing left to read. `post:names-lookup` is what asks now, post by post and live, which
  is also what a post written tomorrow goes through.

  **The article turned out to be a non-question**: of 423 names, two lack an article
  MusicBrainz carries — `TOYS` against `The Toys`, `Brian Jonestown Massacre` against
  `The Brian Jonestown Massacre` — and none carries one it does not. What the sweep found
  instead is spelling: `Sebastien Tellier`, `Death In Vegas`, `Outkast`, `Los Angeles
  Negros`, `Nicone`, `Dona Dumitru Siminica`. Beside those sit the stylings to refuse —
  `SALEM`, `LORN`, `DARKSIDE`, `alt‐J`, `halina heron`, and `and the` where this data
  writes `& The` — which is why the pass answers nothing on its own. Two names MusicBrainz
  has no entry for are wrong all the same: `Billie Holliday` and `Mickael Jackson`.
- **The article in a venue's name.** Nine of the 24 venues begin with one, seven of them
  capitalised and part of the name on the sign — `The End` is a club called that. The two
  lowercase ones, `the Madison Square Garden` and `the Blue Parrot Beach Club`, are
  sentence words that crept in. `data:places` is the pass: it lists every venue and city
  string with how many recordings carry it, and renames one everywhere in one answer. Same
  pass: the phrasing of a broadcast, where `Live for KCUV-FM` sits in a source `name` while
  the bodies already say `Live on BBC Two`, and `on` is the form to keep.
- **A two-letter state after a US city** — `Austin, TX`, and **the rule is now settled**:
  every US city string ends with its state. It is the form an American dateline takes, and
  the one disambiguation a US reader expects, since nothing else tells Portland from
  Portland. `Place` has no region field and is not gaining one for it — the state rides in
  the city string. Run through `data:places`, with `Austin`, `Los Angeles` ×3, `Seattle` ×2
  and `Denver` to normalise, out of 16 US strings.

  **A borough or a district stops at the state**, rather than naming the city it sits in:
  `Bronx, NY` and `Brooklyn, NY`, not `Bronx, New York City, NY`, which is three levels no
  style guide writes. `Hollywood, CA` stays as it is for the same reason. And when the
  borough is not known, the city level is the answer — `New York City, NY`,
  `Los Angeles, CA` — never a guess at the district.

  **Three places to check before typing them**, found while reading the US strings:
  `The Beverly Theater` is James Brown in August 1983, so it is the Beverly Hills theatre
  demolished in 2005 and not the Las Vegas venue opened in 2023 — which makes its city
  `Beverly Hills, CA`, Beverly Hills being its own city, and its name probably
  `Beverly Theatre`, article included out of the sentence. `Leon Russell's Paradise
  Studios` is filed under Los Angeles and was in Burbank, also its own city. `The End`,
  Darkside in October 2013, read thin enough to have been taken off a post title, and it
  was: the venue is `The End Rooftop`, which the record now says. `Independence, MS` looks like a
  Missouri typo and is not one: R.L. Burnside in 1978, Tate County, Mississippi.

## 3. Publishing

**The front was audited, and the audit is answered.** A read of all 1404 lines of `src/`
on 13 November 2026 found the base sound — pages fetch, components render, `shared/` holds
what both halves of the build agree on, no state manager, no context, no abstraction
invented before it was needed — and four places worth repairing before a first deploy made
them permanent. All four and all the smaller ones were done on 18 November: the renames,
the hook and the dead code in one pass that changed nothing a reader sees but a date's
zero-padding, then the failure states, which are the one item that was always going to.

- **Names.** The ten symbols the audit listed are renamed: `loaded` is the page it holds,
  `said` is a `versionNote` and `qualifier ()` a `formatVersionNote ()`, `played` is a
  `playableSource`, `occasion` and `occasionAndDate` are `kindAndPlace` and
  `kindPlaceAndDate`, `statable` and `filled` are `isValidDateTime` and
  `dateWithGapsFilled`, `back` and `forward` are `hasPrevious` and `hasNext`,
  `Pagination`'s `onPage` prop is `pageExists`, and `current` is `isLatestRequest`, which
  now exists once. The class maker stays one name in every component — `c` since, which is
  what `lm-tools/components` and `lm-link` call it. The alias went the
  other way round from the page: the component is `components/PostArticle`, which is what
  the markup draws, and `pages/Post` keeps the route's name. Its BEM block stays `post` —
  the class names what is drawn, and renaming it would rewrite a stylesheet to no effect.
- **One fetching protocol**, in `src/fetched`. `useFetched (read, deps)` answers
  `{ status: 'loading' }` or `{ status: 'loaded', value }` and holds the race once: the six
  pages and `useDocumentTitle` all read through it, and the double wrapper two of them
  carried to tell « not arrived » from « arrived, nothing there » is gone, a value the read
  answers `null` for being loaded and empty.
- **Dead code, decided.** `PartialDate` is wired into `components/PostArticle`, which was
  building a partial date inline next door to it — so a performance date is now a `<time>`
  carrying a `datetime`, with its month zero-padded: `1968-04-12` where the inline join
  wrote `1968-4-12`. That is the one change a reader can see. `FileMedia` and the `file`
  branch of `Media` **stay**, and say so in a comment: nothing in the archive is a stored
  file, but `post:create` still offers one and `build:data` still copies the tree, so the
  front has to be able to play what the tooling can still write. And `pages/NotFound`,
  which rendered an empty `<div>`, says « There is nothing at this address. » over a link
  home.
- **The manifest is read once a tab**, memoized in `src/data`. `useDocumentTitle` mounts
  on every page and refetched it for one string that cannot change; `fetchStreamPage` read it
  again for every page of the stream. A read that failed is not kept.
- **Import order** is fixed in the six files, and in `pages/Post` where
  `shared/types/index.js` sat before `shared/types/built.js`. `goToRandomPost` now says why
  reading the whole index on each click is the point. `index.tsx`'s throw on a missing
  `#root` is still the only throw in the front.

**A read can fail, and a reader is told which failed.** Before this, a dropped connection
on a post rendered « There is no such post » and three of the readers did not catch at
all — the promise rejected, the state never moved, and the page held its skeleton for
ever. What separates the two now is the status code: `readJson` throws `MissingFile` on a
**404**, which is how absence is spelled on a site served as files, and an ordinary error
on anything else — a 500, a body that is not JSON, a browser with no network. `fetchPost`
and `fetchArtistWithPosts` turn the first into `null` and let the second through; the three
index readers catch nothing, a 404 on a file the build writes being a broken deploy rather
than an absence. `useFetched` carries the third state, and logs the error it swallows so
the console still says what happened.

**`components/Notice` is what says it**, in two voices a reader has to be able to tell
apart: `MissingNotice`, which the page fills — « There is no such post », « There is
nothing at this address » — and `FailureNotice`, the same sentence everywhere, « This did
not load. Reload the page to try again. » **Nothing to press**: a reload is the only answer
to a failed read and the browser already has that button, so the notice stays a sentence.
Both natures render alike today, the modifier classes being there for the day that stops
being true, and the `__message` rule the pages each carried is gone with them.

**A second audit, read fresh on 18 November, and the pass it asks for is the next step.**
Taken without the paragraphs above in view, against one standard: the code is its own
documentation, the path says the scope, and a symbol never repeats it. Nothing in it
changes what a reader sees. The base held up again — pages fetch, components render, no
state manager, no abstraction invented early — and what follows is in the order it should
be done.

- **« page » is pagination and nothing else now — done.** It used to mean four things:
  `BuiltPostPage` was the JSON file holding one post, `PostPage` in `utils/fetch` a slice of
  ten, `pages/` the route, `routePatterns.page` the pagination index — so `fetchPostPage`
  returned the second by reading the first. The per-entity file is a `…File`
  (`BuiltPostFile`, `BuiltArtistFile`), the view model is named for what it holds
  (`StreamPage` behind `fetchStreamPage`, `ArtistWithPosts` behind `fetchArtistWithPosts`),
  and `pages/` and `routePatterns.page` keep the word. `Built*` and `fetch*` go with the
  namespace pass below.
- **The five-line preamble is one component — done.** `About`, `Artists`, `Artist`, `Home`,
  `Post` and `Posts` each opened with the same `loading` then `failed` pair before anything
  they had of their own to say. `components/WhenLoaded` takes the `Fetched` and the loaded
  renderer, and the page passes its own `c` so the classes stay the block's: a page that
  wants to draw its waiting state styles `--loading` itself. Nothing a reader sees moved,
  which means a loading page is still an empty `<div>` — no stylesheet has ever matched
  `--loading` or `--failed`, and designing that state was left out of a rename pass. The
  three pages that also have a `missing` state keep it, inside the renderer.
- **Every shared module prefixes its symbols with its own directory — done.** `Built*` in
  `types/built.ts` lost the prefix (`Post`, `PostFile`, `ArtistFile`, …), `shared/routes`
  is `patterns` / `url` / `Kind`, `shared/titles` is `title` / `names`, and the front's own
  `fetch*`, `previewHref` and `formatPlace` dropped their prefixes too (`post`, `href`,
  `place`). Consumers import the module itself — `import type * as built`,
  `import * as routes`, `import * as titles`, `import * as data`, `import * as preview`,
  `import * as format` — and read `built.Post`, `routes.url ('page', …)`, `data.post (id)`.
  `scripts/build-data` and `scripts/build-shells` keep plain named imports aliased back to
  the old names (`Post as BuiltPost`), since those files already use the bare data-layer
  `Post` and `Artist` and a namespace import would collide.
- **`pages/Home` and `pages/Posts` do not say which is which — done.** `Home` is renamed
  `Feed`: the paginated stream of whole articles, rendering page seven as readily as `/`.
  `Posts` keeps its name — the flat list of every title, which `titles.names.posts`
  already calls « All posts ».
- **`PostArticle` draws a block called `post` — done.** `clss ('post-article')`, and the
  stylesheet's `.post` / `.post__*` follow it to `.post-article` / `.post-article__*`.
- **`src/utils/` is the junk drawer and the extra level — done.** The five subjects move up
  flat under `src/`: `fetch` is `src/data`, and `fetched`, `format`, `preview`, `title` keep
  their names one level up. `utils/` is gone. `layouts/`, a directory of one, is folded into
  `components/MainLayout`, next to `MainNav`.
- **The front bundles a stale `shared/` and says nothing — done.** `chokidar-cli` was
  already a devDependency, installed and never wired to anything. `watch:shared` now runs
  it against `shared/**/*.ts`, triggering `build:scripts` on every change, and `npm start`
  runs it alongside `watch:src` and `serve:dist` — so editing `shared/routes/index.ts`
  under a running `npm start` reaches the browser instead of silently staying on the
  `.js` `tsc -p scripts` had already emitted.
- **Two encodings that need prose to be read — done.** `isVisible` is split: `isPublished`
  is the pure date check, and `preview.active || isPublished (entry)` is written out at
  each of the three call sites instead of hiding both conditions behind one name.
  `useDocumentTitle` takes a `PageName` — `{ status: 'unknown' }` or
  `{ status: 'known', name }` — built by `known (name)` / `unknown`, instead of encoding
  the same two states as `string | null | undefined`.
- **The comments are the register to drop — done**, in `preview`, `title`, `data` (former
  `fetch`) and `Notice`: the metaphor and the paraphrase are gone, and what is left is the
  handful of lines that say a why the code cannot — the offset in a timestamp, the router
  never swapping a document, a failed read not being kept.
- **The details line of `PostArticle` — done.** `kindAndPlace`, the date and the
  parenthesised edition are now a `details` array — each present part paired with its own
  separator — built with one filter and rendered with one `.map`, replacing the three
  nested ternaries that re-tested each other's emptiness.
- **Dead code in four places, decided:**
  - `FileMedia` is deleted (47 lines of TSX, 108 of CSS) along with `PostArticle`'s `file`
    branch: this blog only ever embeds — YouTube, and one legacy Mixcloud link nowhere else
    findable — and a stored file is a future evolution, not a branch to carry unused. The
    data-layer `FileSource` type and the scripts that still let `post:create` offer one are
    untouched; only the front's unreachable render path is gone.
  - `--day-*` and `--lit-*` stay, but as a plain record rather than a live mechanism:
    `:root[data-theme='light']` and `.inverted` are deleted, since the blog ships one theme
    and changing it is a redeploy, not a toggle — nothing in the app ever triggered one.
  - `.notice--missing` and `.notice--failed` collapse into one `.notice` rule: the two read
    identically today, and the split was speculative rather than load-bearing.
- **`README.md` above and `CLAUDE.md` still describe `src/basics/` — done.** The directory
  was already gone; the layout bullet above now lists what is actually under `src/`, and
  `CLAUDE.md`'s `## basics/ knows nothing` section is deleted with it.

**Then `deploy`, which is written and has never run; the first run is the step.** It copies
`dist/` into a worktree on the `production` branch, which is what GitHub Pages serves, and it is
the only command here that pushes. What a first run asks for beyond pressing go: Pages
pointed at that branch, a read of a handful of shells and their OpenGraph tags as they
actually render, and a look at the 404.

- **`?preview` is written.** A bare `?preview` key read once at import into a module-level
  flag, exposed as `preview.active` and composed with `isPublished (entry)` at the three
  places in `src/data/index.ts` that withhold a scheduled post. In memory on purpose: the
  mode lasts as long as the tab, and the flag is read once because the router rewrites the
  URL on the first link followed. Never exercised against a live site.
- **A pasted link says a sentence.** `og:description` is what someone decides to follow a
  link on, so a post reads `Heartbeats, by The Knife, on dlbbm` and an artist
  `All the songs from The Velvet Underground on dlbbm`, where both used to list the kind,
  the date and a count — the record describing itself to a machine, which is what the page
  is for. `og:type` is `article` on a post and `website` elsewhere. The blog's short name
  is `about.json`'s, beside the full one: every other site-level string lives there.
- **`describePost` reads its date in words** — `Sat, dec 12th at 10h51`, through
  `timestampAsWords`, in `post:edit`'s list, in `post:names-lookup`'s header and in
  `npm run list` alike, the three of them sharing the line.

## 4. After publication

The thematic classification is the large one and the rest is in no fixed order.

- **Genres, styles and tags.** Three axes rather than two levels, and the leaning is
  **genres and styles decoupled**: two independent lists on a record, no parent link
  between them, the incoherences accepted rather than designed out. There is no official
  authority — the nearest thing is the Library of Congress' [LCGFT][lcgft], published in
  SKOS with a real `broader` relation, authoritative and maintained, and coarse about
  popular music exactly where this blog is fine. What the three de facto references teach:
  **[Discogs][discogs] is the two-level model and declines to nest it**, around fifteen
  genres against a few hundred styles, carried as separate lists — which is why `Disco`
  turns up under Electronic and under Funk / Soul alike. Its fifteen are Blues, Brass &
  Military, Children's, Classical, Electronic, Folk, World, & Country, Funk / Soul, Hip
  Hop, Jazz, Latin, Non-Music, Pop, Reggae, Rock and Stage & Screen, a list half format
  and half genre, which is what only having fifteen costs. **[MusicBrainz][mbgenres] is
  flat**, one alphabetical vocabulary of some 1800 terms from `2 tone` to `zydeco`, no
  levels at all, grown out of community tags and curated by ticket — open data, and the
  one list here importable wholesale. **Rate Your Music keeps the biggest tree and splits
  it in three** — genres, descriptors for mood and texture, scenes & movements — which is
  the strongest argument that a tag is a third axis and not a loose genre; its hierarchy
  is also frozen, nothing removable without moderation, which is what a tree costs once
  people depend on it. **Still open:** whether the term hangs off `Song` or `Recording` —
  schema.org has `genre` on both, and a cover can belong to another genre than the work,
  Sarah Vaughan's `Blackbird` against the Beatles' — and whether a genre is a closed
  pick-list while a tag is free text, which is what keeps a standard typology from
  drifting into `Electro`, `electronic` and `Électro`. Then `/genres` and `/genre/<slug>`.

  **The lookup process gets revisited here.** `post:names-lookup` reads a post's names
  against MusicBrainz one post at a time, and MusicBrainz also carries genres on its
  artists, releases and recordings — so once the three axes above are settled, that same
  walk is the obvious place to propose them, and this register the obvious bank to propose
  them from. What the walk should become, and whether a proposed genre is answered the way
  a name is, is a question to take then rather than now: the shape of the axes decides it.

[lcgft]: https://id.loc.gov/authorities/genreForms.html
[discogs]: https://support.discogs.com/hc/articles/360005055213-Database-Guidelines-9-Genres-Styles
[mbgenres]: https://musicbrainz.org/genres

- **Qualifying a sound, beyond genre.** The axes to add to the data over the coming
  months, and what is already known about each. Paused here rather than settled.

  **The axes under consideration.** *Era*, which wants splitting in two. *Geography*.
  *Lyrical themes*, relative to the words. *Mood*, very broad, whatever the sound gives
  off. And *bipolar axes*, five levels from `very X` through neutral to `very Y`, X and Y
  being opposites — `joyeux / triste`, `énergique / léthargique`.

  **The bipolar axes are the most studied thing in the list.** The five-step form is
  Osgood's semantic differential, 1957, and it is still the standard instrument. The two
  axes named above are [Russell's circumplex][circumplex]: valence and arousal, the
  dominant frame in music emotion research. The literature is consistent on which parts
  work — arousal gets rated reliably, valence less so, anything more abstract worse. A
  [2010 comparison][gems] of valence-arousal against basic emotions and the Geneva
  Emotional Music Scale found the plain two-dimensional model the most consistent of the
  three.

  **[Pandora's Music Genome Project][genome] is the maximal version of the same idea,
  already built.** 400 to 450 attributes per track, half-integer steps on a 0 to 5 scale,
  trained musicians at 20 to 30 minutes a song, a tenth of the catalogue double-rated for
  control. The proof it works and the warning in one: thirty salaried analysts, against
  one person and 401 posts here.

  **Two traps worth knowing before committing.** Raters avoid the extremes, so five levels
  behave like three — the neutral middle is right, the outer steps get used rarely. And the
  circumplex collapses its positive-valence, low-arousal corner, putting tenderness and
  nostalgia in one cell. For this blog that is the interesting corner, not an edge case.

  **Era wants splitting in two**, and Rate Your Music reached the same conclusion
  independently with a separate `scenes & movements` tree. A decade is rigid and derivable
  from a date; `summer of love` or `madchester` is a scene, a named vocabulary tied to a
  place *and* a moment. One field cannot do both.

  **Geography has a shape to copy, and half of it is already here.** MusicBrainz models
  `area` as a place entity with a real hierarchy — Detroit inside Michigan inside the US —
  which is what makes `Detroit techno` also answer a question about American music.
  `Place` already carries venue, city and country for `performedAt`.

  **Lyrical themes is the one with nothing to borrow.** [AllMusic][allmusic] has Themes,
  but they are occasions — late night, road trip — not subjects. No controlled vocabulary
  of lyrical subject matter is in general use, so that axis is where something would be
  invented, and probably where a loose tag beats a scale.

  **What to hold onto:** separate the factual axes from the judged ones. Region and decade
  are verifiable and stable. Mood and theme are personal, they will drift over months of
  rating, and the research puts 10 to 20 raters at the threshold of a stable estimate — so
  one rater's numbers are a point of view, which for a personal blog is arguably the
  valuable part, as long as the data does not pretend otherwise.

[allmusic]: https://www.allmusic.com/moods
[circumplex]: https://en.wikipedia.org/wiki/Emotion_classification#Circumplex_model
[gems]: https://en.wikipedia.org/wiki/Music_and_emotion
[genome]: https://en.wikipedia.org/wiki/Music_Genome_Project

- **A `nature` beside each `derivedFromSongIds` entry** — `medley`, `sample`,
  `arrangement`. Left out on purpose: the count carries the only distinction the front
  makes today, and a work built on exactly one other work shows nothing rather than
  claiming to be a medley. MusicBrainz puts that information on the relationship rather
  than on either record, which is the shape to copy the day it is wanted.
- **Nothing here is played off a local file, and nothing is expected to be.** Every
  source in the archive is an embed, so `FileSource`, `FileMedia` and the player that
  reads them are a shape the data has never taken. Which settles several questions by
  removing them: no cover image on a stored file, no end-to-end run of the file player,
  no weighing of what a repository can hold, and no second embed host — this blog stays
  on YouTube, and what `Embed` should render belongs to `Embed` the day it climbs into
  `mf-tools`.
- **A scheduled post coming of age while the tab is open.** `posts.json` gives the trigger
  for free: the nearest `publishedOn` ahead of now. Schedule one timer at a time, capped at
  around ten minutes and re-armed on each fire, and re-check on `visibilitychange` — a
  sleeping laptop makes a long timer fire late, and `setTimeout` overflows past 24.8 days
  anyway. When it fires, prepend rather than re-slice: a page showing eleven posts until
  the reader navigates is gentler than a post vanishing under their eyes. A client whose
  clock is behind shows it late, which is nobody's problem.
- **One design system across several sites.** The token layer, the theme in five colors
  and the five font slots are meant to carry over to the other small sites to come, where
  only the colors and the fonts change. Whether that becomes shared code — a package, or
  `basics/` lifted into `mf-tools` — or just the same conventions rewritten each time is
  open, and deciding it before two interfaces exist would be guessing.
- **A tour of the helpers, to see what climbs.** `scripts/_date`, `_slug`, `_describe`,
  `_db`, `_ask`, and `src/data`, `src/fetched`, `src/format`, `src/preview`, `src/title` on
  the front side: a pass over all of them asking which belongs where. `lm-tools` is the ultra-generic bank, `mf-tools` what it would make no
  sense for Le Monde to own, and the rest stays here. A piece earns the climb by having
  proven itself a step below, so this is a pass to make once the import is consolidated
  and the shapes have stopped moving — not before.
- **Postponed on purpose:** `/venue`, `/album`, and anything else that would need a shape
  the data does not have.
