# De la bien bonne musique

The blog, rebuilt: a database of posts under `data/`, a handful of commands to administer
it, and a Preact app that reads what the build emits.

One post is one recording of one song, credited to one or more artists, with somewhere to
hear it. The shapes live in [`types/index.ts`](./types/index.ts), which says for each one
how it maps onto schema.org and where it deliberately diverges.

## Layout

- **`IMPORT-REVIEW.md`** — every imported post, the flagged ones first, with what the
  import could not read. Written whole on every run, so it is a report and never a record.
  It is also the worklist `data:review` walks: that command takes the order and the flags
  from here and everything else from the database, so only the id closing a row and the
  flags opening it are ever parsed.
- **`data/`** — the database, hand-editable, committed. Five NDJSON files, one record per
  line, appended in creation order and never rewritten by a build, plus `about.json`.
- **`shared/`** — the only space `src/` and `scripts/` are allowed to import from, and the
  reason they never import from each other: `types/` holds the shapes `data/` holds
  (`index.ts`) and the ones the build emits for the front (`built.ts`), `routes/` the URL
  patterns, so the app and the shell generator cannot disagree about what a URL looks like.
- **`scripts/`** — one directory per command, named after it: `npm run post:create` is
  `scripts/post-create`. Compiled in place, next to its sources.
- **`src/`** — the Preact app: `index.tsx` mounts it and holds the routes, `index.html` is
  the page `build:shells` fills in once per URL, and `basics/`, `components/`, `layouts/`,
  `pages/` and `utils/` are what it is made of. Nothing generated lives here.
  **`basics/`** holds the components bound for `mf-tools`: none of them knows anything of
  this blog, which is checkable — a basic imports nothing from `shared/` and nothing from
  `components/`.
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
| `npm run song:edit` | Asks a work again, prefilled. Takes `-- <songId>` |
| `npm run list` | Shows what is in the data. Also `list:posts`, `list:artists`, … |
| `npm run data:generate-slugs` | Mints a slug for anything addressable that lacks one |
| `npm run data:import` | Reads a Tumblr archive into `data/`. Takes `-- <path to pages.ndjson>` |
| `npm run data:review` | Walks the imported posts one by one, editing the ones that need it. Takes `-- <flag>` |
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

- **One design system across several sites.** The token layer, the theme in five colors
  and the five font slots are meant to carry over to the other small sites to come, where
  only the colors and the fonts change. Whether that becomes shared code — a package, or
  `basics/` lifted into `mf-tools` — or just the same conventions rewritten each time is
  open, and deciding it before two interfaces exist would be guessing.
- **A tour of the helpers, to see what climbs.** `scripts/_date`, `_slug`, `_describe`,
  `_db`, `_ask`, and `src/utils/` on the front side: a pass over all of them asking which
  belongs where. `lm-tools` is the ultra-generic bank, `mf-tools` what it would make no
  sense for Le Monde to own, and the rest stays here. A piece earns the climb by having
  proven itself a step below, so this is a pass to make once the import is consolidated
  and the shapes have stopped moving — not before.
- **A scheduled post coming of age while the tab is open.** `posts.json` gives the trigger
  for free: the nearest `publishedOn` ahead of now. Schedule one timer at a time, capped at
  around ten minutes and re-armed on each fire, and re-check on `visibilitychange` — a
  sleeping laptop makes a long timer fire late, and `setTimeout` overflows past 24.8 days
  anyway. When it fires, prepend rather than re-slice: a page showing eleven posts until
  the reader navigates is gentler than a post vanishing under their eyes. A client whose
  clock is behind shows it late, which is nobody's problem.
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
- **Consolidating the import.** The 401 archived posts are in, and
  [`IMPORT-REVIEW.md`](./IMPORT-REVIEW.md) lists the 170 that need a hand. In order of how
  much they cost: **127 posts have nothing to play** — the embed was already gone when the
  blog was crawled, and seven of those carry a dead Grooveshark or Mixcloud URL in the
  body, kept in the report rather than stored; **17 credits hold an ampersand or a comma**
  and were written as a single artist, because no rule tells `Polo & Pan` from
  `Murcof & Vanessa Wagner`; **5 posts are whole albums**, stored as a `full album`
  recording with the tracklist kept in the post's `body` — their names want checking;
  **47 trailing parentheses**
  were read as a kind, a place or a date and want checking; and **one title has no dash**
  at all.
