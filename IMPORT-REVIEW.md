# Import review

Written by `npm run data:import`. **All 401 posts are listed**, flagged ones first: the
159 the import could not read cleanly, then the 242 it believes it got right, with an
empty `flags` cell. Checking those is optional; the flagged ones are where the work is.

**Four columns are yours to edit**, in place, row by row — `artist`, `song`, `source`
and `note`, which sit together on the left. `flags` opens each row with what the import
could not read, and `find`, `date` and `post` are there to help you answer.

- **`artist`** — correct it if the import read it wrong, and **split a credit with
  `;`**: `Brigitte Fontaine; The Art Ensemble of Chicago; Areski Belkacem` is three
  artists where the import stored one. A name prefixed `ft.` is a guest rather than a
  credit: `Nicone; Sascha Braemer; ft. Narra`. A name already in the database is reused;
  a new one is created with its own URL.
- **`song`** — the work's title, if the import mangled it.
- **`kind`** — what the parenthesis at the end of the title was read as. Most of the
  `read-qualifier` rows are wrong here, because a cover and a remix both landed in it as
  free text. Three forms are understood: a plain kind (`live`, `demo`, `remix`,
  `alternate-take`, `full album`, or anything else), `cover: Neil Young` for a cover —
  which sets the song's original artist — and `remix: Goldroom` for a remix, which credits
  the remixer. Empty it to say the parenthesis meant nothing.
- **`source`** — a URL that plays the track. The `find` link opens a YouTube search for
  that artist and song.
- **`note`** — yours. Prefilled where the import read a place or a date out of the title,
  since no column holds those; overwrite it freely. Nothing reads it back.

A cell left as the import wrote it changes nothing. The `post` column is the id
`npm run post:edit -- <id>` takes, for anything this table has no column for.

> **Running `data:import` again rewrites this file and replaces the database**, so
> whatever is filled in here is lost along with every hand edit. Import once, then work
> from here.

## What the flags mean

- **`no-source`** — 106 · Nothing to play. The embed was gone when the blog was crawled, so the post arrives as a title and a date.
- **`widget-url`** — 7 · The source is a player widget rather than a page, because that is what the archive held. It plays; it just does not read as a URL a human would share.
- **`unsplit-title`** — 1 · No dash in the title, so the whole line became the artist and the song both. Needs splitting by hand.
- **`ambiguous-credit`** — 17 · The credit holds an ampersand or a comma. It was kept as one artist, because no rule tells `Polo & Pan` from `Murcof & Vanessa Wagner`.
- **`dead-source-in-body`** — 5 · A URL was found in the body, on a host that is dead or is not an embed. Kept here rather than stored.
- **`read-qualifier`** — 52 · A parenthesis at the end of the title was read as a kind, a place or a date. Worth checking it said that.

## The posts

