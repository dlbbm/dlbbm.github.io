# Import review

Written by `npm run data:import`. 159 of 401 posts need a look.

**Four columns are yours to edit**, in place, row by row — `artist`, `song`, `source`
and `note`, which sit together on the left. `flags` opens each row with what the import
could not read, and `find`, `date` and `post` are there to help you answer.

- **`artist`** — correct it if the import read it wrong, and **split a credit with
  `;`**: `Brigitte Fontaine; The Art Ensemble of Chicago; Areski Belkacem` is three
  artists where the import stored one. A name prefixed `ft.` is a guest rather than a
  credit: `Nicone; Sascha Braemer; ft. Narra`. A name already in the database is reused;
  a new one is created with its own URL.
- **`song`** — the work's title, if the import mangled it.
- **`source`** — a URL that plays the track. The `find` link opens a YouTube search for
  that artist and song.
- **`note`** — yours. Nothing reads it.

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

| flags | artist | song | source | find | note | date | post |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `no-source` | Death In Vegas | All That Glitters |  | [find](https://www.youtube.com/results?search_query=Death%20In%20Vegas%20All%20That%20Glitters) |  | 2012-12-15 | `904b71ccbbd0523a` |
| `no-source` | IS Tropical | Lies |  | [find](https://www.youtube.com/results?search_query=IS%20Tropical%20Lies) |  | 2012-12-15 | `c8e5805defa42c2e` |
| `read-qualifier` | Connan Mockassin | Forever Dolphin Love |  | [find](https://www.youtube.com/results?search_query=Connan%20Mockassin%20Forever%20Dolphin%20Love) |  | 2012-12-16 | `d509c396bcfeeddd` |
| `no-source` | F.J. Mc Mahon | The Spirit of the Golden Juice |  | [find](https://www.youtube.com/results?search_query=F.J.%20Mc%20Mahon%20The%20Spirit%20of%20the%20Golden%20Juice) |  | 2012-12-16 | `16d8fdd80eb07c24` |
| `no-source` | The Doors | Cars Hiss By My Window |  | [find](https://www.youtube.com/results?search_query=The%20Doors%20Cars%20Hiss%20By%20My%20Window) |  | 2012-12-16 | `7b45bad59c832b80` |
| `read-qualifier` | Brigitte | Ma Benz |  | [find](https://www.youtube.com/results?search_query=Brigitte%20Ma%20Benz) |  | 2012-12-16 | `09ab467119c79540` |
| `ambiguous-credit` | Nicone & Sascha Braemer (ft. Narra) | Caje |  | [find](https://www.youtube.com/results?search_query=Nicone%20%26%20Sascha%20Braemer%20(ft.%20Narra)%20Caje) |  | 2012-12-16 | `5fa7b7c7331d28f7` |
| `no-source` | J.J. Cale | Since You Said Goodbye |  | [find](https://www.youtube.com/results?search_query=J.J.%20Cale%20Since%20You%20Said%20Goodbye) |  | 2012-12-16 | `674c15834e937105` |
| `no-source` | Pink Floyd | Lucifer Sam |  | [find](https://www.youtube.com/results?search_query=Pink%20Floyd%20Lucifer%20Sam) |  | 2012-12-16 | `0b40f34333103457` |
| `no-source` `dead-source-in-body` | Serge Gainsbourg | Comme un Boomerang |  | [find](https://www.youtube.com/results?search_query=Serge%20Gainsbourg%20Comme%20un%20Boomerang) | `http://grooveshark.com/songWidget.swf` | 2012-12-16 | `d66edfed6fddc22c` |
| `read-qualifier` | Rone | La Dame Blanche |  | [find](https://www.youtube.com/results?search_query=Rone%20La%20Dame%20Blanche) |  | 2012-12-16 | `7912bc92bf753376` |
| `no-source` | Tijuana Panthers | Angie |  | [find](https://www.youtube.com/results?search_query=Tijuana%20Panthers%20Angie) |  | 2012-12-16 | `121538141b12351c` |
| `no-source` | Pachanga Boys | Time |  | [find](https://www.youtube.com/results?search_query=Pachanga%20Boys%20Time) |  | 2012-12-18 | `64b6afb1138c03e9` |
| `read-qualifier` `no-source` | Chromatics | Into the Black |  | [find](https://www.youtube.com/results?search_query=Chromatics%20Into%20the%20Black) |  | 2012-12-19 | `d95b8396b1f07fa1` |
| `ambiguous-credit` `no-source` | Santo & Johnny | Venus |  | [find](https://www.youtube.com/results?search_query=Santo%20%26%20Johnny%20Venus) |  | 2012-12-29 | `108e632b277883e5` |
| `no-source` | Pearl Jam | Do The Evolution |  | [find](https://www.youtube.com/results?search_query=Pearl%20Jam%20Do%20The%20Evolution) |  | 2012-12-31 | `d071de57799c6a52` |
| `no-source` | Os Mutantes | A Minha Menina |  | [find](https://www.youtube.com/results?search_query=Os%20Mutantes%20A%20Minha%20Menina) |  | 2013-01-01 | `763e32b36ada9816` |
| `no-source` | Miles Davis | Ascenseur pour l'Échafaud |  | [find](https://www.youtube.com/results?search_query=Miles%20Davis%20Ascenseur%20pour%20l'%C3%89chafaud) |  | 2013-01-02 | `13544a337b2477c7` |
| `ambiguous-credit` | Pusha T ft. Tyler, The Creator | Trouble On My Mind |  | [find](https://www.youtube.com/results?search_query=Pusha%20T%20ft.%20Tyler%2C%20The%20Creator%20Trouble%20On%20My%20Mind) |  | 2013-01-04 | `905d10b83f0f677c` |
| `no-source` | Gil Scott-Heron | The Revolution Will Not Be Televised |  | [find](https://www.youtube.com/results?search_query=Gil%20Scott-Heron%20The%20Revolution%20Will%20Not%20Be%20Televised) |  | 2013-01-06 | `dc89bee0ad9c43f0` |
| `read-qualifier` `no-source` | Grandmaster Flash | The Message |  | [find](https://www.youtube.com/results?search_query=Grandmaster%20Flash%20The%20Message) |  | 2013-01-08 | `c55ddaf273b8fba9` |
| `no-source` | Joy Division | Digital |  | [find](https://www.youtube.com/results?search_query=Joy%20Division%20Digital) |  | 2013-01-11 | `f255edd449f13bcf` |
| `read-qualifier` `ambiguous-credit` | Niki & the Dove | Mother Protect |  | [find](https://www.youtube.com/results?search_query=Niki%20%26%20the%20Dove%20Mother%20Protect) |  | 2013-01-11 | `0e5fe0028f707ee3` |
| `no-source` | Dye | Fantasy |  | [find](https://www.youtube.com/results?search_query=Dye%20Fantasy) |  | 2013-01-12 | `087c2445d66964c1` |
| `no-source` | Julee Cruise | The World Spins |  | [find](https://www.youtube.com/results?search_query=Julee%20Cruise%20The%20World%20Spins) |  | 2013-01-14 | `969e4b689843dd81` |
| `no-source` | Alaska In Winter | Berlin |  | [find](https://www.youtube.com/results?search_query=Alaska%20In%20Winter%20Berlin) |  | 2013-01-20 | `2ce7c5501e231aba` |
| `no-source` | Klangkarussell | Sonnentanz |  | [find](https://www.youtube.com/results?search_query=Klangkarussell%20Sonnentanz) |  | 2013-01-24 | `0c0c7dcad0c9cd90` |
| `no-source` | Outkast | Hey Ya |  | [find](https://www.youtube.com/results?search_query=Outkast%20Hey%20Ya) |  | 2013-01-25 | `e02a1d75ad53cf39` |
| `read-qualifier` `no-source` | Scrubs | Hey Ya |  | [find](https://www.youtube.com/results?search_query=Scrubs%20Hey%20Ya) |  | 2013-01-25 | `a54196d1c2d8b2d3` |
| `read-qualifier` | Cocoon | American Boy |  | [find](https://www.youtube.com/results?search_query=Cocoon%20American%20Boy) |  | 2013-01-25 | `beb0526a39c68649` |
| `ambiguous-credit` | Amadou & Mariam | Sabali |  | [find](https://www.youtube.com/results?search_query=Amadou%20%26%20Mariam%20Sabali) |  | 2013-01-25 | `1f6a579befd971f9` |
| `no-source` | Franz Liszt | Hungarian Rhapsody N°2 |  | [find](https://www.youtube.com/results?search_query=Franz%20Liszt%20Hungarian%20Rhapsody%20N%C2%B02) |  | 2013-01-29 | `c07a3b5dbe4ecb42` |
| `ambiguous-credit` | Frank Sinatra & Nancy Sinatra | Something Stupid |  | [find](https://www.youtube.com/results?search_query=Frank%20Sinatra%20%26%20Nancy%20Sinatra%20Something%20Stupid) |  | 2013-01-30 | `d7c81386a2b7d153` |
| `read-qualifier` | Jan Turkenburg | In My Spaceship |  | [find](https://www.youtube.com/results?search_query=Jan%20Turkenburg%20In%20My%20Spaceship) |  | 2013-02-01 | `8a1b4b3669029de8` |
| `read-qualifier` | Slow Club | Never Look Back |  | [find](https://www.youtube.com/results?search_query=Slow%20Club%20Never%20Look%20Back) |  | 2013-02-04 | `63a1ec446a4d907c` |
| `ambiguous-credit` | Macklemore & Ryan Lewis ft. Wanz | Thrift Shop |  | [find](https://www.youtube.com/results?search_query=Macklemore%20%26%20Ryan%20Lewis%20ft.%20Wanz%20Thrift%20Shop) |  | 2013-02-05 | `ced7836eacf5b5bc` |
| `no-source` | Air | Empty House |  | [find](https://www.youtube.com/results?search_query=Air%20Empty%20House) |  | 2013-02-12 | `dfa66eb14288cdfe` |
| `no-source` | Black Sabbath | Planet Caravan |  | [find](https://www.youtube.com/results?search_query=Black%20Sabbath%20Planet%20Caravan) |  | 2013-03-13 | `7e910a9bdbcd85b9` |
| `no-source` | Mr. Fox | Party Track |  | [find](https://www.youtube.com/results?search_query=Mr.%20Fox%20Party%20Track) |  | 2013-03-14 | `d547d3b7c75783d3` |
| `no-source` | Reputante | Lock Me Up |  | [find](https://www.youtube.com/results?search_query=Reputante%20Lock%20Me%20Up) |  | 2013-03-16 | `f06638872bf502d1` |
| `no-source` | The Painted Ship | Frustration |  | [find](https://www.youtube.com/results?search_query=The%20Painted%20Ship%20Frustration) |  | 2013-04-03 | `af7ca0fb54e350c7` |
| `no-source` | Pink Floyd | Echoes |  | [find](https://www.youtube.com/results?search_query=Pink%20Floyd%20Echoes) |  | 2013-04-05 | `8f2e5e8eb054a017` |
| `no-source` | The Velvet Underground | Oh! Sweet Nuthin’ |  | [find](https://www.youtube.com/results?search_query=The%20Velvet%20Underground%20Oh!%20Sweet%20Nuthin%E2%80%99) |  | 2013-04-05 | `fcf9ae6f89ddffae` |
| `no-source` | Daft Punk | Rock n’ Roll |  | [find](https://www.youtube.com/results?search_query=Daft%20Punk%20Rock%20n%E2%80%99%20Roll) |  | 2013-04-19 | `460fe31f36178e23` |
| `read-qualifier` `no-source` `dead-source-in-body` | Maxence Cyrin | D.A.N.C.E |  | [find](https://www.youtube.com/results?search_query=Maxence%20Cyrin%20D.A.N.C.E) | `http://soundowl.com/track/675/maxence-cyrin-dance-justice-cover` | 2013-04-21 | `4338d74a69266c99` |
| `no-source` | Sixto Rodriguez | Crucify Your Mind |  | [find](https://www.youtube.com/results?search_query=Sixto%20Rodriguez%20Crucify%20Your%20Mind) |  | 2013-04-25 | `6b314fa595f41a49` |
| `no-source` | Nu | MAN O TO |  | [find](https://www.youtube.com/results?search_query=Nu%20MAN%20O%20TO) |  | 2013-04-26 | `bf38acf3585b33f6` |
| `ambiguous-credit` `no-source` | James Brown & B.B. King (ft. Mickael Jackson) | Live at the Roxy, Los Angeles, 1983 |  | [find](https://www.youtube.com/results?search_query=James%20Brown%20%26%20B.B.%20King%20(ft.%20Mickael%20Jackson)%20Live%20at%20the%20Roxy%2C%20Los%20Angeles%2C%201983) |  | 2013-06-13 | `4702536528adefc9` |
| `widget-url` | M.O.O.N | Paris |  | [find](https://www.youtube.com/results?search_query=M.O.O.N%20Paris) |  | 2013-06-14 | `ccf4463a9852810f` |
| `no-source` | Al Green | Let’s Stay Together |  | [find](https://www.youtube.com/results?search_query=Al%20Green%20Let%E2%80%99s%20Stay%20Together) |  | 2013-06-17 | `2148979306071b30` |
| `no-source` | Road Rash II Music | Main Theme |  | [find](https://www.youtube.com/results?search_query=Road%20Rash%20II%20Music%20Main%20Theme) |  | 2013-06-17 | `2a6724731f8b7633` |
| `no-source` | Noir Désir | Le Grand Incendie |  | [find](https://www.youtube.com/results?search_query=Noir%20D%C3%A9sir%20Le%20Grand%20Incendie) |  | 2013-06-28 | `5ca54f1aaae8d165` |
| `read-qualifier` | Brian Eno | Another Green World |  | [find](https://www.youtube.com/results?search_query=Brian%20Eno%20Another%20Green%20World) |  | 2013-07-22 | `7555022afdd296d4` |
| `no-source` | Susan Christie | Rainy Day |  | [find](https://www.youtube.com/results?search_query=Susan%20Christie%20Rainy%20Day) |  | 2013-07-22 | `2b5cb6d9e9baf400` |
| `read-qualifier` | J.J. Cale | Cocaine |  | [find](https://www.youtube.com/results?search_query=J.J.%20Cale%20Cocaine) |  | 2013-07-23 | `e8418bf1fd72fd11` |
| `read-qualifier` `no-source` | Streets of Rage | Dilapidated Town |  | [find](https://www.youtube.com/results?search_query=Streets%20of%20Rage%20Dilapidated%20Town) |  | 2013-07-26 | `8f4916579556f7a9` |
| `read-qualifier` `ambiguous-credit` | Crosby, Stills & Nash | Cathedral |  | [find](https://www.youtube.com/results?search_query=Crosby%2C%20Stills%20%26%20Nash%20Cathedral) |  | 2013-07-29 | `4011b7e6269df718` |
| `no-source` `dead-source-in-body` | Kellylee Evans | Lose Yourself |  | [find](https://www.youtube.com/results?search_query=Kellylee%20Evans%20Lose%20Yourself) | `http://grooveshark.com/songWidget.swf` | 2013-08-10 | `139baeb34f6434a4` |
| `no-source` `dead-source-in-body` | Robin Trower | I Believe to my Soul |  | [find](https://www.youtube.com/results?search_query=Robin%20Trower%20I%20Believe%20to%20my%20Soul) | `http://grooveshark.com/songWidget.swf` | 2013-09-03 | `d6b61372b79f61c5` |
| `no-source` | Leonard Cohen | Master Song |  | [find](https://www.youtube.com/results?search_query=Leonard%20Cohen%20Master%20Song) |  | 2013-09-09 | `8039d19746d75348` |
| `no-source` | Laurie Anderson | O Superman |  | [find](https://www.youtube.com/results?search_query=Laurie%20Anderson%20O%20Superman) |  | 2013-09-17 | `a7f1965d57f76fc9` |
| `no-source` | Yasmine Hamdan | Ya Nass |  | [find](https://www.youtube.com/results?search_query=Yasmine%20Hamdan%20Ya%20Nass) |  | 2013-09-24 | `8a0ed46b7abb0ed8` |
| `no-source` | Dominik Eulberg | Der Tanz Der Gluehwuermchen |  | [find](https://www.youtube.com/results?search_query=Dominik%20Eulberg%20Der%20Tanz%20Der%20Gluehwuermchen) |  | 2013-09-26 | `68743d193606b3f2` |
| `read-qualifier` | Olivier Libaux (ft. Ambrosia Parlsey) | The Blood is Love |  | [find](https://www.youtube.com/results?search_query=Olivier%20Libaux%20(ft.%20Ambrosia%20Parlsey)%20The%20Blood%20is%20Love) |  | 2013-10-01 | `4e705a1bead7dd3d` |
| `read-qualifier` `no-source` | Karen Dalton | In My Own Time |  | [find](https://www.youtube.com/results?search_query=Karen%20Dalton%20In%20My%20Own%20Time) |  | 2013-10-04 | `99dbb5679cb9c405` |
| `widget-url` | Nils Frahm | Says |  | [find](https://www.youtube.com/results?search_query=Nils%20Frahm%20Says) |  | 2013-10-14 | `efeb9569407bc5ab` |
| `no-source` | The Tallest Man on Earth | The Gardener |  | [find](https://www.youtube.com/results?search_query=The%20Tallest%20Man%20on%20Earth%20The%20Gardener) |  | 2013-10-15 | `eb32420c23aeeabc` |
| `no-source` | Vincent Delerm | Deauville sans Trintignant |  | [find](https://www.youtube.com/results?search_query=Vincent%20Delerm%20Deauville%20sans%20Trintignant) |  | 2013-10-28 | `7f152eccb1348eb6` |
| `read-qualifier` | Lou Reed | Sweet Jane |  | [find](https://www.youtube.com/results?search_query=Lou%20Reed%20Sweet%20Jane) |  | 2013-10-31 | `eeb08605a944cc6d` |
| `read-qualifier` `no-source` | Sarah Vaughan | Blackbird |  | [find](https://www.youtube.com/results?search_query=Sarah%20Vaughan%20Blackbird) |  | 2013-11-03 | `b73dd6992fcd6423` |
| `read-qualifier` | Barry De Vorzon | Theme from “The Warriors” |  | [find](https://www.youtube.com/results?search_query=Barry%20De%20Vorzon%20Theme%20from%20%E2%80%9CThe%20Warriors%E2%80%9D) |  | 2013-11-07 | `ef7c02681661f74f` |
| `read-qualifier` `no-source` | Philip Glass | Koyaanisqatsi |  | [find](https://www.youtube.com/results?search_query=Philip%20Glass%20Koyaanisqatsi) |  | 2013-11-08 | `c4823676c0bc481d` |
| `ambiguous-credit` `no-source` | Mike Bloomfield, Al Kooper & Stephen Stills | Stop |  | [find](https://www.youtube.com/results?search_query=Mike%20Bloomfield%2C%20Al%20Kooper%20%26%20Stephen%20Stills%20Stop) |  | 2013-12-09 | `c2058288b6556189` |
| `no-source` | The Seatbelts | Gotta Knock a Little Harder |  | [find](https://www.youtube.com/results?search_query=The%20Seatbelts%20Gotta%20Knock%20a%20Little%20Harder) |  | 2013-12-15 | `280b88e8e5e9417d` |
| `no-source` | Elliott Smith | Needle in the Hay |  | [find](https://www.youtube.com/results?search_query=Elliott%20Smith%20Needle%20in%20the%20Hay) |  | 2014-01-06 | `ca116c56ad707b04` |
| `read-qualifier` | Oy | Doondari |  | [find](https://www.youtube.com/results?search_query=Oy%20Doondari) |  | 2014-01-27 | `c75bdbb61a280446` |
| `no-source` | Adriano Celentano | Prisencolinensinainciusol |  | [find](https://www.youtube.com/results?search_query=Adriano%20Celentano%20Prisencolinensinainciusol) |  | 2014-03-01 | `326bd14a76dda025` |
| `read-qualifier` | Azealia Banks | 212 |  | [find](https://www.youtube.com/results?search_query=Azealia%20Banks%20212) |  | 2014-03-01 | `7a368ecc3374c094` |
| `widget-url` | David August | Live at the Blue Parrot Club, Mexico, 2014 |  | [find](https://www.youtube.com/results?search_query=David%20August%20Live%20at%20the%20Blue%20Parrot%20Club%2C%20Mexico%2C%202014) |  | 2014-03-03 | `724d32fa10a59dbc` |
| `no-source` | Dillinger | Cocaine in my Brain |  | [find](https://www.youtube.com/results?search_query=Dillinger%20Cocaine%20in%20my%20Brain) |  | 2014-03-17 | `8ff8baebe91be694` |
| `read-qualifier` | The Velvet Underground | Oh Gin |  | [find](https://www.youtube.com/results?search_query=The%20Velvet%20Underground%20Oh%20Gin) |  | 2014-03-17 | `15aa153eec3b78c9` |
| `read-qualifier` | Bill Withers | Grandma’s Hands |  | [find](https://www.youtube.com/results?search_query=Bill%20Withers%20Grandma%E2%80%99s%20Hands) |  | 2014-03-17 | `3e8e0c9a9277f7d7` |
| `no-source` | Kiasmos | Looped |  | [find](https://www.youtube.com/results?search_query=Kiasmos%20Looped) |  | 2014-04-15 | `5948aea65619c535` |
| `no-source` | Tom Waits | Invitation to the Blues |  | [find](https://www.youtube.com/results?search_query=Tom%20Waits%20Invitation%20to%20the%20Blues) |  | 2014-04-17 | `79217c8bc3dba2e1` |
| `no-source` | Cymande | Dove |  | [find](https://www.youtube.com/results?search_query=Cymande%20Dove) |  | 2014-04-18 | `0da94c527884eb2a` |
| `read-qualifier` | Klaus Nomi | Cold Song |  | [find](https://www.youtube.com/results?search_query=Klaus%20Nomi%20Cold%20Song) |  | 2014-05-06 | `7bf3bd09716776fc` |
| `read-qualifier` | Seu Jorge | Life on Mars? |  | [find](https://www.youtube.com/results?search_query=Seu%20Jorge%20Life%20on%20Mars%3F) |  | 2014-05-07 | `a000e964af634ee8` |
| `no-source` | Weval | Detian |  | [find](https://www.youtube.com/results?search_query=Weval%20Detian) |  | 2014-05-26 | `4c11d5318a9f47b7` |
| `read-qualifier` | Emilíana Torrini | Animal Games |  | [find](https://www.youtube.com/results?search_query=Emil%C3%ADana%20Torrini%20Animal%20Games) |  | 2014-06-10 | `2caef2401358386d` |
| `ambiguous-credit` `no-source` | The Flaming Lips & Miley Cyrus | Lucy in the Sky with Diamonds |  | [find](https://www.youtube.com/results?search_query=The%20Flaming%20Lips%20%26%20Miley%20Cyrus%20Lucy%20in%20the%20Sky%20with%20Diamonds) |  | 2014-08-04 | `49bf9dbf65cb843e` |
| `no-source` | Kaaris | Bouchon de Liège |  | [find](https://www.youtube.com/results?search_query=Kaaris%20Bouchon%20de%20Li%C3%A8ge) |  | 2014-08-10 | `014c40a41b72c4c1` |
| `read-qualifier` `no-source` | eden ahbez | Eden’s Island |  | [find](https://www.youtube.com/results?search_query=eden%20ahbez%20Eden%E2%80%99s%20Island) |  | 2014-08-22 | `bcb70bb6365e9d34` |
| `read-qualifier` `ambiguous-credit` | Mister Modo & Ugly Mac Beer | Invasion |  | [find](https://www.youtube.com/results?search_query=Mister%20Modo%20%26%20Ugly%20Mac%20Beer%20Invasion) |  | 2014-09-10 | `b9037e43d2a78538` |
| `read-qualifier` `no-source` | Dualryan | Oceans |  | [find](https://www.youtube.com/results?search_query=Dualryan%20Oceans) |  | 2014-09-15 | `2df19cbf0be9920a` |
| `read-qualifier` | Darkside | Planet Caravan |  | [find](https://www.youtube.com/results?search_query=Darkside%20Planet%20Caravan) |  | 2014-09-17 | `f981f01bf86755a6` |
| `no-source` | Jorge Ben | Comanche |  | [find](https://www.youtube.com/results?search_query=Jorge%20Ben%20Comanche) |  | 2014-10-10 | `d555d9ab0d01088e` |
| `widget-url` | CSP06 ∆ Nicolas Jaar | Essential Mix |  | [find](https://www.youtube.com/results?search_query=CSP06%20%E2%88%86%20Nicolas%20Jaar%20Essential%20Mix) |  | 2014-10-10 | `e035f5106c2ba219` |
| `no-source` | Serge Richard | Jaques Chirac \| Je serai le président de tous les français |  | [find](https://www.youtube.com/results?search_query=Serge%20Richard%20Jaques%20Chirac%20%7C%20Je%20serai%20le%20pr%C3%A9sident%20de%20tous%20les%20fran%C3%A7ais) |  | 2014-10-11 | `0566d2cb321b0028` |
| `read-qualifier` | Claudine Longet | Jealous Guy / Don’t Let Me Down |  | [find](https://www.youtube.com/results?search_query=Claudine%20Longet%20Jealous%20Guy%20%2F%20Don%E2%80%99t%20Let%20Me%20Down) |  | 2014-10-11 | `eebc36ed87ebb2cf` |
| `no-source` | Charlie Winston | Unlike Me |  | [find](https://www.youtube.com/results?search_query=Charlie%20Winston%20Unlike%20Me) |  | 2014-10-12 | `69c2ffbb22176d02` |
| `read-qualifier` `no-source` | Alt-J | Lovely Day |  | [find](https://www.youtube.com/results?search_query=Alt-J%20Lovely%20Day) |  | 2014-10-13 | `819a1b42809c8f2d` |
| `no-source` | Jacques Brel | Marieke |  | [find](https://www.youtube.com/results?search_query=Jacques%20Brel%20Marieke) |  | 2014-10-14 | `64855c129db64e48` |
| `no-source` | Mafia K'1 Fry | Pour Ceux |  | [find](https://www.youtube.com/results?search_query=Mafia%20K'1%20Fry%20Pour%20Ceux) |  | 2014-11-07 | `726ed66b00117800` |
| `no-source` `dead-source-in-body` | The Octopus Project | Mmaj |  | [find](https://www.youtube.com/results?search_query=The%20Octopus%20Project%20Mmaj) | `http://grooveshark.com/songWidget.swf` | 2014-11-19 | `f4ad921c2c4e3d4d` |
| `no-source` | The Spits | Die Die Die |  | [find](https://www.youtube.com/results?search_query=The%20Spits%20Die%20Die%20Die) |  | 2014-11-21 | `426d4f19874747a7` |
| `no-source` | Rob | Make it Fast, Make it Slow |  | [find](https://www.youtube.com/results?search_query=Rob%20Make%20it%20Fast%2C%20Make%20it%20Slow) |  | 2015-01-13 | `1ade41e91c9d502f` |
| `no-source` | Caribou | Back Home |  | [find](https://www.youtube.com/results?search_query=Caribou%20Back%20Home) |  | 2015-01-26 | `97142e7ac15748d5` |
| `no-source` | Dona Dumitru Siminica | De Trei Ani Nu Dau Pe-acasa |  | [find](https://www.youtube.com/results?search_query=Dona%20Dumitru%20Siminica%20De%20Trei%20Ani%20Nu%20Dau%20Pe-acasa) |  | 2015-01-28 | `7a70b1bcb032d6e4` |
| `read-qualifier` `no-source` | Talking Heads | Stop Making Sense Live |  | [find](https://www.youtube.com/results?search_query=Talking%20Heads%20Stop%20Making%20Sense%20Live) |  | 2015-02-09 | `ba166ad46121488e` |
| `no-source` | Giorgio Murderer | Primitive World |  | [find](https://www.youtube.com/results?search_query=Giorgio%20Murderer%20Primitive%20World) |  | 2015-02-16 | `1f6109c2728a32df` |
| `no-source` | Nat King Cole | Tres Palabras |  | [find](https://www.youtube.com/results?search_query=Nat%20King%20Cole%20Tres%20Palabras) |  | 2015-02-16 | `1a1b1cbc261e66b5` |
| `no-source` | Nick Drake | Saturday Sun |  | [find](https://www.youtube.com/results?search_query=Nick%20Drake%20Saturday%20Sun) |  | 2015-03-19 | `3d798f7430e70d6a` |
| `no-source` | Parquet Courts | These Boots are Made for Walkin’ |  | [find](https://www.youtube.com/results?search_query=Parquet%20Courts%20These%20Boots%20are%20Made%20for%20Walkin%E2%80%99) |  | 2015-03-23 | `a9a75e582c5340ba` |
| `read-qualifier` | Radiohead | Reckoner |  | [find](https://www.youtube.com/results?search_query=Radiohead%20Reckoner) |  | 2015-04-20 | `2378552e70e3a1b1` |
| `read-qualifier` | The Cure | Another Journey by Train |  | [find](https://www.youtube.com/results?search_query=The%20Cure%20Another%20Journey%20by%20Train) |  | 2015-05-06 | `9966d997e013cbda` |
| `no-source` | Serge Gainsbourg | La Noyée |  | [find](https://www.youtube.com/results?search_query=Serge%20Gainsbourg%20La%20Noy%C3%A9e) |  | 2015-07-12 | `788aa840955a574f` |
| `read-qualifier` | Lee Moses | Bad Girl |  | [find](https://www.youtube.com/results?search_query=Lee%20Moses%20Bad%20Girl) |  | 2015-07-21 | `6ad2e74400b3242d` |
| `no-source` | Jorge Ben | Bebete Vãobora |  | [find](https://www.youtube.com/results?search_query=Jorge%20Ben%20Bebete%20V%C3%A3obora) |  | 2015-08-28 | `74f2fd7404a47672` |
| `read-qualifier` `no-source` | Mild High Club | Timeline |  | [find](https://www.youtube.com/results?search_query=Mild%20High%20Club%20Timeline) |  | 2015-10-27 | `964728f86d26cf89` |
| `read-qualifier` `ambiguous-credit` | Nick Cave & The Bad Seeds | Higgs Boson Blues |  | [find](https://www.youtube.com/results?search_query=Nick%20Cave%20%26%20The%20Bad%20Seeds%20Higgs%20Boson%20Blues) |  | 2015-11-04 | `d12dd5b397628f1e` |
| `no-source` | John Maus | My Whole World is Coming Apart |  | [find](https://www.youtube.com/results?search_query=John%20Maus%20My%20Whole%20World%20is%20Coming%20Apart) |  | 2015-12-04 | `249df31826f374b6` |
| `no-source` | Bass Drum of Death | Velvet Itch |  | [find](https://www.youtube.com/results?search_query=Bass%20Drum%20of%20Death%20Velvet%20Itch) |  | 2015-12-07 | `9ec8b8ddc953dc54` |
| `read-qualifier` `no-source` | Kevin Ayers | The Lady Rachel |  | [find](https://www.youtube.com/results?search_query=Kevin%20Ayers%20The%20Lady%20Rachel) |  | 2016-01-06 | `37d9669a71da5415` |
| `no-source` | Rival Consoles | Odyssey / Sonne (Bonus track version, Album, 2015 |  | [find](https://www.youtube.com/results?search_query=Rival%20Consoles%20Odyssey%20%2F%20Sonne%20(Bonus%20track%20version%2C%20Album%2C%202015) |  | 2016-01-08 | `ea83ec9e36bfbe6a` |
| `read-qualifier` | M-H-D | Afro Trap |  | [find](https://www.youtube.com/results?search_query=M-H-D%20Afro%20Trap) |  | 2016-01-19 | `3ff2c0fbfc83ae15` |
| `ambiguous-credit` | Elis Regina & Tom Jobim | Aguas de Março |  | [find](https://www.youtube.com/results?search_query=Elis%20Regina%20%26%20Tom%20Jobim%20Aguas%20de%20Mar%C3%A7o) |  | 2016-09-02 | `423ba51e40487b81` |
| `read-qualifier` | Tacocat | Crimson Wave |  | [find](https://www.youtube.com/results?search_query=Tacocat%20Crimson%20Wave) |  | 2016-09-03 | `28a130706eec3cd7` |
| `read-qualifier` | Nina Simone | Ain’t Got No - I Got Life |  | [find](https://www.youtube.com/results?search_query=Nina%20Simone%20Ain%E2%80%99t%20Got%20No%20-%20I%20Got%20Life) |  | 2016-09-09 | `b547f900a99cb250` |
| `no-source` | Rita Pavone | Viva la pappa col pomodorro |  | [find](https://www.youtube.com/results?search_query=Rita%20Pavone%20Viva%20la%20pappa%20col%20pomodorro) |  | 2016-09-16 | `27a7743cfba92c03` |
| `no-source` | The Soft Boys | You’ll Have To Go Sideways |  | [find](https://www.youtube.com/results?search_query=The%20Soft%20Boys%20You%E2%80%99ll%20Have%20To%20Go%20Sideways) |  | 2016-09-23 | `3ea0ad742de234a3` |
| `read-qualifier` | Mary Clark | Take Me I’m Yours |  | [find](https://www.youtube.com/results?search_query=Mary%20Clark%20Take%20Me%20I%E2%80%99m%20Yours) |  | 2016-09-30 | `8eab37824d1d8336` |
| `no-source` | Marijata | I Walk Alone |  | [find](https://www.youtube.com/results?search_query=Marijata%20I%20Walk%20Alone) |  | 2016-10-07 | `ac3483892450b598` |
| `no-source` | Jeremy Steig | Howlin’ For Judy |  | [find](https://www.youtube.com/results?search_query=Jeremy%20Steig%20Howlin%E2%80%99%20For%20Judy) |  | 2016-10-21 | `fe3a5100c2cdc046` |
| `no-source` | The Normal | Warm Leatherette |  | [find](https://www.youtube.com/results?search_query=The%20Normal%20Warm%20Leatherette) |  | 2016-11-25 | `20be5559c2d50a24` |
| `no-source` | Fat White Family | Touch The Leather |  | [find](https://www.youtube.com/results?search_query=Fat%20White%20Family%20Touch%20The%20Leather) |  | 2016-11-25 | `84a338995933e188` |
| `no-source` | The Jim Carroll Band | People Who Died |  | [find](https://www.youtube.com/results?search_query=The%20Jim%20Carroll%20Band%20People%20Who%20Died) |  | 2017-04-18 | `17975cb5564435c5` |
| `no-source` | Velvet Underground | Cool It Down |  | [find](https://www.youtube.com/results?search_query=Velvet%20Underground%20Cool%20It%20Down) |  | 2017-04-22 | `25eaae5619c40e39` |
| `widget-url` | Average Rap Band | El Sol Reprise |  | [find](https://www.youtube.com/results?search_query=Average%20Rap%20Band%20El%20Sol%20Reprise) |  | 2017-04-23 | `eb39ec3e282c9e9e` |
| `no-source` | Louise Bourgeois | Otte |  | [find](https://www.youtube.com/results?search_query=Louise%20Bourgeois%20Otte) |  | 2017-04-27 | `17e62d752387e950` |
| `no-source` | Reykjavíkurdætur | Hæpið |  | [find](https://www.youtube.com/results?search_query=Reykjav%C3%ADkurd%C3%A6tur%20H%C3%A6pi%C3%B0) |  | 2017-04-28 | `135d9afd259630f6` |
| `no-source` | Odetta | Gallows Pole |  | [find](https://www.youtube.com/results?search_query=Odetta%20Gallows%20Pole) |  | 2017-04-30 | `76f3dd4fc28956fa` |
| `read-qualifier` | Giuseppe Verdi | Va, Pensiero |  | [find](https://www.youtube.com/results?search_query=Giuseppe%20Verdi%20Va%2C%20Pensiero) |  | 2017-05-02 | `04bbb770ef9b584d` |
| `no-source` | The Melodians | The Rivers of Babylon |  | [find](https://www.youtube.com/results?search_query=The%20Melodians%20The%20Rivers%20of%20Babylon) |  | 2017-05-04 | `8b337715d0d15974` |
| `no-source` | Christine Laume | Rouge rouge |  | [find](https://www.youtube.com/results?search_query=Christine%20Laume%20Rouge%20rouge) |  | 2017-05-11 | `e1cce9830392091a` |
| `ambiguous-credit` `no-source` | Brigitte Fontaine, The Art Ensemble of Chicago & Areski Belkacem | Comme à la radio |  | [find](https://www.youtube.com/results?search_query=Brigitte%20Fontaine%2C%20The%20Art%20Ensemble%20of%20Chicago%20%26%20Areski%20Belkacem%20Comme%20%C3%A0%20la%20radio) |  | 2017-05-12 | `ae6069064c8663b1` |
| `read-qualifier` `widget-url` | Janice McClain | Giving My Love |  | [find](https://www.youtube.com/results?search_query=Janice%20McClain%20Giving%20My%20Love) |  | 2017-05-17 | `63fa33ab61c14a03` |
| `no-source` | Cymande | Brothers On The Slide |  | [find](https://www.youtube.com/results?search_query=Cymande%20Brothers%20On%20The%20Slide) |  | 2017-05-21 | `4a4a3e70f01f5a9a` |
| `read-qualifier` | J.J. Cale | Bringin’ it Back |  | [find](https://www.youtube.com/results?search_query=J.J.%20Cale%20Bringin%E2%80%99%20it%20Back) |  | 2017-05-22 | `9b9349f3c7ceae47` |
| `widget-url` | Vanishing Twins | Eggs |  | [find](https://www.youtube.com/results?search_query=Vanishing%20Twins%20Eggs) |  | 2017-05-28 | `141319893aaa4127` |
| `read-qualifier` | Tom Waits | Please wake me up |  | [find](https://www.youtube.com/results?search_query=Tom%20Waits%20Please%20wake%20me%20up) |  | 2017-05-31 | `5ae67737be63027d` |
| `read-qualifier` | Richard O’Brien | Science Fiction / Double Feature |  | [find](https://www.youtube.com/results?search_query=Richard%20O%E2%80%99Brien%20Science%20Fiction%20%2F%20Double%20Feature) |  | 2017-06-03 | `7d1e3150cd3cb553` |
| `read-qualifier` | Courtney Barnett | Pedestrian at Best |  | [find](https://www.youtube.com/results?search_query=Courtney%20Barnett%20Pedestrian%20at%20Best) |  | 2017-06-06 | `04b45ef21cc8b323` |
| `no-source` | Charanjit Singh | Raga Madhuvanti |  | [find](https://www.youtube.com/results?search_query=Charanjit%20Singh%20Raga%20Madhuvanti) |  | 2017-06-11 | `6224762d60983922` |
| `read-qualifier` | Ancient Methods | DJ Set |  | [find](https://www.youtube.com/results?search_query=Ancient%20Methods%20DJ%20Set) |  | 2017-06-12 | `3b5b27762d93e544` |
| `no-source` | Taxi Girl | Cherchez le garçon |  | [find](https://www.youtube.com/results?search_query=Taxi%20Girl%20Cherchez%20le%20gar%C3%A7on) |  | 2018-02-03 | `743c9850fe7045b2` |
| `ambiguous-credit` | Polo & Pan | Dragon Pom Z |  | [find](https://www.youtube.com/results?search_query=Polo%20%26%20Pan%20Dragon%20Pom%20Z) |  | 2018-02-03 | `448ffd3271df9fe0` |
| `unsplit-title` |  |  |  | [find](https://www.youtube.com/results?search_query=%20) |  | 2018-02-03 | `4fd31993e19e285a` |
| `no-source` | Katerine | Je vous emmerde |  | [find](https://www.youtube.com/results?search_query=Katerine%20Je%20vous%20emmerde) |  | 2018-02-03 | `bc7cd21af3394579` |
| `ambiguous-credit` | Murcof & Vanessa Wagner | Gnossienne No. 3 |  | [find](https://www.youtube.com/results?search_query=Murcof%20%26%20Vanessa%20Wagner%20Gnossienne%20No.%203) |  | 2019-01-31 | `bc4ce7db5ed23adb` |

Every row traces back to Tumblr through its post id: the recording it names carries the
permalink as an identity source.