- **A cover image on a stored file.** `FileSource` carries a `kind` and a `path` and
  nothing else, so a local mp3 has no picture and `FileMedia` shows a flat ground where a
  sleeve should be. Wants a field on the type, a question in `post:create` — the file
  already goes through `storeFile`, so a second one costs nothing — and the front reading
  it as the player's `poster`.
- **The file player has never met a file.** Everything in the database is a YouTube or
  Vimeo embed, so the `Video` wrapper, its play button, its 4px timeline and its two
  clocks have only ever been reasoned about. Wants one post with an mp3 and no external
  source, end to end: `post:create`, `build:data`, the stream, the post page.
- **More hosts, once a dead source is being replaced.** `mediaServices` names six and
  `Embed` renders three of them. The two worth adding for this archive are
  **archive.org**, where a lot of what Tumblr lost actually lives, and **dailymotion**,
  which a French blog of 2012 would have used. Apple Music, Deezer and Tidal embed only
  a thirty-second preview unless the reader is signed in, which is worse than a link.
  Adding a name to the enum is not enough on its own: without a player in `Embed`, a
  source falls back to a bare link.
- **A release layer, the day one is earned.** `Source.name` carries which edition a given
  audio is — `remaster 2015`, `original mono mix` — because a remaster is the same take
  and only the thing you point at differs. schema.org's own answer is `MusicRelease`,
  told apart by `datePublished`, `catalogNumber`, `recordLabel` and `musicReleaseFormat`,
  and it is deliberately not adopted: it hangs off `MusicAlbum`, which this blog does not
  model, so taking it would mean inventing an entity for one label. **The trigger to
  revisit** is the day the same edition is linked on two services and the fact should be
  shared rather than repeated — then a release record between `Recording` and `Source`
  has paid for itself. Until then the field is free text, and a vocabulary gets extracted
  from it the way `recordingKinds` describes: a value earns its place by recurring.
- **`song:edit`**, for a work on its own. `post:edit` reaches a work only through a post,
  and since `Title` came to mean the take's name, nothing renames a work at all — which is
  why `Into the Black` had to be repaired by hand. Asks the four questions a work owns: its
  title, its other names, its original artists, and what it is built on.
- **A `nature` beside each `derivedFromSongIds` entry** — `medley`, `sample`,
  `arrangement`. Left out on purpose: the count carries the only distinction the front
  makes today, and a work built on exactly one other work shows nothing rather than
  claiming to be a medley. MusicBrainz puts that information on the relationship rather
  than on either record, which is the shape to copy the day it is wanted.
- **`data:list-duplicates`**, for the artists the import entered twice —
  `The Velvet Underground` against `Velvet Underground`, `Connan Mockasin` against
  `Connan Mockassin`. Each one splits an artist's page in two, and nothing notices.
- **`post:delete`**, which rewrites the file the way `post:edit` already does.
- **`data:check-references`**, for dangling ids and a `FileSource` whose file is missing.
- **`data:list-orphans`**, for what `post:edit` leaves behind when a credit is replaced:
  an artist nothing points at any more.
- **`data:generate-test-data` is temporary**, and the real posts now outnumber what it can
  teach. It stays only until the import is consolidated, since it is the quickest way back
  to a database that is not 401 records long.
- **Media weight.** A local file lives twice, in `data/files` and in the published branch,
  and Pages caps a site at 1 GB. If local files become the norm rather than the exception,
  they will have to be served from somewhere else, with only the reference kept here.
- **Postponed on purpose:** `/venue`, `/album`, and anything else that would need a shape
  the data does not have.