| flags | artist | song | kind | source | find | note | date | post |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `no-source` | Death In Vegas | All That Glitters |  | https://www.youtube.com/watch?v=phOaNyOXhHA | [find](https://www.youtube.com/results?search_query=Death%20In%20Vegas%20All%20That%20Glitters) |  | 2012-12-15 | `904b71ccbbd0523a` |
| `no-source` | IS Tropical | Lies |  | https://www.youtube.com/watch?v=-eRvVheUK04 | [find](https://www.youtube.com/results?search_query=IS%20Tropical%20Lies) |  | 2012-12-15 | `c8e5805defa42c2e` |
| `read-qualifier` | Connan Mockassin | Forever Dolphin Love | Erol Alkan Rework | https://www.youtube.com/watch?v=E7CaTJ2SvG8 | [find](https://www.youtube.com/results?search_query=Connan%20Mockassin%20Forever%20Dolphin%20Love) |  | 2012-12-16 | `d509c396bcfeeddd` |
| `no-source` | F.J. Mc Mahon | The Spirit of the Golden Juice |  | https://www.youtube.com/watch?v=pvN3q3IUDtg | [find](https://www.youtube.com/results?search_query=F.J.%20Mc%20Mahon%20The%20Spirit%20of%20the%20Golden%20Juice) |  | 2012-12-16 | `16d8fdd80eb07c24` |
| `no-source` | The Doors | Cars Hiss By My Window |  | https://www.youtube.com/watch?v=YZKCa2gD1BA | [find](https://www.youtube.com/results?search_query=The%20Doors%20Cars%20Hiss%20By%20My%20Window) |  | 2012-12-16 | `7b45bad59c832b80` |
| `read-qualifier` | Brigitte | Ma Benz | Suprême NTM cover |  | [find](https://www.youtube.com/results?search_query=Brigitte%20Ma%20Benz) |  | 2012-12-16 | `09ab467119c79540` |
| `ambiguous-credit` | Nicone & Sascha Braemer (ft. Narra) | Caje |  |  | [find](https://www.youtube.com/results?search_query=Nicone%20%26%20Sascha%20Braemer%20(ft.%20Narra)%20Caje) |  | 2012-12-16 | `5fa7b7c7331d28f7` |
| `no-source` | J.J. Cale | Since You Said Goodbye |  |  | [find](https://www.youtube.com/results?search_query=J.J.%20Cale%20Since%20You%20Said%20Goodbye) |  | 2012-12-16 | `674c15834e937105` |
| `no-source` | Pink Floyd | Lucifer Sam |  |  | [find](https://www.youtube.com/results?search_query=Pink%20Floyd%20Lucifer%20Sam) |  | 2012-12-16 | `0b40f34333103457` |
| `no-source` `dead-source-in-body` | Serge Gainsbourg | Comme un Boomerang |  |  | [find](https://www.youtube.com/results?search_query=Serge%20Gainsbourg%20Comme%20un%20Boomerang) | `http://grooveshark.com/songWidget.swf` | 2012-12-16 | `d66edfed6fddc22c` |
| `read-qualifier` | Rone | La Dame Blanche | extended |  | [find](https://www.youtube.com/results?search_query=Rone%20La%20Dame%20Blanche) |  | 2012-12-16 | `7912bc92bf753376` |
| `no-source` | Tijuana Panthers | Angie |  |  | [find](https://www.youtube.com/results?search_query=Tijuana%20Panthers%20Angie) |  | 2012-12-16 | `121538141b12351c` |
| `no-source` | Pachanga Boys | Time |  |  | [find](https://www.youtube.com/results?search_query=Pachanga%20Boys%20Time) |  | 2012-12-18 | `64b6afb1138c03e9` |
| `read-qualifier` `no-source` | Chromatics | Into the Black | Neil Young cover |  | [find](https://www.youtube.com/results?search_query=Chromatics%20Into%20the%20Black) |  | 2012-12-19 | `d95b8396b1f07fa1` |
| `ambiguous-credit` `no-source` | Santo & Johnny | Venus |  |  | [find](https://www.youtube.com/results?search_query=Santo%20%26%20Johnny%20Venus) |  | 2012-12-29 | `108e632b277883e5` |
| `no-source` | Pearl Jam | Do The Evolution |  |  | [find](https://www.youtube.com/results?search_query=Pearl%20Jam%20Do%20The%20Evolution) |  | 2012-12-31 | `d071de57799c6a52` |
| `no-source` | Os Mutantes | A Minha Menina |  |  | [find](https://www.youtube.com/results?search_query=Os%20Mutantes%20A%20Minha%20Menina) |  | 2013-01-01 | `763e32b36ada9816` |
| `no-source` | Miles Davis | Ascenseur pour l'Échafaud |  |  | [find](https://www.youtube.com/results?search_query=Miles%20Davis%20Ascenseur%20pour%20l'%C3%89chafaud) |  | 2013-01-02 | `13544a337b2477c7` |
| `ambiguous-credit` | Pusha T ft. Tyler, The Creator | Trouble On My Mind |  |  | [find](https://www.youtube.com/results?search_query=Pusha%20T%20ft.%20Tyler%2C%20The%20Creator%20Trouble%20On%20My%20Mind) |  | 2013-01-04 | `905d10b83f0f677c` |
| `no-source` | Gil Scott-Heron | The Revolution Will Not Be Televised |  |  | [find](https://www.youtube.com/results?search_query=Gil%20Scott-Heron%20The%20Revolution%20Will%20Not%20Be%20Televised) |  | 2013-01-06 | `dc89bee0ad9c43f0` |
| `read-qualifier` `no-source` | Grandmaster Flash | The Message | Live |  | [find](https://www.youtube.com/results?search_query=Grandmaster%20Flash%20The%20Message) |  | 2013-01-08 | `c55ddaf273b8fba9` |
| `no-source` | Joy Division | Digital |  |  | [find](https://www.youtube.com/results?search_query=Joy%20Division%20Digital) |  | 2013-01-11 | `f255edd449f13bcf` |
| `read-qualifier` `ambiguous-credit` | Niki & the Dove | Mother Protect | Goldroom Remix |  | [find](https://www.youtube.com/results?search_query=Niki%20%26%20the%20Dove%20Mother%20Protect) |  | 2013-01-11 | `0e5fe0028f707ee3` |
| `no-source` | Dye | Fantasy |  |  | [find](https://www.youtube.com/results?search_query=Dye%20Fantasy) |  | 2013-01-12 | `087c2445d66964c1` |
| `no-source` | Julee Cruise | The World Spins |  |  | [find](https://www.youtube.com/results?search_query=Julee%20Cruise%20The%20World%20Spins) |  | 2013-01-14 | `969e4b689843dd81` |
| `no-source` | Alaska In Winter | Berlin |  |  | [find](https://www.youtube.com/results?search_query=Alaska%20In%20Winter%20Berlin) |  | 2013-01-20 | `2ce7c5501e231aba` |
| `no-source` | Klangkarussell | Sonnentanz |  |  | [find](https://www.youtube.com/results?search_query=Klangkarussell%20Sonnentanz) |  | 2013-01-24 | `0c0c7dcad0c9cd90` |
| `no-source` | Outkast | Hey Ya |  |  | [find](https://www.youtube.com/results?search_query=Outkast%20Hey%20Ya) |  | 2013-01-25 | `e02a1d75ad53cf39` |
| `read-qualifier` `no-source` | Scrubs | Hey Ya | Outkast cover |  | [find](https://www.youtube.com/results?search_query=Scrubs%20Hey%20Ya) |  | 2013-01-25 | `a54196d1c2d8b2d3` |
| `read-qualifier` | Cocoon | American Boy | Estelle cover |  | [find](https://www.youtube.com/results?search_query=Cocoon%20American%20Boy) |  | 2013-01-25 | `beb0526a39c68649` |
| `ambiguous-credit` | Amadou & Mariam | Sabali |  |  | [find](https://www.youtube.com/results?search_query=Amadou%20%26%20Mariam%20Sabali) |  | 2013-01-25 | `1f6a579befd971f9` |
| `no-source` | Franz Liszt | Hungarian Rhapsody N°2 |  |  | [find](https://www.youtube.com/results?search_query=Franz%20Liszt%20Hungarian%20Rhapsody%20N%C2%B02) |  | 2013-01-29 | `c07a3b5dbe4ecb42` |
| `ambiguous-credit` | Frank Sinatra & Nancy Sinatra | Something Stupid |  |  | [find](https://www.youtube.com/results?search_query=Frank%20Sinatra%20%26%20Nancy%20Sinatra%20Something%20Stupid) |  | 2013-01-30 | `d7c81386a2b7d153` |
| `read-qualifier` | Jan Turkenburg | In My Spaceship | Pilooski remix |  | [find](https://www.youtube.com/results?search_query=Jan%20Turkenburg%20In%20My%20Spaceship) |  | 2013-02-01 | `8a1b4b3669029de8` |
| `read-qualifier` | Slow Club | Never Look Back | Acoustic |  | [find](https://www.youtube.com/results?search_query=Slow%20Club%20Never%20Look%20Back) |  | 2013-02-04 | `63a1ec446a4d907c` |
| `ambiguous-credit` | Macklemore & Ryan Lewis ft. Wanz | Thrift Shop |  |  | [find](https://www.youtube.com/results?search_query=Macklemore%20%26%20Ryan%20Lewis%20ft.%20Wanz%20Thrift%20Shop) |  | 2013-02-05 | `ced7836eacf5b5bc` |
| `no-source` | Air | Empty House |  |  | [find](https://www.youtube.com/results?search_query=Air%20Empty%20House) |  | 2013-02-12 | `dfa66eb14288cdfe` |
| `no-source` | Black Sabbath | Planet Caravan |  |  | [find](https://www.youtube.com/results?search_query=Black%20Sabbath%20Planet%20Caravan) |  | 2013-03-13 | `7e910a9bdbcd85b9` |
| `no-source` | Mr. Fox | Party Track |  |  | [find](https://www.youtube.com/results?search_query=Mr.%20Fox%20Party%20Track) |  | 2013-03-14 | `d547d3b7c75783d3` |
| `no-source` | Reputante | Lock Me Up |  |  | [find](https://www.youtube.com/results?search_query=Reputante%20Lock%20Me%20Up) |  | 2013-03-16 | `f06638872bf502d1` |
| `no-source` | The Painted Ship | Frustration |  |  | [find](https://www.youtube.com/results?search_query=The%20Painted%20Ship%20Frustration) |  | 2013-04-03 | `af7ca0fb54e350c7` |
| `no-source` | Pink Floyd | Echoes |  |  | [find](https://www.youtube.com/results?search_query=Pink%20Floyd%20Echoes) |  | 2013-04-05 | `8f2e5e8eb054a017` |
| `no-source` | The Velvet Underground | Oh! Sweet Nuthin’ |  |  | [find](https://www.youtube.com/results?search_query=The%20Velvet%20Underground%20Oh!%20Sweet%20Nuthin%E2%80%99) |  | 2013-04-05 | `fcf9ae6f89ddffae` |
| `no-source` | Daft Punk | Rock n’ Roll |  |  | [find](https://www.youtube.com/results?search_query=Daft%20Punk%20Rock%20n%E2%80%99%20Roll) |  | 2013-04-19 | `460fe31f36178e23` |
| `read-qualifier` `no-source` `dead-source-in-body` | Maxence Cyrin | D.A.N.C.E | Justice cover |  | [find](https://www.youtube.com/results?search_query=Maxence%20Cyrin%20D.A.N.C.E) | `http://soundowl.com/track/675/maxence-cyrin-dance-justice-cover` | 2013-04-21 | `4338d74a69266c99` |
| `no-source` | Sixto Rodriguez | Crucify Your Mind |  |  | [find](https://www.youtube.com/results?search_query=Sixto%20Rodriguez%20Crucify%20Your%20Mind) |  | 2013-04-25 | `6b314fa595f41a49` |
| `no-source` | Nu | MAN O TO |  |  | [find](https://www.youtube.com/results?search_query=Nu%20MAN%20O%20TO) |  | 2013-04-26 | `bf38acf3585b33f6` |
| `ambiguous-credit` `no-source` | James Brown & B.B. King (ft. Mickael Jackson) | Live at the Roxy, Los Angeles, 1983 |  |  | [find](https://www.youtube.com/results?search_query=James%20Brown%20%26%20B.B.%20King%20(ft.%20Mickael%20Jackson)%20Live%20at%20the%20Roxy%2C%20Los%20Angeles%2C%201983) |  | 2013-06-13 | `4702536528adefc9` |
| `widget-url` | M.O.O.N | Paris |  |  | [find](https://www.youtube.com/results?search_query=M.O.O.N%20Paris) |  | 2013-06-14 | `ccf4463a9852810f` |
| `no-source` | Al Green | Let’s Stay Together |  |  | [find](https://www.youtube.com/results?search_query=Al%20Green%20Let%E2%80%99s%20Stay%20Together) |  | 2013-06-17 | `2148979306071b30` |
| `no-source` | Road Rash II Music | Main Theme |  |  | [find](https://www.youtube.com/results?search_query=Road%20Rash%20II%20Music%20Main%20Theme) |  | 2013-06-17 | `2a6724731f8b7633` |
| `no-source` | Noir Désir | Le Grand Incendie |  |  | [find](https://www.youtube.com/results?search_query=Noir%20D%C3%A9sir%20Le%20Grand%20Incendie) |  | 2013-06-28 | `5ca54f1aaae8d165` |
| `read-qualifier` | Brian Eno | Another Green World | Album, 1975 |  | [find](https://www.youtube.com/results?search_query=Brian%20Eno%20Another%20Green%20World) |  | 2013-07-22 | `7555022afdd296d4` |
| `no-source` | Susan Christie | Rainy Day |  |  | [find](https://www.youtube.com/results?search_query=Susan%20Christie%20Rainy%20Day) |  | 2013-07-22 | `2b5cb6d9e9baf400` |
| `read-qualifier` | J.J. Cale | Cocaine | Live |  | [find](https://www.youtube.com/results?search_query=J.J.%20Cale%20Cocaine) |  | 2013-07-23 | `e8418bf1fd72fd11` |
| `read-qualifier` `no-source` | Streets of Rage | Dilapidated Town | Game OST |  | [find](https://www.youtube.com/results?search_query=Streets%20of%20Rage%20Dilapidated%20Town) |  | 2013-07-26 | `8f4916579556f7a9` |
| `read-qualifier` `ambiguous-credit` | Crosby, Stills & Nash | Cathedral | live |  | [find](https://www.youtube.com/results?search_query=Crosby%2C%20Stills%20%26%20Nash%20Cathedral) | the Madison Square Garden · 1979-9 | 2013-07-29 | `4011b7e6269df718` |
| `no-source` `dead-source-in-body` | Kellylee Evans | Lose Yourself |  |  | [find](https://www.youtube.com/results?search_query=Kellylee%20Evans%20Lose%20Yourself) | `http://grooveshark.com/songWidget.swf` | 2013-08-10 | `139baeb34f6434a4` |
| `no-source` `dead-source-in-body` | Robin Trower | I Believe to my Soul |  |  | [find](https://www.youtube.com/results?search_query=Robin%20Trower%20I%20Believe%20to%20my%20Soul) | `http://grooveshark.com/songWidget.swf` | 2013-09-03 | `d6b61372b79f61c5` |
| `no-source` | Leonard Cohen | Master Song |  |  | [find](https://www.youtube.com/results?search_query=Leonard%20Cohen%20Master%20Song) |  | 2013-09-09 | `8039d19746d75348` |
| `no-source` | Laurie Anderson | O Superman |  |  | [find](https://www.youtube.com/results?search_query=Laurie%20Anderson%20O%20Superman) |  | 2013-09-17 | `a7f1965d57f76fc9` |
| `no-source` | Yasmine Hamdan | Ya Nass |  |  | [find](https://www.youtube.com/results?search_query=Yasmine%20Hamdan%20Ya%20Nass) |  | 2013-09-24 | `8a0ed46b7abb0ed8` |
| `no-source` | Dominik Eulberg | Der Tanz Der Gluehwuermchen |  |  | [find](https://www.youtube.com/results?search_query=Dominik%20Eulberg%20Der%20Tanz%20Der%20Gluehwuermchen) |  | 2013-09-26 | `68743d193606b3f2` |
| `read-qualifier` | Olivier Libaux (ft. Ambrosia Parlsey) | The Blood is Love | Queens of the Stone Age cover |  | [find](https://www.youtube.com/results?search_query=Olivier%20Libaux%20(ft.%20Ambrosia%20Parlsey)%20The%20Blood%20is%20Love) |  | 2013-10-01 | `4e705a1bead7dd3d` |
| `read-qualifier` `no-source` | Karen Dalton | In My Own Time | Album, 1971 |  | [find](https://www.youtube.com/results?search_query=Karen%20Dalton%20In%20My%20Own%20Time) |  | 2013-10-04 | `99dbb5679cb9c405` |
| `widget-url` | Nils Frahm | Says |  |  | [find](https://www.youtube.com/results?search_query=Nils%20Frahm%20Says) |  | 2013-10-14 | `efeb9569407bc5ab` |
| `no-source` | The Tallest Man on Earth | The Gardener |  |  | [find](https://www.youtube.com/results?search_query=The%20Tallest%20Man%20on%20Earth%20The%20Gardener) |  | 2013-10-15 | `eb32420c23aeeabc` |
| `no-source` | Vincent Delerm | Deauville sans Trintignant |  |  | [find](https://www.youtube.com/results?search_query=Vincent%20Delerm%20Deauville%20sans%20Trintignant) |  | 2013-10-28 | `7f152eccb1348eb6` |
| `read-qualifier` | Lou Reed | Sweet Jane | live |  | [find](https://www.youtube.com/results?search_query=Lou%20Reed%20Sweet%20Jane) | St. Ann’s Warehouse, Brooklyn · 2006-12 | 2013-10-31 | `eeb08605a944cc6d` |
| `read-qualifier` `no-source` | Sarah Vaughan | Blackbird | The Beatles cover |  | [find](https://www.youtube.com/results?search_query=Sarah%20Vaughan%20Blackbird) |  | 2013-11-03 | `b73dd6992fcd6423` |
| `read-qualifier` | Barry De Vorzon | Theme from “The Warriors” | The Warriors OST, 1979 |  | [find](https://www.youtube.com/results?search_query=Barry%20De%20Vorzon%20Theme%20from%20%E2%80%9CThe%20Warriors%E2%80%9D) |  | 2013-11-07 | `ef7c02681661f74f` |
| `read-qualifier` `no-source` | Philip Glass | Koyaanisqatsi | Koyaanisqatsi OST, 1982 |  | [find](https://www.youtube.com/results?search_query=Philip%20Glass%20Koyaanisqatsi) |  | 2013-11-08 | `c4823676c0bc481d` |
| `ambiguous-credit` `no-source` | Mike Bloomfield, Al Kooper & Stephen Stills | Stop |  |  | [find](https://www.youtube.com/results?search_query=Mike%20Bloomfield%2C%20Al%20Kooper%20%26%20Stephen%20Stills%20Stop) |  | 2013-12-09 | `c2058288b6556189` |
| `no-source` | The Seatbelts | Gotta Knock a Little Harder |  |  | [find](https://www.youtube.com/results?search_query=The%20Seatbelts%20Gotta%20Knock%20a%20Little%20Harder) |  | 2013-12-15 | `280b88e8e5e9417d` |
| `no-source` | Elliott Smith | Needle in the Hay |  |  | [find](https://www.youtube.com/results?search_query=Elliott%20Smith%20Needle%20in%20the%20Hay) |  | 2014-01-06 | `ca116c56ad707b04` |
| `read-qualifier` | Oy | Doondari | live |  | [find](https://www.youtube.com/results?search_query=Oy%20Doondari) | La Cigale, Paris · 2012-10 | 2014-01-27 | `c75bdbb61a280446` |
| `no-source` | Adriano Celentano | Prisencolinensinainciusol |  |  | [find](https://www.youtube.com/results?search_query=Adriano%20Celentano%20Prisencolinensinainciusol) |  | 2014-03-01 | `326bd14a76dda025` |
| `read-qualifier` | Azealia Banks | 212 | Ft. Lazy Jay |  | [find](https://www.youtube.com/results?search_query=Azealia%20Banks%20212) |  | 2014-03-01 | `7a368ecc3374c094` |
| `widget-url` | David August | Live at the Blue Parrot Club, Mexico, 2014 |  |  | [find](https://www.youtube.com/results?search_query=David%20August%20Live%20at%20the%20Blue%20Parrot%20Club%2C%20Mexico%2C%202014) |  | 2014-03-03 | `724d32fa10a59dbc` |
| `no-source` | Dillinger | Cocaine in my Brain |  |  | [find](https://www.youtube.com/results?search_query=Dillinger%20Cocaine%20in%20my%20Brain) |  | 2014-03-17 | `8ff8baebe91be694` |
| `read-qualifier` | The Velvet Underground | Oh Gin | Demo |  | [find](https://www.youtube.com/results?search_query=The%20Velvet%20Underground%20Oh%20Gin) |  | 2014-03-17 | `15aa153eec3b78c9` |
| `read-qualifier` | Bill Withers | Grandma’s Hands | Live |  | [find](https://www.youtube.com/results?search_query=Bill%20Withers%20Grandma%E2%80%99s%20Hands) |  | 2014-03-17 | `3e8e0c9a9277f7d7` |
| `no-source` | Kiasmos | Looped |  |  | [find](https://www.youtube.com/results?search_query=Kiasmos%20Looped) |  | 2014-04-15 | `5948aea65619c535` |
| `no-source` | Tom Waits | Invitation to the Blues |  |  | [find](https://www.youtube.com/results?search_query=Tom%20Waits%20Invitation%20to%20the%20Blues) |  | 2014-04-17 | `79217c8bc3dba2e1` |
| `no-source` | Cymande | Dove |  |  | [find](https://www.youtube.com/results?search_query=Cymande%20Dove) |  | 2014-04-18 | `0da94c527884eb2a` |
| `read-qualifier` | Klaus Nomi | Cold Song | Live |  | [find](https://www.youtube.com/results?search_query=Klaus%20Nomi%20Cold%20Song) |  | 2014-05-06 | `7bf3bd09716776fc` |
| `read-qualifier` | Seu Jorge | Life on Mars? | David Bowie cover |  | [find](https://www.youtube.com/results?search_query=Seu%20Jorge%20Life%20on%20Mars%3F) |  | 2014-05-07 | `a000e964af634ee8` |
| `no-source` | Weval | Detian |  |  | [find](https://www.youtube.com/results?search_query=Weval%20Detian) |  | 2014-05-26 | `4c11d5318a9f47b7` |
| `read-qualifier` | Emilíana Torrini | Animal Games | live |  | [find](https://www.youtube.com/results?search_query=Emil%C3%ADana%20Torrini%20Animal%20Games) | WFUV, New York · 2013-4 | 2014-06-10 | `2caef2401358386d` |
| `ambiguous-credit` `no-source` | The Flaming Lips & Miley Cyrus | Lucy in the Sky with Diamonds |  |  | [find](https://www.youtube.com/results?search_query=The%20Flaming%20Lips%20%26%20Miley%20Cyrus%20Lucy%20in%20the%20Sky%20with%20Diamonds) |  | 2014-08-04 | `49bf9dbf65cb843e` |
| `no-source` | Kaaris | Bouchon de Liège |  |  | [find](https://www.youtube.com/results?search_query=Kaaris%20Bouchon%20de%20Li%C3%A8ge) |  | 2014-08-10 | `014c40a41b72c4c1` |
| `read-qualifier` `no-source` | eden ahbez | Eden’s Island | Album, 1960 |  | [find](https://www.youtube.com/results?search_query=eden%20ahbez%20Eden%E2%80%99s%20Island) |  | 2014-08-22 | `bcb70bb6365e9d34` |
| `read-qualifier` `ambiguous-credit` | Mister Modo & Ugly Mac Beer | Invasion | Judgement Day remix |  | [find](https://www.youtube.com/results?search_query=Mister%20Modo%20%26%20Ugly%20Mac%20Beer%20Invasion) |  | 2014-09-10 | `b9037e43d2a78538` |
| `read-qualifier` `no-source` | Dualryan | Oceans | The Yawhg soundtrack |  | [find](https://www.youtube.com/results?search_query=Dualryan%20Oceans) |  | 2014-09-15 | `2df19cbf0be9920a` |
| `read-qualifier` | Darkside | Planet Caravan | Black Sabbath cover, live at Boiler Room, NYC, January 2013 |  | [find](https://www.youtube.com/results?search_query=Darkside%20Planet%20Caravan) |  | 2014-09-17 | `f981f01bf86755a6` |
| `no-source` | Jorge Ben | Comanche |  |  | [find](https://www.youtube.com/results?search_query=Jorge%20Ben%20Comanche) |  | 2014-10-10 | `d555d9ab0d01088e` |
| `widget-url` | CSP06 ∆ Nicolas Jaar | Essential Mix |  |  | [find](https://www.youtube.com/results?search_query=CSP06%20%E2%88%86%20Nicolas%20Jaar%20Essential%20Mix) |  | 2014-10-10 | `e035f5106c2ba219` |
| `no-source` | Serge Richard | Jaques Chirac \| Je serai le président de tous les français |  |  | [find](https://www.youtube.com/results?search_query=Serge%20Richard%20Jaques%20Chirac%20%7C%20Je%20serai%20le%20pr%C3%A9sident%20de%20tous%20les%20fran%C3%A7ais) |  | 2014-10-11 | `0566d2cb321b0028` |
| `read-qualifier` | Claudine Longet | Jealous Guy / Don’t Let Me Down | John Lennon / The Beatles cover |  | [find](https://www.youtube.com/results?search_query=Claudine%20Longet%20Jealous%20Guy%20%2F%20Don%E2%80%99t%20Let%20Me%20Down) |  | 2014-10-11 | `eebc36ed87ebb2cf` |
| `no-source` | Charlie Winston | Unlike Me |  |  | [find](https://www.youtube.com/results?search_query=Charlie%20Winston%20Unlike%20Me) |  | 2014-10-12 | `69c2ffbb22176d02` |
| `read-qualifier` `no-source` | Alt-J | Lovely Day | Bill Withers cover |  | [find](https://www.youtube.com/results?search_query=Alt-J%20Lovely%20Day) |  | 2014-10-13 | `819a1b42809c8f2d` |
| `no-source` | Jacques Brel | Marieke |  |  | [find](https://www.youtube.com/results?search_query=Jacques%20Brel%20Marieke) |  | 2014-10-14 | `64855c129db64e48` |
| `no-source` | Mafia K'1 Fry | Pour Ceux |  |  | [find](https://www.youtube.com/results?search_query=Mafia%20K'1%20Fry%20Pour%20Ceux) |  | 2014-11-07 | `726ed66b00117800` |
| `no-source` `dead-source-in-body` | The Octopus Project | Mmaj |  |  | [find](https://www.youtube.com/results?search_query=The%20Octopus%20Project%20Mmaj) | `http://grooveshark.com/songWidget.swf` | 2014-11-19 | `f4ad921c2c4e3d4d` |
| `no-source` | The Spits | Die Die Die |  |  | [find](https://www.youtube.com/results?search_query=The%20Spits%20Die%20Die%20Die) |  | 2014-11-21 | `426d4f19874747a7` |
| `no-source` | Rob | Make it Fast, Make it Slow |  |  | [find](https://www.youtube.com/results?search_query=Rob%20Make%20it%20Fast%2C%20Make%20it%20Slow) |  | 2015-01-13 | `1ade41e91c9d502f` |
| `no-source` | Caribou | Back Home |  |  | [find](https://www.youtube.com/results?search_query=Caribou%20Back%20Home) |  | 2015-01-26 | `97142e7ac15748d5` |
| `no-source` | Dona Dumitru Siminica | De Trei Ani Nu Dau Pe-acasa |  |  | [find](https://www.youtube.com/results?search_query=Dona%20Dumitru%20Siminica%20De%20Trei%20Ani%20Nu%20Dau%20Pe-acasa) |  | 2015-01-28 | `7a70b1bcb032d6e4` |
| `read-qualifier` `no-source` | Talking Heads | Stop Making Sense Live | at the Hollywood’s Pantages Theater, December 1983 |  | [find](https://www.youtube.com/results?search_query=Talking%20Heads%20Stop%20Making%20Sense%20Live) |  | 2015-02-09 | `ba166ad46121488e` |
| `no-source` | Giorgio Murderer | Primitive World |  |  | [find](https://www.youtube.com/results?search_query=Giorgio%20Murderer%20Primitive%20World) |  | 2015-02-16 | `1f6109c2728a32df` |
| `no-source` | Nat King Cole | Tres Palabras |  |  | [find](https://www.youtube.com/results?search_query=Nat%20King%20Cole%20Tres%20Palabras) |  | 2015-02-16 | `1a1b1cbc261e66b5` |
| `no-source` | Nick Drake | Saturday Sun |  |  | [find](https://www.youtube.com/results?search_query=Nick%20Drake%20Saturday%20Sun) |  | 2015-03-19 | `3d798f7430e70d6a` |
| `no-source` | Parquet Courts | These Boots are Made for Walkin’ |  |  | [find](https://www.youtube.com/results?search_query=Parquet%20Courts%20These%20Boots%20are%20Made%20for%20Walkin%E2%80%99) |  | 2015-03-23 | `a9a75e582c5340ba` |
| `read-qualifier` | Radiohead | Reckoner | Live from the Basement, at The Hospital Club, London, May 2008 |  | [find](https://www.youtube.com/results?search_query=Radiohead%20Reckoner) |  | 2015-04-20 | `2378552e70e3a1b1` |
| `read-qualifier` | The Cure | Another Journey by Train | Group home instrumental demo |  | [find](https://www.youtube.com/results?search_query=The%20Cure%20Another%20Journey%20by%20Train) |  | 2015-05-06 | `9966d997e013cbda` |
| `no-source` | Serge Gainsbourg | La Noyée |  |  | [find](https://www.youtube.com/results?search_query=Serge%20Gainsbourg%20La%20Noy%C3%A9e) |  | 2015-07-12 | `788aa840955a574f` |
| `read-qualifier` | Lee Moses | Bad Girl | Parts I & II |  | [find](https://www.youtube.com/results?search_query=Lee%20Moses%20Bad%20Girl) |  | 2015-07-21 | `6ad2e74400b3242d` |
| `no-source` | Jorge Ben | Bebete Vãobora |  |  | [find](https://www.youtube.com/results?search_query=Jorge%20Ben%20Bebete%20V%C3%A3obora) |  | 2015-08-28 | `74f2fd7404a47672` |
| `read-qualifier` `no-source` | Mild High Club | Timeline | Album, 2015 |  | [find](https://www.youtube.com/results?search_query=Mild%20High%20Club%20Timeline) |  | 2015-10-27 | `964728f86d26cf89` |
| `read-qualifier` `ambiguous-credit` | Nick Cave & The Bad Seeds | Higgs Boson Blues | live |  | [find](https://www.youtube.com/results?search_query=Nick%20Cave%20%26%20The%20Bad%20Seeds%20Higgs%20Boson%20Blues) | Austin City Limits · 2014-10 | 2015-11-04 | `d12dd5b397628f1e` |
| `no-source` | John Maus | My Whole World is Coming Apart |  |  | [find](https://www.youtube.com/results?search_query=John%20Maus%20My%20Whole%20World%20is%20Coming%20Apart) |  | 2015-12-04 | `249df31826f374b6` |
| `no-source` | Bass Drum of Death | Velvet Itch |  |  | [find](https://www.youtube.com/results?search_query=Bass%20Drum%20of%20Death%20Velvet%20Itch) |  | 2015-12-07 | `9ec8b8ddc953dc54` |
| `read-qualifier` `no-source` | Kevin Ayers | The Lady Rachel | live |  | [find](https://www.youtube.com/results?search_query=Kevin%20Ayers%20The%20Lady%20Rachel) | John Peel Sessions, BBC 1, London · 1974-7 | 2016-01-06 | `37d9669a71da5415` |
| `no-source` | Rival Consoles | Odyssey / Sonne (Bonus track version, Album, 2015 |  |  | [find](https://www.youtube.com/results?search_query=Rival%20Consoles%20Odyssey%20%2F%20Sonne%20(Bonus%20track%20version%2C%20Album%2C%202015) |  | 2016-01-08 | `ea83ec9e36bfbe6a` |
| `read-qualifier` | M-H-D | Afro Trap | Part. 3 |  | [find](https://www.youtube.com/results?search_query=M-H-D%20Afro%20Trap) |  | 2016-01-19 | `3ff2c0fbfc83ae15` |
| `ambiguous-credit` | Elis Regina & Tom Jobim | Aguas de Março |  |  | [find](https://www.youtube.com/results?search_query=Elis%20Regina%20%26%20Tom%20Jobim%20Aguas%20de%20Mar%C3%A7o) |  | 2016-09-02 | `423ba51e40487b81` |
| `read-qualifier` | Tacocat | Crimson Wave | Live on KEXP, Seattle, 19 September 2014 |  | [find](https://www.youtube.com/results?search_query=Tacocat%20Crimson%20Wave) |  | 2016-09-03 | `28a130706eec3cd7` |
| `read-qualifier` | Nina Simone | Ain’t Got No - I Got Life | Live, London, 1968 |  | [find](https://www.youtube.com/results?search_query=Nina%20Simone%20Ain%E2%80%99t%20Got%20No%20-%20I%20Got%20Life) |  | 2016-09-09 | `b547f900a99cb250` |
| `no-source` | Rita Pavone | Viva la pappa col pomodorro |  |  | [find](https://www.youtube.com/results?search_query=Rita%20Pavone%20Viva%20la%20pappa%20col%20pomodorro) |  | 2016-09-16 | `27a7743cfba92c03` |
| `no-source` | The Soft Boys | You’ll Have To Go Sideways |  |  | [find](https://www.youtube.com/results?search_query=The%20Soft%20Boys%20You%E2%80%99ll%20Have%20To%20Go%20Sideways) |  | 2016-09-23 | `3ea0ad742de234a3` |
| `read-qualifier` | Mary Clark | Take Me I’m Yours | Club 12" Mix |  | [find](https://www.youtube.com/results?search_query=Mary%20Clark%20Take%20Me%20I%E2%80%99m%20Yours) |  | 2016-09-30 | `8eab37824d1d8336` |
| `no-source` | Marijata | I Walk Alone |  |  | [find](https://www.youtube.com/results?search_query=Marijata%20I%20Walk%20Alone) |  | 2016-10-07 | `ac3483892450b598` |
| `no-source` | Jeremy Steig | Howlin’ For Judy |  |  | [find](https://www.youtube.com/results?search_query=Jeremy%20Steig%20Howlin%E2%80%99%20For%20Judy) |  | 2016-10-21 | `fe3a5100c2cdc046` |
| `no-source` | The Normal | Warm Leatherette |  |  | [find](https://www.youtube.com/results?search_query=The%20Normal%20Warm%20Leatherette) |  | 2016-11-25 | `20be5559c2d50a24` |
| `no-source` | Fat White Family | Touch The Leather |  |  | [find](https://www.youtube.com/results?search_query=Fat%20White%20Family%20Touch%20The%20Leather) |  | 2016-11-25 | `84a338995933e188` |
| `no-source` | The Jim Carroll Band | People Who Died |  |  | [find](https://www.youtube.com/results?search_query=The%20Jim%20Carroll%20Band%20People%20Who%20Died) |  | 2017-04-18 | `17975cb5564435c5` |
| `no-source` | Velvet Underground | Cool It Down |  |  | [find](https://www.youtube.com/results?search_query=Velvet%20Underground%20Cool%20It%20Down) |  | 2017-04-22 | `25eaae5619c40e39` |
| `widget-url` | Average Rap Band | El Sol Reprise |  |  | [find](https://www.youtube.com/results?search_query=Average%20Rap%20Band%20El%20Sol%20Reprise) |  | 2017-04-23 | `eb39ec3e282c9e9e` |
| `no-source` | Louise Bourgeois | Otte |  |  | [find](https://www.youtube.com/results?search_query=Louise%20Bourgeois%20Otte) |  | 2017-04-27 | `17e62d752387e950` |
| `no-source` | Reykjavíkurdætur | Hæpið |  |  | [find](https://www.youtube.com/results?search_query=Reykjav%C3%ADkurd%C3%A6tur%20H%C3%A6pi%C3%B0) |  | 2017-04-28 | `135d9afd259630f6` |
| `no-source` | Odetta | Gallows Pole |  |  | [find](https://www.youtube.com/results?search_query=Odetta%20Gallows%20Pole) |  | 2017-04-30 | `76f3dd4fc28956fa` |
| `read-qualifier` | Giuseppe Verdi | Va, Pensiero | Nabucco |  | [find](https://www.youtube.com/results?search_query=Giuseppe%20Verdi%20Va%2C%20Pensiero) |  | 2017-05-02 | `04bbb770ef9b584d` |
| `no-source` | The Melodians | The Rivers of Babylon |  |  | [find](https://www.youtube.com/results?search_query=The%20Melodians%20The%20Rivers%20of%20Babylon) |  | 2017-05-04 | `8b337715d0d15974` |
| `no-source` | Christine Laume | Rouge rouge |  |  | [find](https://www.youtube.com/results?search_query=Christine%20Laume%20Rouge%20rouge) |  | 2017-05-11 | `e1cce9830392091a` |
| `ambiguous-credit` `no-source` | Brigitte Fontaine, The Art Ensemble of Chicago & Areski Belkacem | Comme à la radio |  |  | [find](https://www.youtube.com/results?search_query=Brigitte%20Fontaine%2C%20The%20Art%20Ensemble%20of%20Chicago%20%26%20Areski%20Belkacem%20Comme%20%C3%A0%20la%20radio) |  | 2017-05-12 | `ae6069064c8663b1` |
| `read-qualifier` `widget-url` | Janice McClain | Giving My Love | Chevals remix |  | [find](https://www.youtube.com/results?search_query=Janice%20McClain%20Giving%20My%20Love) |  | 2017-05-17 | `63fa33ab61c14a03` |
| `no-source` | Cymande | Brothers On The Slide |  |  | [find](https://www.youtube.com/results?search_query=Cymande%20Brothers%20On%20The%20Slide) |  | 2017-05-21 | `4a4a3e70f01f5a9a` |
| `read-qualifier` | J.J. Cale | Bringin’ it Back | live |  | [find](https://www.youtube.com/results?search_query=J.J.%20Cale%20Bringin%E2%80%99%20it%20Back) | Ebbets Fields · 1975 | 2017-05-22 | `9b9349f3c7ceae47` |
| `widget-url` | Vanishing Twins | Eggs |  |  | [find](https://www.youtube.com/results?search_query=Vanishing%20Twins%20Eggs) |  | 2017-05-28 | `141319893aaa4127` |
| `read-qualifier` | Tom Waits | Please wake me up | demo |  | [find](https://www.youtube.com/results?search_query=Tom%20Waits%20Please%20wake%20me%20up) |  | 2017-05-31 | `5ae67737be63027d` |
| `read-qualifier` | Richard O’Brien | Science Fiction / Double Feature | reprise |  | [find](https://www.youtube.com/results?search_query=Richard%20O%E2%80%99Brien%20Science%20Fiction%20%2F%20Double%20Feature) |  | 2017-06-03 | `7d1e3150cd3cb553` |
| `read-qualifier` | Courtney Barnett | Pedestrian at Best | live |  | [find](https://www.youtube.com/results?search_query=Courtney%20Barnett%20Pedestrian%20at%20Best) | The Triple Door, Seattle · 2014-7-7 | 2017-06-06 | `04b45ef21cc8b323` |
| `no-source` | Charanjit Singh | Raga Madhuvanti |  |  | [find](https://www.youtube.com/results?search_query=Charanjit%20Singh%20Raga%20Madhuvanti) |  | 2017-06-11 | `6224762d60983922` |
| `read-qualifier` | Ancient Methods | DJ Set | live |  | [find](https://www.youtube.com/results?search_query=Ancient%20Methods%20DJ%20Set) | Boiler Room, Berlin · 2015-2-15 | 2017-06-12 | `3b5b27762d93e544` |
| `no-source` | Taxi Girl | Cherchez le garçon |  |  | [find](https://www.youtube.com/results?search_query=Taxi%20Girl%20Cherchez%20le%20gar%C3%A7on) |  | 2018-02-03 | `743c9850fe7045b2` |
| `ambiguous-credit` | Polo & Pan | Dragon Pom Z |  |  | [find](https://www.youtube.com/results?search_query=Polo%20%26%20Pan%20Dragon%20Pom%20Z) |  | 2018-02-03 | `448ffd3271df9fe0` |
| `unsplit-title` | Unknown |  |  |  | [find](https://www.youtube.com/results?search_query=%20) |  | 2018-02-03 | `4fd31993e19e285a` |
| `no-source` | Katerine | Je vous emmerde |  |  | [find](https://www.youtube.com/results?search_query=Katerine%20Je%20vous%20emmerde) |  | 2018-02-03 | `bc7cd21af3394579` |
| `ambiguous-credit` | Murcof & Vanessa Wagner | Gnossienne No. 3 |  |  | [find](https://www.youtube.com/results?search_query=Murcof%20%26%20Vanessa%20Wagner%20Gnossienne%20No.%203) |  | 2019-01-31 | `bc4ce7db5ed23adb` |
|  | J.J. Cale | I’m a Gypsy Man |  |  | [find](https://www.youtube.com/results?search_query=J.J.%20Cale%20I%E2%80%99m%20a%20Gypsy%20Man) |  | 2012-12-15 | `248893ca966c6dd9` |
|  | The Knife | Heartbeats |  |  | [find](https://www.youtube.com/results?search_query=The%20Knife%20Heartbeats) |  | 2012-12-15 | `c08e610b91e31b13` |
|  | Calexico | Glowing Heart of the World |  |  | [find](https://www.youtube.com/results?search_query=Calexico%20Glowing%20Heart%20of%20the%20World) |  | 2012-12-15 | `3f037708f3fe8373` |
|  | Fats Domino | Blueberry Hill |  |  | [find](https://www.youtube.com/results?search_query=Fats%20Domino%20Blueberry%20Hill) |  | 2012-12-16 | `45e9a9dcd0183f28` |
|  | Connan Mockasin | Hey Chocolate |  |  | [find](https://www.youtube.com/results?search_query=Connan%20Mockasin%20Hey%20Chocolate) |  | 2012-12-16 | `c1368c8ab70c6083` |
|  | Portishead | Western Eyes |  |  | [find](https://www.youtube.com/results?search_query=Portishead%20Western%20Eyes) |  | 2012-12-16 | `b7590c58e3e163ec` |
|  | The Flamin’ Groovies | Laurie Did It |  |  | [find](https://www.youtube.com/results?search_query=The%20Flamin%E2%80%99%20Groovies%20Laurie%20Did%20It) |  | 2012-12-16 | `632d8737997d8376` |
|  | The West Coast Pop Art Experimental Band | If You Want This Love |  |  | [find](https://www.youtube.com/results?search_query=The%20West%20Coast%20Pop%20Art%20Experimental%20Band%20If%20You%20Want%20This%20Love) |  | 2012-12-16 | `88c5d2802c48bd41` |
|  | Austra | Beat and the Pulse |  |  | [find](https://www.youtube.com/results?search_query=Austra%20Beat%20and%20the%20Pulse) |  | 2012-12-16 | `c7cf0ab10e8a363d` |
|  | Grimes | Vanessa |  |  | [find](https://www.youtube.com/results?search_query=Grimes%20Vanessa) |  | 2012-12-16 | `865899afe05a829f` |
|  | Austra | Lose It |  |  | [find](https://www.youtube.com/results?search_query=Austra%20Lose%20It) |  | 2012-12-16 | `11a63eb0b5069fee` |
|  | King Tuff | Sun Medallion |  |  | [find](https://www.youtube.com/results?search_query=King%20Tuff%20Sun%20Medallion) |  | 2012-12-16 | `310aab954b0bb6b8` |
|  | New Order | Blue Monday |  |  | [find](https://www.youtube.com/results?search_query=New%20Order%20Blue%20Monday) |  | 2012-12-16 | `c3c2f5d0556b2d02` |
|  | The Cure | A Forest |  |  | [find](https://www.youtube.com/results?search_query=The%20Cure%20A%20Forest) |  | 2012-12-16 | `52605d6051dd53d9` |
|  | Planetary Assault Systems | Rip The Cut |  |  | [find](https://www.youtube.com/results?search_query=Planetary%20Assault%20Systems%20Rip%20The%20Cut) |  | 2012-12-16 | `d18bf26a22da186a` |
|  | Claude Debussy | Arabesque N°1 |  |  | [find](https://www.youtube.com/results?search_query=Claude%20Debussy%20Arabesque%20N%C2%B01) |  | 2012-12-16 | `469049e40baf0838` |
|  | Nujabes | アホな走り集 |  |  | [find](https://www.youtube.com/results?search_query=Nujabes%20%E3%82%A2%E3%83%9B%E3%81%AA%E8%B5%B0%E3%82%8A%E9%9B%86) |  | 2012-12-16 | `08ceb7ec5cc9e313` |
|  | Creedence Clearwater Revival | i Put a Spell On You |  |  | [find](https://www.youtube.com/results?search_query=Creedence%20Clearwater%20Revival%20i%20Put%20a%20Spell%20On%20You) |  | 2012-12-16 | `e2400da1572054d1` |
|  | Rone | Bye Bye Macadam |  |  | [find](https://www.youtube.com/results?search_query=Rone%20Bye%20Bye%20Macadam) |  | 2012-12-16 | `db584f158e14a2cb` |
|  | La Femme | Sur La Planche |  |  | [find](https://www.youtube.com/results?search_query=La%20Femme%20Sur%20La%20Planche) |  | 2012-12-16 | `15601ae637fe049f` |
|  | Simian Mobile Disco | Sleep Deprivation |  |  | [find](https://www.youtube.com/results?search_query=Simian%20Mobile%20Disco%20Sleep%20Deprivation) |  | 2012-12-18 | `70efb89d5916850c` |
|  | Acid Washed | General Motors, Detroit, America |  |  | [find](https://www.youtube.com/results?search_query=Acid%20Washed%20General%20Motors%2C%20Detroit%2C%20America) |  | 2012-12-19 | `e68b693a0d4cdc8b` |
|  | Beach House | Irene |  |  | [find](https://www.youtube.com/results?search_query=Beach%20House%20Irene) |  | 2012-12-19 | `a58782db504a4507` |
|  | Salem | King Night |  |  | [find](https://www.youtube.com/results?search_query=Salem%20King%20Night) |  | 2012-12-31 | `8a5eb76bfb869d56` |
|  | Chicken Shack | I’d Rather go Blind |  |  | [find](https://www.youtube.com/results?search_query=Chicken%20Shack%20I%E2%80%99d%20Rather%20go%20Blind) |  | 2013-01-02 | `c93f4879fe5e5cf3` |
|  | Galaxie 500 | King of Spain |  |  | [find](https://www.youtube.com/results?search_query=Galaxie%20500%20King%20of%20Spain) |  | 2013-01-02 | `f2477da3425858c7` |
|  | The Sixth Nation | Before the Snow Falls |  |  | [find](https://www.youtube.com/results?search_query=The%20Sixth%20Nation%20Before%20the%20Snow%20Falls) |  | 2013-01-03 | `5f9c9ae800a682ec` |
|  | Ernie Graham | For a Little While |  |  | [find](https://www.youtube.com/results?search_query=Ernie%20Graham%20For%20a%20Little%20While) |  | 2013-01-03 | `d17afe178e7ef490` |
|  | Stupeflip | La Menuiserie |  |  | [find](https://www.youtube.com/results?search_query=Stupeflip%20La%20Menuiserie) |  | 2013-01-08 | `97dd9243d22c17fc` |
|  | Todd Terje | Inspector Norse |  |  | [find](https://www.youtube.com/results?search_query=Todd%20Terje%20Inspector%20Norse) |  | 2013-01-10 | `c34f2ba44039b181` |
|  | Swiss | Bubble Bath |  |  | [find](https://www.youtube.com/results?search_query=Swiss%20Bubble%20Bath) |  | 2013-01-10 | `bd9f8d5ec526dad0` |
|  | No doubt | Don’t Speak |  |  | [find](https://www.youtube.com/results?search_query=No%20doubt%20Don%E2%80%99t%20Speak) |  | 2013-01-11 | `e525c39b436ce758` |
|  | Planningtorock | Doorway |  |  | [find](https://www.youtube.com/results?search_query=Planningtorock%20Doorway) |  | 2013-01-11 | `124d2b15cb62129d` |
|  | Lorn | “Ghosst(s)” |  |  | [find](https://www.youtube.com/results?search_query=Lorn%20%E2%80%9CGhosst(s)%E2%80%9D) |  | 2013-01-11 | `c862de7278d98fd5` |
|  | Lou Reed | Perfect Day |  |  | [find](https://www.youtube.com/results?search_query=Lou%20Reed%20Perfect%20Day) |  | 2013-01-21 | `fd754c7f199ad51c` |
|  | Mick Harvey | Out Of Time Man |  |  | [find](https://www.youtube.com/results?search_query=Mick%20Harvey%20Out%20Of%20Time%20Man) |  | 2013-01-22 | `95ff67650b9d5901` |
|  | Sebastien Tellier | L'Amour et La Violence |  |  | [find](https://www.youtube.com/results?search_query=Sebastien%20Tellier%20L'Amour%20et%20La%20Violence) |  | 2013-01-24 | `26c7e16eb5265bc8` |
|  | Arzachel | Queen St. Gang |  |  | [find](https://www.youtube.com/results?search_query=Arzachel%20Queen%20St.%20Gang) |  | 2013-01-24 | `3a313755294b8a75` |
|  | Estelle ft. Kanye West | American Boy |  |  | [find](https://www.youtube.com/results?search_query=Estelle%20ft.%20Kanye%20West%20American%20Boy) |  | 2013-01-25 | `dde647acaaa5567a` |
|  | Amon Tobin | Slowly |  |  | [find](https://www.youtube.com/results?search_query=Amon%20Tobin%20Slowly) |  | 2013-01-27 | `bd3c3b04837bfbed` |
|  | Aphex Twin | Window Licker |  |  | [find](https://www.youtube.com/results?search_query=Aphex%20Twin%20Window%20Licker) |  | 2013-01-27 | `1af348b7738c5f92` |
|  | Jurassic 5 | What’s Golden |  |  | [find](https://www.youtube.com/results?search_query=Jurassic%205%20What%E2%80%99s%20Golden) |  | 2013-01-29 | `328f5c4643943965` |
|  | Cypress Hill | Hits From The Bong |  |  | [find](https://www.youtube.com/results?search_query=Cypress%20Hill%20Hits%20From%20The%20Bong) |  | 2013-01-29 | `a4b70d7a4d8ea259` |
|  | Mazzy Star | Into Dust |  |  | [find](https://www.youtube.com/results?search_query=Mazzy%20Star%20Into%20Dust) |  | 2013-02-12 | `b11c65b0cabd0f76` |
|  | The Chemical Brothers | Asleep From Day |  |  | [find](https://www.youtube.com/results?search_query=The%20Chemical%20Brothers%20Asleep%20From%20Day) |  | 2013-02-12 | `d2cac5613bf4b7a5` |
|  | Link Wray | Rumble |  |  | [find](https://www.youtube.com/results?search_query=Link%20Wray%20Rumble) |  | 2013-02-12 | `e52d854854046cb7` |
|  | The Libertines | Music When The Lights Go Out |  |  | [find](https://www.youtube.com/results?search_query=The%20Libertines%20Music%20When%20The%20Lights%20Go%20Out) |  | 2013-02-18 | `3636460e27ee13ba` |
|  | The Stone Roses | Tightrope |  |  | [find](https://www.youtube.com/results?search_query=The%20Stone%20Roses%20Tightrope) |  | 2013-02-19 | `06bdde32d066bb0d` |
|  | Cat Stevens | The First Cut Is the Deepest |  |  | [find](https://www.youtube.com/results?search_query=Cat%20Stevens%20The%20First%20Cut%20Is%20the%20Deepest) |  | 2013-02-27 | `811bafb1ff0e5f32` |
|  | The Whitest Boy Alive | Done With You |  |  | [find](https://www.youtube.com/results?search_query=The%20Whitest%20Boy%20Alive%20Done%20With%20You) |  | 2013-03-13 | `4be0dd4c27038c11` |
|  | Pink Floyd | Fearless |  |  | [find](https://www.youtube.com/results?search_query=Pink%20Floyd%20Fearless) |  | 2013-04-21 | `baa9cf068d11f6a6` |
|  | Lou Reed | The Gun |  |  | [find](https://www.youtube.com/results?search_query=Lou%20Reed%20The%20Gun) |  | 2013-04-21 | `8a2781e880eed643` |
|  | The Notorious B.I.G. | Juicy |  |  | [find](https://www.youtube.com/results?search_query=The%20Notorious%20B.I.G.%20Juicy) |  | 2013-04-26 | `44eccb03e82798f3` |
|  | The Limiñanas | Je ne suis pas très drogue |  |  | [find](https://www.youtube.com/results?search_query=The%20Limi%C3%B1anas%20Je%20ne%20suis%20pas%20tr%C3%A8s%20drogue) |  | 2013-04-29 | `aa37b77b2d55d7e1` |
|  | TOYS | Noise |  |  | [find](https://www.youtube.com/results?search_query=TOYS%20Noise) |  | 2013-05-03 | `31a0d7436a0decc0` |
|  | Canned Heat | Time Was |  |  | [find](https://www.youtube.com/results?search_query=Canned%20Heat%20Time%20Was) |  | 2013-05-08 | `cc2a5fda9ccb77f4` |
|  | Waldeck | Midsummer Night Blues |  |  | [find](https://www.youtube.com/results?search_query=Waldeck%20Midsummer%20Night%20Blues) |  | 2013-05-16 | `68938cc476a93621` |
|  | Goldfrapp | Horse Tears |  |  | [find](https://www.youtube.com/results?search_query=Goldfrapp%20Horse%20Tears) |  | 2013-05-18 | `c6ad9f76fdd404aa` |
|  | Tristesse Contemporaine | Waiting |  |  | [find](https://www.youtube.com/results?search_query=Tristesse%20Contemporaine%20Waiting) |  | 2013-05-19 | `68f2ad47dd7da841` |
|  | The Stranglers | Always The Sun |  |  | [find](https://www.youtube.com/results?search_query=The%20Stranglers%20Always%20The%20Sun) |  | 2013-05-19 | `b88f976921f15f81` |
|  | Massive Attack | Live With Me |  |  | [find](https://www.youtube.com/results?search_query=Massive%20Attack%20Live%20With%20Me) |  | 2013-05-23 | `629d2aa076006cda` |
|  | Seize / Neuf | Pop Morte |  |  | [find](https://www.youtube.com/results?search_query=Seize%20%2F%20Neuf%20Pop%20Morte) |  | 2013-06-13 | `560a63f73a4f9139` |
|  | Brian Jonestown Massacre | Anemone |  |  | [find](https://www.youtube.com/results?search_query=Brian%20Jonestown%20Massacre%20Anemone) |  | 2013-06-13 | `e936f3ff2e10f560` |
|  | WhoMadeWho | Two Feet Off Ground |  |  | [find](https://www.youtube.com/results?search_query=WhoMadeWho%20Two%20Feet%20Off%20Ground) |  | 2013-06-13 | `1028ecf0f4c032d1` |
|  | Timber Timbre | We’ll Find Out |  |  | [find](https://www.youtube.com/results?search_query=Timber%20Timbre%20We%E2%80%99ll%20Find%20Out) |  | 2013-06-15 | `cb9827adcf3d7c92` |
|  | Feathers | Land of the Innocent |  |  | [find](https://www.youtube.com/results?search_query=Feathers%20Land%20of%20the%20Innocent) |  | 2013-06-17 | `77ae4f5382e58940` |
|  | The Sheltones | Blue Castaway |  |  | [find](https://www.youtube.com/results?search_query=The%20Sheltones%20Blue%20Castaway) |  | 2013-06-20 | `908f432e9d7696d4` |
|  | Roxy Music | Avalon |  |  | [find](https://www.youtube.com/results?search_query=Roxy%20Music%20Avalon) |  | 2013-06-26 | `86ece2fac4715888` |
|  | Mamie Van Doren | Go Go Calypso |  |  | [find](https://www.youtube.com/results?search_query=Mamie%20Van%20Doren%20Go%20Go%20Calypso) |  | 2013-06-29 | `447e3592cf6e643c` |
|  | Jon Hopkins | Open Eye Signal |  |  | [find](https://www.youtube.com/results?search_query=Jon%20Hopkins%20Open%20Eye%20Signal) |  | 2013-06-29 | `fccf00fd97453786` |
|  | Manu Dibango | Soul Makossa |  |  | [find](https://www.youtube.com/results?search_query=Manu%20Dibango%20Soul%20Makossa) |  | 2013-06-30 | `d6c6617de87b0429` |
|  | The Clean | Anything Could Happen |  |  | [find](https://www.youtube.com/results?search_query=The%20Clean%20Anything%20Could%20Happen) |  | 2013-07-18 | `40556739c64f3aff` |
|  | Tarwater | Water Sample |  |  | [find](https://www.youtube.com/results?search_query=Tarwater%20Water%20Sample) |  | 2013-08-06 | `8cd85befa7d447b9` |
|  | David Bowie | I’m Deranged |  |  | [find](https://www.youtube.com/results?search_query=David%20Bowie%20I%E2%80%99m%20Deranged) |  | 2013-08-23 | `f20590b4e922d032` |
|  | Connan Mockasin | I’m the Man, That Will Find You |  |  | [find](https://www.youtube.com/results?search_query=Connan%20Mockasin%20I%E2%80%99m%20the%20Man%2C%20That%20Will%20Find%20You) |  | 2013-10-03 | `40759b78464b8e0e` |
|  | Renaud | La chanson du loubard |  |  | [find](https://www.youtube.com/results?search_query=Renaud%20La%20chanson%20du%20loubard) |  | 2013-10-28 | `10df5d1c15cb44ba` |
|  | Fever Ray | Keep the Streets Empty for Me |  |  | [find](https://www.youtube.com/results?search_query=Fever%20Ray%20Keep%20the%20Streets%20Empty%20for%20Me) |  | 2013-10-31 | `caebcfdf10c9ba28` |
|  | Devendra Banhart | Cripple Crow |  |  | [find](https://www.youtube.com/results?search_query=Devendra%20Banhart%20Cripple%20Crow) |  | 2013-10-31 | `1f75debeb75125e6` |
|  | Lou Reed | Goodnight Ladies |  |  | [find](https://www.youtube.com/results?search_query=Lou%20Reed%20Goodnight%20Ladies) |  | 2013-10-31 | `dd85dbcd0e64ddb3` |
|  | Funkadelic | Maggot Brain |  |  | [find](https://www.youtube.com/results?search_query=Funkadelic%20Maggot%20Brain) |  | 2013-11-04 | `b88982f5c9409edc` |
|  | Depth Affect | Draft Battle |  |  | [find](https://www.youtube.com/results?search_query=Depth%20Affect%20Draft%20Battle) |  | 2013-11-18 | `7d2030edc59745c3` |
|  | Gesaffelstein | Pursuit |  |  | [find](https://www.youtube.com/results?search_query=Gesaffelstein%20Pursuit) |  | 2013-12-03 | `cf8522c9773398e9` |
|  | J.J. Cale ft. Leon Russell | Live at the Paradise Studios, LA, 1979 |  |  | [find](https://www.youtube.com/results?search_query=J.J.%20Cale%20ft.%20Leon%20Russell%20Live%20at%20the%20Paradise%20Studios%2C%20LA%2C%201979) |  | 2013-12-28 | `7be491ba8c03e133` |
|  | Oddjob | The Good, the Bad & the Ugly |  |  | [find](https://www.youtube.com/results?search_query=Oddjob%20The%20Good%2C%20the%20Bad%20%26%20the%20Ugly) |  | 2014-01-06 | `700834625960e649` |
|  | Charles Trenet | Verlaine |  |  | [find](https://www.youtube.com/results?search_query=Charles%20Trenet%20Verlaine) |  | 2014-01-07 | `6954c4a605636471` |
|  | Aretha Franklin | Unforgettable |  |  | [find](https://www.youtube.com/results?search_query=Aretha%20Franklin%20Unforgettable) |  | 2014-01-15 | `4d84e27b7b653f46` |
|  | Zero 7 | Truth & Rights |  |  | [find](https://www.youtube.com/results?search_query=Zero%207%20Truth%20%26%20Rights) |  | 2014-01-15 | `811cf6f3326d03bc` |
|  | Bobbie Gentry | Ode to Billie Joe |  |  | [find](https://www.youtube.com/results?search_query=Bobbie%20Gentry%20Ode%20to%20Billie%20Joe) |  | 2014-01-30 | `f687e7a14bd1111f` |
|  | In a Manner of Speaking | Nouvelle Vague |  |  | [find](https://www.youtube.com/results?search_query=In%20a%20Manner%20of%20Speaking%20Nouvelle%20Vague) |  | 2014-03-01 | `283b660235cc30bf` |
|  | Bruce Springsteen | State Trooper |  |  | [find](https://www.youtube.com/results?search_query=Bruce%20Springsteen%20State%20Trooper) |  | 2014-03-17 | `d183f2aa2289c938` |
|  | Jacuzzi Boys | Double Vision |  |  | [find](https://www.youtube.com/results?search_query=Jacuzzi%20Boys%20Double%20Vision) |  | 2014-03-17 | `98f6c67a85df59f2` |
|  | Alela Diane | Pigeon Song |  |  | [find](https://www.youtube.com/results?search_query=Alela%20Diane%20Pigeon%20Song) |  | 2014-03-17 | `f5bdd42c9e2c812e` |
|  | The Limiñanas | Votre côté yéyé m'emmerde |  |  | [find](https://www.youtube.com/results?search_query=The%20Limi%C3%B1anas%20Votre%20c%C3%B4t%C3%A9%20y%C3%A9y%C3%A9%20m'emmerde) |  | 2014-03-17 | `d4cf649ffb86be1c` |
|  | The Tornadoes | Bustin’ Surfboards |  |  | [find](https://www.youtube.com/results?search_query=The%20Tornadoes%20Bustin%E2%80%99%20Surfboards) |  | 2014-03-17 | `e82d3d0effc66ce2` |
|  | Barbara | Du bout des lèvres |  |  | [find](https://www.youtube.com/results?search_query=Barbara%20Du%20bout%20des%20l%C3%A8vres) |  | 2014-03-23 | `4239d74dff3f345a` |
|  | Richard Hawley | You Haunt Me |  |  | [find](https://www.youtube.com/results?search_query=Richard%20Hawley%20You%20Haunt%20Me) |  | 2014-04-03 | `b2e3c038cbe23687` |
|  | Burning Hearts | Into the Wilderness |  |  | [find](https://www.youtube.com/results?search_query=Burning%20Hearts%20Into%20the%20Wilderness) |  | 2014-04-03 | `3d9154d49df27ddf` |
|  | Mike Snow | Vase |  |  | [find](https://www.youtube.com/results?search_query=Mike%20Snow%20Vase) |  | 2014-04-03 | `5cd4c87fa9a4ac64` |
|  | Limousine | Yodh Song |  |  | [find](https://www.youtube.com/results?search_query=Limousine%20Yodh%20Song) |  | 2014-04-03 | `ba80e364b91ca417` |
|  | Twilight Hotel | Ham Radio Blues |  |  | [find](https://www.youtube.com/results?search_query=Twilight%20Hotel%20Ham%20Radio%20Blues) |  | 2014-04-03 | `400ff3f4df303616` |
|  | Frank Sinatra | That’s Life |  |  | [find](https://www.youtube.com/results?search_query=Frank%20Sinatra%20That%E2%80%99s%20Life) |  | 2014-04-19 | `1b45127451c14130` |
|  | Portugal. The Man | Modern Jesus |  |  | [find](https://www.youtube.com/results?search_query=Portugal.%20The%20Man%20Modern%20Jesus) |  | 2014-04-28 | `e64858632b0eebf6` |
|  | Sigur Rós | Svefn-g-englar |  |  | [find](https://www.youtube.com/results?search_query=Sigur%20R%C3%B3s%20Svefn-g-englar) |  | 2014-06-01 | `9979a10a8c05f4af` |
|  | Jimi Tenor | Can’t Stay With You Baby |  |  | [find](https://www.youtube.com/results?search_query=Jimi%20Tenor%20Can%E2%80%99t%20Stay%20With%20You%20Baby) |  | 2014-06-03 | `d5f23cfb0fd486b0` |
|  | Natural Child | D.T.V |  |  | [find](https://www.youtube.com/results?search_query=Natural%20Child%20D.T.V) |  | 2014-06-12 | `a816a1ebad84a429` |
|  | Jagwar Ma | The Throw |  |  | [find](https://www.youtube.com/results?search_query=Jagwar%20Ma%20The%20Throw) |  | 2014-06-12 | `7be4e504add9e758` |
|  | Baxter Dury | Claire |  |  | [find](https://www.youtube.com/results?search_query=Baxter%20Dury%20Claire) |  | 2014-06-13 | `727f641370c24f5c` |
|  | Patrick Watson | Adventures In Your Own Backyard |  |  | [find](https://www.youtube.com/results?search_query=Patrick%20Watson%20Adventures%20In%20Your%20Own%20Backyard) |  | 2014-07-12 | `90b3651eb062fe5c` |
|  | Belle and Sebastian | Sleep the Clock Around |  |  | [find](https://www.youtube.com/results?search_query=Belle%20and%20Sebastian%20Sleep%20the%20Clock%20Around) |  | 2014-07-14 | `f9809d14c06ddb24` |
|  | Duran Duran | The Chauffeur |  |  | [find](https://www.youtube.com/results?search_query=Duran%20Duran%20The%20Chauffeur) |  | 2014-07-21 | `ff5e8cc726ca6714` |
|  | Youth Lagoon | Pelican Man |  |  | [find](https://www.youtube.com/results?search_query=Youth%20Lagoon%20Pelican%20Man) |  | 2014-07-24 | `6c47b686074bb14d` |
|  | Francis Bebey | Agatha |  |  | [find](https://www.youtube.com/results?search_query=Francis%20Bebey%20Agatha) |  | 2014-07-25 | `dd42d08f55f72dd1` |
|  | The Knife | Rock Classics |  |  | [find](https://www.youtube.com/results?search_query=The%20Knife%20Rock%20Classics) |  | 2014-08-04 | `9a84399aea9794b7` |
|  | Feist | Inside and Out |  |  | [find](https://www.youtube.com/results?search_query=Feist%20Inside%20and%20Out) |  | 2014-08-10 | `77229f1e7deea5b4` |
|  | Wau y Los Arrrghs !!! | Demolición |  |  | [find](https://www.youtube.com/results?search_query=Wau%20y%20Los%20Arrrghs%20!!!%20Demolici%C3%B3n) |  | 2014-08-10 | `b1609dc2c6bd8b6b` |
|  | Air | Le Soleil est près de moi |  |  | [find](https://www.youtube.com/results?search_query=Air%20Le%20Soleil%20est%20pr%C3%A8s%20de%20moi) |  | 2014-09-09 | `acaaa11888da0c9d` |
|  | Yo La Tengo | Everyday |  |  | [find](https://www.youtube.com/results?search_query=Yo%20La%20Tengo%20Everyday) |  | 2014-09-12 | `39370677f3631e59` |
|  | Michele Pertusi | O sole mio |  |  | [find](https://www.youtube.com/results?search_query=Michele%20Pertusi%20O%20sole%20mio) |  | 2014-09-17 | `e08315b7c7ef2aa0` |
|  | Swans | Jim |  |  | [find](https://www.youtube.com/results?search_query=Swans%20Jim) |  | 2014-10-12 | `659cc6904028b814` |
|  | Nat King Cole | Nature Boy |  |  | [find](https://www.youtube.com/results?search_query=Nat%20King%20Cole%20Nature%20Boy) |  | 2014-10-13 | `ec058fcf87db53d7` |
|  | Françoiz Breut | BXL Bleuette |  |  | [find](https://www.youtube.com/results?search_query=Fran%C3%A7oiz%20Breut%20BXL%20Bleuette) |  | 2014-11-11 | `3762b32a62c944c2` |
|  | Kid Francescoli | Does She? |  |  | [find](https://www.youtube.com/results?search_query=Kid%20Francescoli%20Does%20She%3F) |  | 2014-11-13 | `a58fe833715819b7` |
|  | The Whitest Boy Alive | Rollercoaster Ride |  |  | [find](https://www.youtube.com/results?search_query=The%20Whitest%20Boy%20Alive%20Rollercoaster%20Ride) |  | 2014-11-20 | `7fa5542e1bca2501` |
|  | First computer to sing Daisy Bell | Daisy Bell |  |  | [find](https://www.youtube.com/results?search_query=First%20computer%20to%20sing%20Daisy%20Bell%20Daisy%20Bell) |  | 2014-11-21 | `9abb15c85553bdb1` |
|  | Gil Scott-Heron | Gun |  |  | [find](https://www.youtube.com/results?search_query=Gil%20Scott-Heron%20Gun) |  | 2015-01-08 | `5f4a927b85b00154` |
|  | The War on Drugs | Red Eyes |  |  | [find](https://www.youtube.com/results?search_query=The%20War%20on%20Drugs%20Red%20Eyes) |  | 2015-01-15 | `d4b7f9702645b4f1` |
|  | Jacques Greene (ft. Koreless) | Arrow |  |  | [find](https://www.youtube.com/results?search_query=Jacques%20Greene%20(ft.%20Koreless)%20Arrow) |  | 2015-01-19 | `0e21d84f614fe04d` |
|  | Serge Gainsbourg | Pas long feu |  |  | [find](https://www.youtube.com/results?search_query=Serge%20Gainsbourg%20Pas%20long%20feu) |  | 2015-01-26 | `69dcfc66b286b35c` |
|  | The Golliwogs | You Better Be Careful |  |  | [find](https://www.youtube.com/results?search_query=The%20Golliwogs%20You%20Better%20Be%20Careful) |  | 2015-01-26 | `4938ae8551183e00` |
|  | Frederik Mey | Bonsoir mes amis |  |  | [find](https://www.youtube.com/results?search_query=Frederik%20Mey%20Bonsoir%20mes%20amis) |  | 2015-01-27 | `6d053ed29a855e38` |
|  | Collège | My Secret Romance |  |  | [find](https://www.youtube.com/results?search_query=Coll%C3%A8ge%20My%20Secret%20Romance) |  | 2015-01-28 | `db3ecde8e0d23ef0` |
|  | Nicolas Jaar | Wouh |  |  | [find](https://www.youtube.com/results?search_query=Nicolas%20Jaar%20Wouh) |  | 2015-01-30 | `7241f30464af1602` |
|  | Bobby McFerrin | Thinkin’ About Your Body |  |  | [find](https://www.youtube.com/results?search_query=Bobby%20McFerrin%20Thinkin%E2%80%99%20About%20Your%20Body) |  | 2015-01-30 | `cf0d220bfff73248` |
|  | Daniel Avery | Reception |  |  | [find](https://www.youtube.com/results?search_query=Daniel%20Avery%20Reception) |  | 2015-02-03 | `4eda3db008839188` |
|  | Flight Facilities | Stand Still |  |  | [find](https://www.youtube.com/results?search_query=Flight%20Facilities%20Stand%20Still) |  | 2015-02-03 | `e02febdef09f9977` |
|  | Idioma | Pandore |  |  | [find](https://www.youtube.com/results?search_query=Idioma%20Pandore) |  | 2015-02-05 | `3cafe6893b85d201` |
|  | Stereo Total | Musique Automatique |  |  | [find](https://www.youtube.com/results?search_query=Stereo%20Total%20Musique%20Automatique) |  | 2015-02-05 | `c3b793a0501a2b7e` |
|  | Tonetta | Drugs Drugs Drugs |  |  | [find](https://www.youtube.com/results?search_query=Tonetta%20Drugs%20Drugs%20Drugs) |  | 2015-02-09 | `10785c7cd695fbe3` |
|  | Girls Names | The New Life |  |  | [find](https://www.youtube.com/results?search_query=Girls%20Names%20The%20New%20Life) |  | 2015-02-12 | `af4349e9bf2d5fe6` |
|  | Suicide | Girl |  |  | [find](https://www.youtube.com/results?search_query=Suicide%20Girl) |  | 2015-02-16 | `a0f87633b2d8cb29` |
|  | Brigitte Bardot | Contact |  |  | [find](https://www.youtube.com/results?search_query=Brigitte%20Bardot%20Contact) |  | 2015-03-12 | `bcbf565910a3d4b8` |
|  | William Onyeabor | Better Change Your Mind |  |  | [find](https://www.youtube.com/results?search_query=William%20Onyeabor%20Better%20Change%20Your%20Mind) |  | 2015-03-17 | `132d17016d5ce703` |
|  | clipping. (ft. Cocc Pistol Cree) | Work Work |  |  | [find](https://www.youtube.com/results?search_query=clipping.%20(ft.%20Cocc%20Pistol%20Cree)%20Work%20Work) |  | 2015-04-01 | `240a616ea7ee5fc5` |
|  | Joanna Newsom | Baby Birch |  |  | [find](https://www.youtube.com/results?search_query=Joanna%20Newsom%20Baby%20Birch) |  | 2015-04-09 | `05cd7d8cdabf1d44` |
|  | Pisces | Dear One |  |  | [find](https://www.youtube.com/results?search_query=Pisces%20Dear%20One) |  | 2015-04-20 | `40631182db254ea6` |
|  | Leonard Cohen | Tonight Will Be Fine |  |  | [find](https://www.youtube.com/results?search_query=Leonard%20Cohen%20Tonight%20Will%20Be%20Fine) |  | 2015-05-20 | `c1b596cdd73e52f4` |
|  | Bruce Springsteen | I’m on Fire |  |  | [find](https://www.youtube.com/results?search_query=Bruce%20Springsteen%20I%E2%80%99m%20on%20Fire) |  | 2015-06-08 | `806fc3b47f6c6b3d` |
|  | Pierre Cavalli | Un soir chez Norris |  |  | [find](https://www.youtube.com/results?search_query=Pierre%20Cavalli%20Un%20soir%20chez%20Norris) |  | 2015-06-10 | `052b0b90f4bcfff0` |
|  | Mystère | Me Suive |  |  | [find](https://www.youtube.com/results?search_query=Myst%C3%A8re%20Me%20Suive) |  | 2015-07-21 | `cdf0de339b74a793` |
|  | Willis Earl Beal | Hole in the Roof |  |  | [find](https://www.youtube.com/results?search_query=Willis%20Earl%20Beal%20Hole%20in%20the%20Roof) |  | 2015-09-28 | `c596d4daaff65ffd` |
|  | PNL | J’suis PNL |  |  | [find](https://www.youtube.com/results?search_query=PNL%20J%E2%80%99suis%20PNL) |  | 2015-10-03 | `4b7c02fe5128a7f5` |
|  | Laurent Garnier | Boiler Room DJ set at Le Sucre, Lyon, July 2015 |  |  | [find](https://www.youtube.com/results?search_query=Laurent%20Garnier%20Boiler%20Room%20DJ%20set%20at%20Le%20Sucre%2C%20Lyon%2C%20July%202015) |  | 2015-10-21 | `47707d40de87904f` |
|  | Wampire | Bad Attitude |  |  | [find](https://www.youtube.com/results?search_query=Wampire%20Bad%20Attitude) |  | 2015-11-06 | `e9f0cf27c92fc025` |
|  | Brandt Brauer Frick | Caffeine |  |  | [find](https://www.youtube.com/results?search_query=Brandt%20Brauer%20Frick%20Caffeine) |  | 2015-11-23 | `3b2030de3ce2bb0c` |
|  | Petula Clark | La nuit n’en finit plus |  |  | [find](https://www.youtube.com/results?search_query=Petula%20Clark%20La%20nuit%20n%E2%80%99en%20finit%20plus) |  | 2015-12-01 | `749af2fd822efdfc` |
|  | Galt MacDermot | Coffee Cold |  |  | [find](https://www.youtube.com/results?search_query=Galt%20MacDermot%20Coffee%20Cold) |  | 2015-12-02 | `a7ecd72249f2ab18` |
|  | Odetta | Pastures of Plenty |  |  | [find](https://www.youtube.com/results?search_query=Odetta%20Pastures%20of%20Plenty) |  | 2015-12-03 | `83c0f8d834c9e234` |
|  | Karen Dalton | It Hurts Me Too |  |  | [find](https://www.youtube.com/results?search_query=Karen%20Dalton%20It%20Hurts%20Me%20Too) |  | 2015-12-05 | `29aa17306b20cfdb` |
|  | Mykki Blanco | Coke White, Starlight |  |  | [find](https://www.youtube.com/results?search_query=Mykki%20Blanco%20Coke%20White%2C%20Starlight) |  | 2015-12-06 | `dcfdd881efdc722e` |
|  | Weekend Cult | Smokin & Drinkin |  |  | [find](https://www.youtube.com/results?search_query=Weekend%20Cult%20Smokin%20%26%20Drinkin) |  | 2016-02-18 | `4d7f97049dda6d82` |
|  | Marie Davidson | Balade aux USA |  |  | [find](https://www.youtube.com/results?search_query=Marie%20Davidson%20Balade%20aux%20USA) |  | 2016-02-18 | `7bb99103b3ac9495` |
|  | Jackie Mittoo | Ghetto Organ |  |  | [find](https://www.youtube.com/results?search_query=Jackie%20Mittoo%20Ghetto%20Organ) |  | 2016-03-18 | `6dc4188aaf2f8f26` |
|  | Shuggie Otis | Oxford Gray |  |  | [find](https://www.youtube.com/results?search_query=Shuggie%20Otis%20Oxford%20Gray) |  | 2016-03-19 | `174bbecfbf1bebd7` |
|  | Lena Platonos | Shadow of Blood |  |  | [find](https://www.youtube.com/results?search_query=Lena%20Platonos%20Shadow%20of%20Blood) |  | 2016-07-09 | `66622c631114560e` |
|  | Meatbodies | Disorder |  |  | [find](https://www.youtube.com/results?search_query=Meatbodies%20Disorder) |  | 2016-09-03 | `7503c19f6831d24f` |
|  | Mujeres | Lose Control |  |  | [find](https://www.youtube.com/results?search_query=Mujeres%20Lose%20Control) |  | 2016-09-03 | `98bfe2f4c760822c` |
|  | FIDLAR | Cheap Beer |  |  | [find](https://www.youtube.com/results?search_query=FIDLAR%20Cheap%20Beer) |  | 2016-09-03 | `87cfd63d220e7591` |
|  | Michael Rault | Sucksess (Live at Audiotree, Toronto, 14 January 2016) / Lovers Lie / I Want To Love You |  |  | [find](https://www.youtube.com/results?search_query=Michael%20Rault%20Sucksess%20(Live%20at%20Audiotree%2C%20Toronto%2C%2014%20January%202016)%20%2F%20Lovers%20Lie%20%2F%20I%20Want%20To%20Love%20You) |  | 2016-09-03 | `d235fd26b18255ba` |
|  | Clarence Henry | Ain’t Got No Home |  |  | [find](https://www.youtube.com/results?search_query=Clarence%20Henry%20Ain%E2%80%99t%20Got%20No%20Home) |  | 2016-09-09 | `d7bf41bca3ecac2b` |
|  | Syl Johnson | It Is Because I’m Black |  |  | [find](https://www.youtube.com/results?search_query=Syl%20Johnson%20It%20Is%20Because%20I%E2%80%99m%20Black) |  | 2016-09-13 | `cdca43135bb57b1d` |
|  | Boris Vian | La complainte du progrès |  |  | [find](https://www.youtube.com/results?search_query=Boris%20Vian%20La%20complainte%20du%20progr%C3%A8s) |  | 2016-09-16 | `67abca0f586e5f43` |
|  | Ihsan Al Munzer | Jamileh |  |  | [find](https://www.youtube.com/results?search_query=Ihsan%20Al%20Munzer%20Jamileh) |  | 2016-09-21 | `48b20e61748770ac` |
|  | Mink DeVille | Spanish Stroll |  |  | [find](https://www.youtube.com/results?search_query=Mink%20DeVille%20Spanish%20Stroll) |  | 2016-09-23 | `39cd414d4ecd07e9` |
|  | Marty Robbins | Big Iron |  |  | [find](https://www.youtube.com/results?search_query=Marty%20Robbins%20Big%20Iron) |  | 2016-09-26 | `19cc9945a2caaf44` |
|  | Chemise | She Can’t Love You |  |  | [find](https://www.youtube.com/results?search_query=Chemise%20She%20Can%E2%80%99t%20Love%20You) |  | 2016-09-30 | `c2fd7f4b98bf180a` |
|  | Aurita Castillo y su Conjunto | Chambacu |  |  | [find](https://www.youtube.com/results?search_query=Aurita%20Castillo%20y%20su%20Conjunto%20Chambacu) |  | 2016-10-07 | `c5ef82f846668b93` |
|  | Balla et ses Balladins | Paulette |  |  | [find](https://www.youtube.com/results?search_query=Balla%20et%20ses%20Balladins%20Paulette) |  | 2016-10-07 | `70f564a98436978c` |
|  | Isaac Hayes | Ike’s Rap II |  |  | [find](https://www.youtube.com/results?search_query=Isaac%20Hayes%20Ike%E2%80%99s%20Rap%20II) |  | 2016-10-14 | `29d1a37cd0da9b11` |
|  | Johnny “Guitar” Watson | Lovin’ You |  |  | [find](https://www.youtube.com/results?search_query=Johnny%20%E2%80%9CGuitar%E2%80%9D%20Watson%20Lovin%E2%80%99%20You) |  | 2016-10-14 | `5581c167b2d8f6b8` |
|  | John Barry | The Girl With The Sun In Her Hair |  |  | [find](https://www.youtube.com/results?search_query=John%20Barry%20The%20Girl%20With%20The%20Sun%20In%20Her%20Hair) |  | 2016-10-21 | `7b0e80eb010c8f30` |
|  | Weval | You’re Mine |  |  | [find](https://www.youtube.com/results?search_query=Weval%20You%E2%80%99re%20Mine) |  | 2016-10-28 | `cb745c11f04f2d35` |
|  | LOUISAHHH!!! | Ready |  |  | [find](https://www.youtube.com/results?search_query=LOUISAHHH!!!%20Ready) |  | 2016-10-28 | `e1ca2debb0788409` |
|  | Jun Miyake | Lillies Of The Valley |  |  | [find](https://www.youtube.com/results?search_query=Jun%20Miyake%20Lillies%20Of%20The%20Valley) |  | 2016-11-04 | `2099d87f854a6885` |
|  | Shigeo Sekito | The Word II |  |  | [find](https://www.youtube.com/results?search_query=Shigeo%20Sekito%20The%20Word%20II) |  | 2016-11-04 | `a015e5fa472e382f` |
|  | Yves Simon | Au pays des merveilles de Juliet |  |  | [find](https://www.youtube.com/results?search_query=Yves%20Simon%20Au%20pays%20des%20merveilles%20de%20Juliet) |  | 2016-11-10 | `cacb1a5cf47555e9` |
|  | Michel Polnareff | L'homme qui pleurait des larmes de verre |  |  | [find](https://www.youtube.com/results?search_query=Michel%20Polnareff%20L'homme%20qui%20pleurait%20des%20larmes%20de%20verre) |  | 2016-11-10 | `4ea5a51f6881eb03` |
|  | Sherri Taylor | He’s The One That Rings My Bell |  |  | [find](https://www.youtube.com/results?search_query=Sherri%20Taylor%20He%E2%80%99s%20The%20One%20That%20Rings%20My%20Bell) |  | 2016-11-18 | `c114b5ea8e012547` |
|  | Carl Hall | You Don’t Know Nothing About Love |  |  | [find](https://www.youtube.com/results?search_query=Carl%20Hall%20You%20Don%E2%80%99t%20Know%20Nothing%20About%20Love) |  | 2016-11-18 | `1369986935bede78` |
|  | Kiddy Smile | Let a B!tch Know |  |  | [find](https://www.youtube.com/results?search_query=Kiddy%20Smile%20Let%20a%20B!tch%20Know) |  | 2016-12-02 | `9457f823d2adb8c9` |
|  | The Blaze | Virile |  |  | [find](https://www.youtube.com/results?search_query=The%20Blaze%20Virile) |  | 2016-12-02 | `ff8269be17cab38f` |
|  | Daniel Johnston | Catie |  |  | [find](https://www.youtube.com/results?search_query=Daniel%20Johnston%20Catie) |  | 2017-04-19 | `a92c8d4178ab7a2e` |
|  | Brushy One String | Life is for Every Man |  |  | [find](https://www.youtube.com/results?search_query=Brushy%20One%20String%20Life%20is%20for%20Every%20Man) |  | 2017-04-20 | `80a4b3dcea6fda92` |
|  | R.L. Burnside | See My Jumper Hanging On The Line |  |  | [find](https://www.youtube.com/results?search_query=R.L.%20Burnside%20See%20My%20Jumper%20Hanging%20On%20The%20Line) |  | 2017-04-21 | `4479e6bc647f73bc` |
|  | Letta Mbulu | Normalizo |  |  | [find](https://www.youtube.com/results?search_query=Letta%20Mbulu%20Normalizo) |  | 2017-04-24 | `483e11fa91f648fe` |
|  | Le temps est bon | Isabelle Pierre |  |  | [find](https://www.youtube.com/results?search_query=Le%20temps%20est%20bon%20Isabelle%20Pierre) |  | 2017-04-25 | `c6644f494d126e8e` |
|  | Sophie Daumier | Féminine Féline |  |  | [find](https://www.youtube.com/results?search_query=Sophie%20Daumier%20F%C3%A9minine%20F%C3%A9line) |  | 2017-04-26 | `bb0be0c1ccb33e76` |
|  | Billie Holliday | Strange Fruit |  |  | [find](https://www.youtube.com/results?search_query=Billie%20Holliday%20Strange%20Fruit) |  | 2017-04-29 | `a7bedd931baddd10` |
|  | Marlene Dietrich | Où vont les fleurs ? |  |  | [find](https://www.youtube.com/results?search_query=Marlene%20Dietrich%20O%C3%B9%20vont%20les%20fleurs%20%3F) |  | 2017-05-01 | `9f4119ff79cbe910` |
|  | Yves Montand | Bella Ciao |  |  | [find](https://www.youtube.com/results?search_query=Yves%20Montand%20Bella%20Ciao) |  | 2017-05-03 | `9c637be3a730045d` |
|  | Dominique Grange | À bas l’état policier |  |  | [find](https://www.youtube.com/results?search_query=Dominique%20Grange%20%C3%80%20bas%20l%E2%80%99%C3%A9tat%20policier) |  | 2017-05-03 | `e8998c6946202eb0` |
|  | Anna Marly | La complainte du partisan |  |  | [find](https://www.youtube.com/results?search_query=Anna%20Marly%20La%20complainte%20du%20partisan) |  | 2017-05-03 | `086558cdd1e46be1` |
|  | Linton Kwesi Johnson | More Time |  |  | [find](https://www.youtube.com/results?search_query=Linton%20Kwesi%20Johnson%20More%20Time) |  | 2017-05-05 | `e640d7bc0f0b8793` |
|  | Peter Tosh | Bush Doctor |  |  | [find](https://www.youtube.com/results?search_query=Peter%20Tosh%20Bush%20Doctor) |  | 2017-05-06 | `3ef8863fc7a59bec` |
|  | Keith Lynn with Byron Lee | My sweet lord |  |  | [find](https://www.youtube.com/results?search_query=Keith%20Lynn%20with%20Byron%20Lee%20My%20sweet%20lord) |  | 2017-05-07 | `58e7b6bdeaa572ae` |
|  | The Beatles | Something |  |  | [find](https://www.youtube.com/results?search_query=The%20Beatles%20Something) |  | 2017-05-08 | `b84660091192b693` |
|  | Finley Quaye | Ultra Stimulation |  |  | [find](https://www.youtube.com/results?search_query=Finley%20Quaye%20Ultra%20Stimulation) |  | 2017-05-09 | `695b175555e81220` |
|  | Nino Ferrer | Cannabis |  |  | [find](https://www.youtube.com/results?search_query=Nino%20Ferrer%20Cannabis) |  | 2017-05-10 | `c66e2827aabc26cf` |
|  | The Squires | Wonderin’ |  |  | [find](https://www.youtube.com/results?search_query=The%20Squires%20Wonderin%E2%80%99) |  | 2017-05-13 | `4d286635dc8389d8` |
|  | Los Angeles Negros | Tú Y Tu Mirar… Yo Y Mi Canción |  |  | [find](https://www.youtube.com/results?search_query=Los%20Angeles%20Negros%20T%C3%BA%20Y%20Tu%20Mirar%E2%80%A6%20Yo%20Y%20Mi%20Canci%C3%B3n) |  | 2017-05-14 | `1a0f626f77339f26` |
|  | Jefferson Airplane | Pretty As You Feel |  |  | [find](https://www.youtube.com/results?search_query=Jefferson%20Airplane%20Pretty%20As%20You%20Feel) |  | 2017-05-15 | `abd8339c35ed8391` |
|  | Gloria Ann Taylor | Love is a Hurtin’ Thing |  |  | [find](https://www.youtube.com/results?search_query=Gloria%20Ann%20Taylor%20Love%20is%20a%20Hurtin%E2%80%99%20Thing) |  | 2017-05-16 | `990912cdeb927972` |
|  | Roy Ayers | I Am Your Mind pt.2 |  |  | [find](https://www.youtube.com/results?search_query=Roy%20Ayers%20I%20Am%20Your%20Mind%20pt.2) |  | 2017-05-18 | `b83a2484a35bae51` |
|  | The Impressions | Sometimes I Wonder |  |  | [find](https://www.youtube.com/results?search_query=The%20Impressions%20Sometimes%20I%20Wonder) |  | 2017-05-19 | `710b9bcd61f97e8a` |
|  | Labi Siffre | Doctor Doctor |  |  | [find](https://www.youtube.com/results?search_query=Labi%20Siffre%20Doctor%20Doctor) |  | 2017-05-20 | `5703b1a60ebaea47` |
|  | Waylon Jennings | Waymore’s Blues |  |  | [find](https://www.youtube.com/results?search_query=Waylon%20Jennings%20Waymore%E2%80%99s%20Blues) |  | 2017-05-23 | `f06d4c3bf61dad95` |
|  | Lee Hazlewood | Boots |  |  | [find](https://www.youtube.com/results?search_query=Lee%20Hazlewood%20Boots) |  | 2017-05-24 | `43bcd49a046d37e2` |
|  | The Buddy Rich Big Band | The Beat Goes On |  |  | [find](https://www.youtube.com/results?search_query=The%20Buddy%20Rich%20Big%20Band%20The%20Beat%20Goes%20On) |  | 2017-05-25 | `a0d0036a551b89bd` |
|  | The Flamingos | I Only Have Eyes For You |  |  | [find](https://www.youtube.com/results?search_query=The%20Flamingos%20I%20Only%20Have%20Eyes%20For%20You) |  | 2017-05-26 | `1066951aba276bcf` |
|  | Donald Byrd | Cristo Redentor |  |  | [find](https://www.youtube.com/results?search_query=Donald%20Byrd%20Cristo%20Redentor) |  | 2017-05-27 | `51b88d1f7fb51716` |
|  | Jun Miyake | Ça Fait Longtemps |  |  | [find](https://www.youtube.com/results?search_query=Jun%20Miyake%20%C3%87a%20Fait%20Longtemps) |  | 2017-05-29 | `fc99f07b003ef88a` |
|  | ScubaZ | The Vanishing American Family |  |  | [find](https://www.youtube.com/results?search_query=ScubaZ%20The%20Vanishing%20American%20Family) |  | 2017-05-30 | `d01e3218d9b0d22a` |
|  | Bertrand Belin | Hypernuit |  |  | [find](https://www.youtube.com/results?search_query=Bertrand%20Belin%20Hypernuit) |  | 2017-06-01 | `a83c1b0517e3f1a9` |
|  | Mathieu Boogaerts | Pourquoi pas |  |  | [find](https://www.youtube.com/results?search_query=Mathieu%20Boogaerts%20Pourquoi%20pas) |  | 2017-06-02 | `114a175c840c1c59` |
|  | The Coneheads | Psycho Killer |  |  | [find](https://www.youtube.com/results?search_query=The%20Coneheads%20Psycho%20Killer) |  | 2017-06-04 | `670060d576218adc` |
|  | Metallica | The Four Horsemen |  |  | [find](https://www.youtube.com/results?search_query=Metallica%20The%20Four%20Horsemen) |  | 2017-06-05 | `c1f37944b6299e8c` |
|  | RENDEZ VOUS | Distance |  |  | [find](https://www.youtube.com/results?search_query=RENDEZ%20VOUS%20Distance) |  | 2017-06-07 | `154ce866bc7c9ba8` |
|  | Tiny Tim | Tip Toe Thru’ The Tulips With Me |  |  | [find](https://www.youtube.com/results?search_query=Tiny%20Tim%20Tip%20Toe%20Thru%E2%80%99%20The%20Tulips%20With%20Me) |  | 2017-06-08 | `9e9daeffa1781323` |
|  | Frank Zappa | Why Does it Hurt When I Pee? |  |  | [find](https://www.youtube.com/results?search_query=Frank%20Zappa%20Why%20Does%20it%20Hurt%20When%20I%20Pee%3F) |  | 2017-06-09 | `e562a8c1f274c398` |
|  | Björk | Human Behaviour |  |  | [find](https://www.youtube.com/results?search_query=Bj%C3%B6rk%20Human%20Behaviour) |  | 2017-06-10 | `93a84dba78ddf0fb` |
|  | Joseph Capriati | Solar System |  |  | [find](https://www.youtube.com/results?search_query=Joseph%20Capriati%20Solar%20System) |  | 2017-06-13 | `27e60d9e432aa9e9` |
|  | Paul Ritch | Run Baby Run |  |  | [find](https://www.youtube.com/results?search_query=Paul%20Ritch%20Run%20Baby%20Run) |  | 2017-06-14 | `f99ef0cc0db658ad` |
|  | Ghost Culture | Answer |  |  | [find](https://www.youtube.com/results?search_query=Ghost%20Culture%20Answer) |  | 2017-06-15 | `78d70426ff12e36e` |
|  | Asia Argento | Sexodrome |  |  | [find](https://www.youtube.com/results?search_query=Asia%20Argento%20Sexodrome) |  | 2018-02-03 | `0a935b3e7bf77bb7` |
|  | Vivien Savage | La p’tite lady |  |  | [find](https://www.youtube.com/results?search_query=Vivien%20Savage%20La%20p%E2%80%99tite%20lady) |  | 2018-02-03 | `36221e7c55a9aa45` |
|  | Patrick Coutin | J’aime regarder les filles |  |  | [find](https://www.youtube.com/results?search_query=Patrick%20Coutin%20J%E2%80%99aime%20regarder%20les%20filles) |  | 2018-02-03 | `2263fc65f8e0434e` |
|  | Jeanne Moreau | Où vas-tu Mathilde ? |  |  | [find](https://www.youtube.com/results?search_query=Jeanne%20Moreau%20O%C3%B9%20vas-tu%20Mathilde%20%3F) |  | 2018-02-03 | `5e3f15e938415c63` |
|  | Jacques Dutronc | Le dragueur des supermarchés |  |  | [find](https://www.youtube.com/results?search_query=Jacques%20Dutronc%20Le%20dragueur%20des%20supermarch%C3%A9s) |  | 2018-02-03 | `f1c0ef1d089bee76` |
|  | Feu! Chatterton | Fou à lier |  |  | [find](https://www.youtube.com/results?search_query=Feu!%20Chatterton%20Fou%20%C3%A0%20lier) |  | 2018-02-03 | `dc5b62959392b4f4` |
|  | Flavien Berger | Gravité |  |  | [find](https://www.youtube.com/results?search_query=Flavien%20Berger%20Gravit%C3%A9) |  | 2018-02-03 | `8a57bb8ad5b39f61` |
|  | Georges Brassens | El testamento |  |  | [find](https://www.youtube.com/results?search_query=Georges%20Brassens%20El%20testamento) |  | 2018-02-03 | `17bcab497ea0bb2a` |
|  | Salvatore Adamo | Tombe la neige |  |  | [find](https://www.youtube.com/results?search_query=Salvatore%20Adamo%20Tombe%20la%20neige) |  | 2018-02-06 | `50c5290493d92008` |
|  | Beck | Round the Bend |  |  | [find](https://www.youtube.com/results?search_query=Beck%20Round%20the%20Bend) |  | 2019-01-31 | `1f4f6ea95538faea` |

Every row traces back to Tumblr through its post id: the recording it names carries the
permalink as an identity source.
