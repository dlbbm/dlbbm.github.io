# Import review

Written by `npm run data:import`. 159 of 401 posts need a look.

**Fill the `source` column** with a URL that plays the track — the `find` link opens a
YouTube search for it — and leave `note` for anything you want to say about the row.
The `post` column is the id `npm run post:edit -- <id>` takes.

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

| post | date | artist | song | flags | find | source | note |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `cb8981d62fe50014` | 2012-12-15 | Death In Vegas | All That Glitters | `no-source` | [find](https://www.youtube.com/results?search_query=Death%20In%20Vegas%20All%20That%20Glitters) |  |  |
| `d0e028372c2dbe3f` | 2012-12-15 | IS Tropical | Lies | `no-source` | [find](https://www.youtube.com/results?search_query=IS%20Tropical%20Lies) |  |  |
| `afaac3e3981abf20` | 2012-12-16 | Connan Mockassin | Forever Dolphin Love | `read-qualifier` | [find](https://www.youtube.com/results?search_query=Connan%20Mockassin%20Forever%20Dolphin%20Love) |  |  |
| `24202b69e2377cfd` | 2012-12-16 | F.J. Mc Mahon | The Spirit of the Golden Juice | `no-source` | [find](https://www.youtube.com/results?search_query=F.J.%20Mc%20Mahon%20The%20Spirit%20of%20the%20Golden%20Juice) |  |  |
| `43fea30aabc59b73` | 2012-12-16 | The Doors | Cars Hiss By My Window | `no-source` | [find](https://www.youtube.com/results?search_query=The%20Doors%20Cars%20Hiss%20By%20My%20Window) |  |  |
| `47e9106f863f0eb6` | 2012-12-16 | Brigitte | Ma Benz | `read-qualifier` | [find](https://www.youtube.com/results?search_query=Brigitte%20Ma%20Benz) |  |  |
| `224a400d2043f096` | 2012-12-16 | Nicone & Sascha Braemer (ft. Narra) | Caje | `ambiguous-credit` | [find](https://www.youtube.com/results?search_query=Nicone%20%26%20Sascha%20Braemer%20(ft.%20Narra)%20Caje) |  |  |
| `628467957f04f31b` | 2012-12-16 | J.J. Cale | Since You Said Goodbye | `no-source` | [find](https://www.youtube.com/results?search_query=J.J.%20Cale%20Since%20You%20Said%20Goodbye) |  |  |
| `9911d0d5f421cae1` | 2012-12-16 | Pink Floyd | Lucifer Sam | `no-source` | [find](https://www.youtube.com/results?search_query=Pink%20Floyd%20Lucifer%20Sam) |  |  |
| `b665fbcf097ceb92` | 2012-12-16 | Serge Gainsbourg | Comme un Boomerang | `no-source` `dead-source-in-body` | [find](https://www.youtube.com/results?search_query=Serge%20Gainsbourg%20Comme%20un%20Boomerang) |  | `http://grooveshark.com/songWidget.swf` |
| `d8bf696f4163e632` | 2012-12-16 | Rone | La Dame Blanche | `read-qualifier` | [find](https://www.youtube.com/results?search_query=Rone%20La%20Dame%20Blanche) |  |  |
| `402fa4115e2fefd1` | 2012-12-16 | Tijuana Panthers | Angie | `no-source` | [find](https://www.youtube.com/results?search_query=Tijuana%20Panthers%20Angie) |  |  |
| `06a724b49fd7dc2e` | 2012-12-18 | Pachanga Boys | Time | `no-source` | [find](https://www.youtube.com/results?search_query=Pachanga%20Boys%20Time) |  |  |
| `4c452591530a4646` | 2012-12-19 | Chromatics | Into the Black | `read-qualifier` `no-source` | [find](https://www.youtube.com/results?search_query=Chromatics%20Into%20the%20Black) |  |  |
| `d05be17966b8f7f9` | 2012-12-29 | Santo & Johnny | Venus | `ambiguous-credit` `no-source` | [find](https://www.youtube.com/results?search_query=Santo%20%26%20Johnny%20Venus) |  |  |
| `e48a4afde395efc0` | 2012-12-31 | Pearl Jam | Do The Evolution | `no-source` | [find](https://www.youtube.com/results?search_query=Pearl%20Jam%20Do%20The%20Evolution) |  |  |
| `197f9a974507c0f4` | 2013-01-01 | Os Mutantes | A Minha Menina | `no-source` | [find](https://www.youtube.com/results?search_query=Os%20Mutantes%20A%20Minha%20Menina) |  |  |
| `fdf37ce707a0a743` | 2013-01-02 | Miles Davis | Ascenseur pour l'Échafaud | `no-source` | [find](https://www.youtube.com/results?search_query=Miles%20Davis%20Ascenseur%20pour%20l'%C3%89chafaud) |  |  |
| `eee83bcd2885dafc` | 2013-01-04 | Pusha T ft. Tyler, The Creator | Trouble On My Mind | `ambiguous-credit` | [find](https://www.youtube.com/results?search_query=Pusha%20T%20ft.%20Tyler%2C%20The%20Creator%20Trouble%20On%20My%20Mind) |  |  |
| `4a6f939e6b1aa56d` | 2013-01-06 | Gil Scott-Heron | The Revolution Will Not Be Televised | `no-source` | [find](https://www.youtube.com/results?search_query=Gil%20Scott-Heron%20The%20Revolution%20Will%20Not%20Be%20Televised) |  |  |
| `29c7f578bc5fe0c1` | 2013-01-08 | Grandmaster Flash | The Message | `read-qualifier` `no-source` | [find](https://www.youtube.com/results?search_query=Grandmaster%20Flash%20The%20Message) |  |  |
| `3af8df9dcf16cc21` | 2013-01-11 | Joy Division | Digital | `no-source` | [find](https://www.youtube.com/results?search_query=Joy%20Division%20Digital) |  |  |
| `5a86b5611540c426` | 2013-01-11 | Niki & the Dove | Mother Protect | `read-qualifier` `ambiguous-credit` | [find](https://www.youtube.com/results?search_query=Niki%20%26%20the%20Dove%20Mother%20Protect) |  |  |
| `1209c605d33b0950` | 2013-01-12 | Dye | Fantasy | `no-source` | [find](https://www.youtube.com/results?search_query=Dye%20Fantasy) |  |  |
| `8dd3f0f254de22fb` | 2013-01-14 | Julee Cruise | The World Spins | `no-source` | [find](https://www.youtube.com/results?search_query=Julee%20Cruise%20The%20World%20Spins) |  |  |
| `a828fdee9d1b91cf` | 2013-01-20 | Alaska In Winter | Berlin | `no-source` | [find](https://www.youtube.com/results?search_query=Alaska%20In%20Winter%20Berlin) |  |  |
| `90b2c1dcbf16ae59` | 2013-01-24 | Klangkarussell | Sonnentanz | `no-source` | [find](https://www.youtube.com/results?search_query=Klangkarussell%20Sonnentanz) |  |  |
| `0d27a10020d72559` | 2013-01-25 | Outkast | Hey Ya | `no-source` | [find](https://www.youtube.com/results?search_query=Outkast%20Hey%20Ya) |  |  |
| `fb39445edfe2d6cb` | 2013-01-25 | Scrubs | Hey Ya | `read-qualifier` `no-source` | [find](https://www.youtube.com/results?search_query=Scrubs%20Hey%20Ya) |  |  |
| `1c8031c1109b7d12` | 2013-01-25 | Cocoon | American Boy | `read-qualifier` | [find](https://www.youtube.com/results?search_query=Cocoon%20American%20Boy) |  |  |
| `9fd873c170165e07` | 2013-01-25 | Amadou & Mariam | Sabali | `ambiguous-credit` | [find](https://www.youtube.com/results?search_query=Amadou%20%26%20Mariam%20Sabali) |  |  |
| `7f308bf6d8ff6d83` | 2013-01-29 | Franz Liszt | Hungarian Rhapsody N°2 | `no-source` | [find](https://www.youtube.com/results?search_query=Franz%20Liszt%20Hungarian%20Rhapsody%20N%C2%B02) |  |  |
| `8ade5337bf31ea06` | 2013-01-30 | Frank Sinatra & Nancy Sinatra | Something Stupid | `ambiguous-credit` | [find](https://www.youtube.com/results?search_query=Frank%20Sinatra%20%26%20Nancy%20Sinatra%20Something%20Stupid) |  |  |
| `f004f4ada18f26d1` | 2013-02-01 | Jan Turkenburg | In My Spaceship | `read-qualifier` | [find](https://www.youtube.com/results?search_query=Jan%20Turkenburg%20In%20My%20Spaceship) |  |  |
| `b203aad850e025f7` | 2013-02-04 | Slow Club | Never Look Back | `read-qualifier` | [find](https://www.youtube.com/results?search_query=Slow%20Club%20Never%20Look%20Back) |  |  |
| `cdbfc0d60b4be975` | 2013-02-05 | Macklemore & Ryan Lewis ft. Wanz | Thrift Shop | `ambiguous-credit` | [find](https://www.youtube.com/results?search_query=Macklemore%20%26%20Ryan%20Lewis%20ft.%20Wanz%20Thrift%20Shop) |  |  |
| `5537ff4210fde031` | 2013-02-12 | Air | Empty House | `no-source` | [find](https://www.youtube.com/results?search_query=Air%20Empty%20House) |  |  |
| `ebd08419067e54a3` | 2013-03-13 | Black Sabbath | Planet Caravan | `no-source` | [find](https://www.youtube.com/results?search_query=Black%20Sabbath%20Planet%20Caravan) |  |  |
| `a2f7c9f22a8c8847` | 2013-03-14 | Mr. Fox | Party Track | `no-source` | [find](https://www.youtube.com/results?search_query=Mr.%20Fox%20Party%20Track) |  |  |
| `2f45ca8b95e9548c` | 2013-03-16 | Reputante | Lock Me Up | `no-source` | [find](https://www.youtube.com/results?search_query=Reputante%20Lock%20Me%20Up) |  |  |
| `7fbed46e8ae27b14` | 2013-04-03 | The Painted Ship | Frustration | `no-source` | [find](https://www.youtube.com/results?search_query=The%20Painted%20Ship%20Frustration) |  |  |
| `b56c5e95f9d79308` | 2013-04-05 | Pink Floyd | Echoes | `no-source` | [find](https://www.youtube.com/results?search_query=Pink%20Floyd%20Echoes) |  |  |
| `2d500e2894895911` | 2013-04-05 | The Velvet Underground | Oh! Sweet Nuthin’ | `no-source` | [find](https://www.youtube.com/results?search_query=The%20Velvet%20Underground%20Oh!%20Sweet%20Nuthin%E2%80%99) |  |  |
| `dc2e5481971683ef` | 2013-04-19 | Daft Punk | Rock n’ Roll | `no-source` | [find](https://www.youtube.com/results?search_query=Daft%20Punk%20Rock%20n%E2%80%99%20Roll) |  |  |
| `26c18da9ee8edaf7` | 2013-04-21 | Maxence Cyrin | D.A.N.C.E | `read-qualifier` `no-source` `dead-source-in-body` | [find](https://www.youtube.com/results?search_query=Maxence%20Cyrin%20D.A.N.C.E) |  | `http://soundowl.com/track/675/maxence-cyrin-dance-justice-cover` |
| `44b14f1cd6c9dd0f` | 2013-04-25 | Sixto Rodriguez | Crucify Your Mind | `no-source` | [find](https://www.youtube.com/results?search_query=Sixto%20Rodriguez%20Crucify%20Your%20Mind) |  |  |
| `20c4a8bd1dd6e1d7` | 2013-04-26 | Nu | MAN O TO | `no-source` | [find](https://www.youtube.com/results?search_query=Nu%20MAN%20O%20TO) |  |  |
| `f642c43e88300137` | 2013-06-13 | James Brown & B.B. King (ft. Mickael Jackson) | Live at the Roxy, Los Angeles, 1983 | `ambiguous-credit` `no-source` | [find](https://www.youtube.com/results?search_query=James%20Brown%20%26%20B.B.%20King%20(ft.%20Mickael%20Jackson)%20Live%20at%20the%20Roxy%2C%20Los%20Angeles%2C%201983) |  |  |
| `de84cd9e1f7985d8` | 2013-06-14 | M.O.O.N | Paris | `widget-url` | [find](https://www.youtube.com/results?search_query=M.O.O.N%20Paris) |  |  |
| `3324178f7141d9eb` | 2013-06-17 | Al Green | Let’s Stay Together | `no-source` | [find](https://www.youtube.com/results?search_query=Al%20Green%20Let%E2%80%99s%20Stay%20Together) |  |  |
| `ad6c3c3673e29de2` | 2013-06-17 | Road Rash II Music | Main Theme | `no-source` | [find](https://www.youtube.com/results?search_query=Road%20Rash%20II%20Music%20Main%20Theme) |  |  |
| `66a00a89f88abe78` | 2013-06-28 | Noir Désir | Le Grand Incendie | `no-source` | [find](https://www.youtube.com/results?search_query=Noir%20D%C3%A9sir%20Le%20Grand%20Incendie) |  |  |
| `eefb999d8454c8c4` | 2013-07-22 | Brian Eno | Another Green World | `read-qualifier` | [find](https://www.youtube.com/results?search_query=Brian%20Eno%20Another%20Green%20World) |  |  |
| `90c030d721fc5114` | 2013-07-22 | Susan Christie | Rainy Day | `no-source` | [find](https://www.youtube.com/results?search_query=Susan%20Christie%20Rainy%20Day) |  |  |
| `a5246eabb234ae56` | 2013-07-23 | J.J. Cale | Cocaine | `read-qualifier` | [find](https://www.youtube.com/results?search_query=J.J.%20Cale%20Cocaine) |  |  |
| `d8cce87b92be99ac` | 2013-07-26 | Streets of Rage | Dilapidated Town | `read-qualifier` `no-source` | [find](https://www.youtube.com/results?search_query=Streets%20of%20Rage%20Dilapidated%20Town) |  |  |
| `227d289db0460d0f` | 2013-07-29 | Crosby, Stills & Nash | Cathedral | `read-qualifier` `ambiguous-credit` | [find](https://www.youtube.com/results?search_query=Crosby%2C%20Stills%20%26%20Nash%20Cathedral) |  |  |
| `a967e4d351fb85fd` | 2013-08-10 | Kellylee Evans | Lose Yourself | `no-source` `dead-source-in-body` | [find](https://www.youtube.com/results?search_query=Kellylee%20Evans%20Lose%20Yourself) |  | `http://grooveshark.com/songWidget.swf` |
| `d3ba35760c9bb17e` | 2013-09-03 | Robin Trower | I Believe to my Soul | `no-source` `dead-source-in-body` | [find](https://www.youtube.com/results?search_query=Robin%20Trower%20I%20Believe%20to%20my%20Soul) |  | `http://grooveshark.com/songWidget.swf` |
| `dfe4c3c7404c0608` | 2013-09-09 | Leonard Cohen | Master Song | `no-source` | [find](https://www.youtube.com/results?search_query=Leonard%20Cohen%20Master%20Song) |  |  |
| `e6168064e21812c8` | 2013-09-17 | Laurie Anderson | O Superman | `no-source` | [find](https://www.youtube.com/results?search_query=Laurie%20Anderson%20O%20Superman) |  |  |
| `a798efd57750c649` | 2013-09-24 | Yasmine Hamdan | Ya Nass | `no-source` | [find](https://www.youtube.com/results?search_query=Yasmine%20Hamdan%20Ya%20Nass) |  |  |
| `5a57cbd91a14c509` | 2013-09-26 | Dominik Eulberg | Der Tanz Der Gluehwuermchen | `no-source` | [find](https://www.youtube.com/results?search_query=Dominik%20Eulberg%20Der%20Tanz%20Der%20Gluehwuermchen) |  |  |
| `8ef434ade041040a` | 2013-10-01 | Olivier Libaux (ft. Ambrosia Parlsey) | The Blood is Love | `read-qualifier` | [find](https://www.youtube.com/results?search_query=Olivier%20Libaux%20(ft.%20Ambrosia%20Parlsey)%20The%20Blood%20is%20Love) |  |  |
| `1c2d4414fb388a96` | 2013-10-04 | Karen Dalton | In My Own Time | `read-qualifier` `no-source` | [find](https://www.youtube.com/results?search_query=Karen%20Dalton%20In%20My%20Own%20Time) |  |  |
| `2271cb872de36244` | 2013-10-14 | Nils Frahm | Says | `widget-url` | [find](https://www.youtube.com/results?search_query=Nils%20Frahm%20Says) |  |  |
| `19f8402093766767` | 2013-10-15 | The Tallest Man on Earth | The Gardener | `no-source` | [find](https://www.youtube.com/results?search_query=The%20Tallest%20Man%20on%20Earth%20The%20Gardener) |  |  |
| `484ef6ebb4028a49` | 2013-10-28 | Vincent Delerm | Deauville sans Trintignant | `no-source` | [find](https://www.youtube.com/results?search_query=Vincent%20Delerm%20Deauville%20sans%20Trintignant) |  |  |
| `248fd3b3d993657e` | 2013-10-31 | Lou Reed | Sweet Jane | `read-qualifier` | [find](https://www.youtube.com/results?search_query=Lou%20Reed%20Sweet%20Jane) |  |  |
| `e3d7f38f4099f01a` | 2013-11-03 | Sarah Vaughan | Blackbird | `read-qualifier` `no-source` | [find](https://www.youtube.com/results?search_query=Sarah%20Vaughan%20Blackbird) |  |  |
| `ecad310a611d790d` | 2013-11-07 | Barry De Vorzon | Theme from “The Warriors” | `read-qualifier` | [find](https://www.youtube.com/results?search_query=Barry%20De%20Vorzon%20Theme%20from%20%E2%80%9CThe%20Warriors%E2%80%9D) |  |  |
| `bd0cd4908ab2ff8f` | 2013-11-08 | Philip Glass | Koyaanisqatsi | `read-qualifier` `no-source` | [find](https://www.youtube.com/results?search_query=Philip%20Glass%20Koyaanisqatsi) |  |  |
| `0634175a383bc4dd` | 2013-12-09 | Mike Bloomfield, Al Kooper & Stephen Stills | Stop | `ambiguous-credit` `no-source` | [find](https://www.youtube.com/results?search_query=Mike%20Bloomfield%2C%20Al%20Kooper%20%26%20Stephen%20Stills%20Stop) |  |  |
| `7f1186d5c139457c` | 2013-12-15 | The Seatbelts | Gotta Knock a Little Harder | `no-source` | [find](https://www.youtube.com/results?search_query=The%20Seatbelts%20Gotta%20Knock%20a%20Little%20Harder) |  |  |
| `dbad11a8ac80220c` | 2014-01-06 | Elliott Smith | Needle in the Hay | `no-source` | [find](https://www.youtube.com/results?search_query=Elliott%20Smith%20Needle%20in%20the%20Hay) |  |  |
| `cd50c6aad7aada5f` | 2014-01-27 | Oy | Doondari | `read-qualifier` | [find](https://www.youtube.com/results?search_query=Oy%20Doondari) |  |  |
| `c5860927b4393673` | 2014-03-01 | Adriano Celentano | Prisencolinensinainciusol | `no-source` | [find](https://www.youtube.com/results?search_query=Adriano%20Celentano%20Prisencolinensinainciusol) |  |  |
| `6a81de51cede82f7` | 2014-03-01 | Azealia Banks | 212 | `read-qualifier` | [find](https://www.youtube.com/results?search_query=Azealia%20Banks%20212) |  |  |
| `ea07a0c0a7f83655` | 2014-03-03 | David August | Live at the Blue Parrot Club, Mexico, 2014 | `widget-url` | [find](https://www.youtube.com/results?search_query=David%20August%20Live%20at%20the%20Blue%20Parrot%20Club%2C%20Mexico%2C%202014) |  |  |
| `4b6b6918ca093019` | 2014-03-17 | Dillinger | Cocaine in my Brain | `no-source` | [find](https://www.youtube.com/results?search_query=Dillinger%20Cocaine%20in%20my%20Brain) |  |  |
| `1a94f4e274e7c927` | 2014-03-17 | The Velvet Underground | Oh Gin | `read-qualifier` | [find](https://www.youtube.com/results?search_query=The%20Velvet%20Underground%20Oh%20Gin) |  |  |
| `f9b733b78f0eb3c0` | 2014-03-17 | Bill Withers | Grandma’s Hands | `read-qualifier` | [find](https://www.youtube.com/results?search_query=Bill%20Withers%20Grandma%E2%80%99s%20Hands) |  |  |
| `71efffe33e265af2` | 2014-04-15 | Kiasmos | Looped | `no-source` | [find](https://www.youtube.com/results?search_query=Kiasmos%20Looped) |  |  |
| `9fa78cba00d4507f` | 2014-04-17 | Tom Waits | Invitation to the Blues | `no-source` | [find](https://www.youtube.com/results?search_query=Tom%20Waits%20Invitation%20to%20the%20Blues) |  |  |
| `48f12833d0fbbffe` | 2014-04-18 | Cymande | Dove | `no-source` | [find](https://www.youtube.com/results?search_query=Cymande%20Dove) |  |  |
| `fd15e6b48c9ea6a7` | 2014-05-06 | Klaus Nomi | Cold Song | `read-qualifier` | [find](https://www.youtube.com/results?search_query=Klaus%20Nomi%20Cold%20Song) |  |  |
| `88b61bcdc0123636` | 2014-05-07 | Seu Jorge | Life on Mars? | `read-qualifier` | [find](https://www.youtube.com/results?search_query=Seu%20Jorge%20Life%20on%20Mars%3F) |  |  |
| `34af7df2b90c25be` | 2014-05-26 | Weval | Detian | `no-source` | [find](https://www.youtube.com/results?search_query=Weval%20Detian) |  |  |
| `61305158b79218ba` | 2014-06-10 | Emilíana Torrini | Animal Games | `read-qualifier` | [find](https://www.youtube.com/results?search_query=Emil%C3%ADana%20Torrini%20Animal%20Games) |  |  |
| `1c5daaae1377d897` | 2014-08-04 | The Flaming Lips & Miley Cyrus | Lucy in the Sky with Diamonds | `ambiguous-credit` `no-source` | [find](https://www.youtube.com/results?search_query=The%20Flaming%20Lips%20%26%20Miley%20Cyrus%20Lucy%20in%20the%20Sky%20with%20Diamonds) |  |  |
| `19065f5f55315165` | 2014-08-10 | Kaaris | Bouchon de Liège | `no-source` | [find](https://www.youtube.com/results?search_query=Kaaris%20Bouchon%20de%20Li%C3%A8ge) |  |  |
| `463696eea77b9de7` | 2014-08-22 | eden ahbez | Eden’s Island | `read-qualifier` `no-source` | [find](https://www.youtube.com/results?search_query=eden%20ahbez%20Eden%E2%80%99s%20Island) |  |  |
| `fd3dbfc36fa331b4` | 2014-09-10 | Mister Modo & Ugly Mac Beer | Invasion | `read-qualifier` `ambiguous-credit` | [find](https://www.youtube.com/results?search_query=Mister%20Modo%20%26%20Ugly%20Mac%20Beer%20Invasion) |  |  |
| `2429e95c1376c737` | 2014-09-15 | Dualryan | Oceans | `read-qualifier` `no-source` | [find](https://www.youtube.com/results?search_query=Dualryan%20Oceans) |  |  |
| `0fe0c23f34c6018d` | 2014-09-17 | Darkside | Planet Caravan | `read-qualifier` | [find](https://www.youtube.com/results?search_query=Darkside%20Planet%20Caravan) |  |  |
| `255ac0c885f17ffe` | 2014-10-10 | Jorge Ben | Comanche | `no-source` | [find](https://www.youtube.com/results?search_query=Jorge%20Ben%20Comanche) |  |  |
| `ec20e28df8984015` | 2014-10-10 | CSP06 ∆ Nicolas Jaar | Essential Mix | `widget-url` | [find](https://www.youtube.com/results?search_query=CSP06%20%E2%88%86%20Nicolas%20Jaar%20Essential%20Mix) |  |  |
| `e1cfbe7d23cd8834` | 2014-10-11 | Serge Richard | Jaques Chirac \| Je serai le président de tous les français | `no-source` | [find](https://www.youtube.com/results?search_query=Serge%20Richard%20Jaques%20Chirac%20%7C%20Je%20serai%20le%20pr%C3%A9sident%20de%20tous%20les%20fran%C3%A7ais) |  |  |
| `45c4f9f89434055d` | 2014-10-11 | Claudine Longet | Jealous Guy / Don’t Let Me Down | `read-qualifier` | [find](https://www.youtube.com/results?search_query=Claudine%20Longet%20Jealous%20Guy%20%2F%20Don%E2%80%99t%20Let%20Me%20Down) |  |  |
| `47f8fba035658ef6` | 2014-10-12 | Charlie Winston | Unlike Me | `no-source` | [find](https://www.youtube.com/results?search_query=Charlie%20Winston%20Unlike%20Me) |  |  |
| `44156c4b61f3b115` | 2014-10-13 | Alt-J | Lovely Day | `read-qualifier` `no-source` | [find](https://www.youtube.com/results?search_query=Alt-J%20Lovely%20Day) |  |  |
| `8a52df22fcd8919a` | 2014-10-14 | Jacques Brel | Marieke | `no-source` | [find](https://www.youtube.com/results?search_query=Jacques%20Brel%20Marieke) |  |  |
| `d4f0dcf8681e5f53` | 2014-11-07 | Mafia K'1 Fry | Pour Ceux | `no-source` | [find](https://www.youtube.com/results?search_query=Mafia%20K'1%20Fry%20Pour%20Ceux) |  |  |
| `616adcc611e82330` | 2014-11-19 | The Octopus Project | Mmaj | `no-source` `dead-source-in-body` | [find](https://www.youtube.com/results?search_query=The%20Octopus%20Project%20Mmaj) |  | `http://grooveshark.com/songWidget.swf` |
| `bbec8b932ec787bd` | 2014-11-21 | The Spits | Die Die Die | `no-source` | [find](https://www.youtube.com/results?search_query=The%20Spits%20Die%20Die%20Die) |  |  |
| `7165854c8588692d` | 2015-01-13 | Rob | Make it Fast, Make it Slow | `no-source` | [find](https://www.youtube.com/results?search_query=Rob%20Make%20it%20Fast%2C%20Make%20it%20Slow) |  |  |
| `161ae6e8018fc487` | 2015-01-26 | Caribou | Back Home | `no-source` | [find](https://www.youtube.com/results?search_query=Caribou%20Back%20Home) |  |  |
| `a1cb20afc627e401` | 2015-01-28 | Dona Dumitru Siminica | De Trei Ani Nu Dau Pe-acasa | `no-source` | [find](https://www.youtube.com/results?search_query=Dona%20Dumitru%20Siminica%20De%20Trei%20Ani%20Nu%20Dau%20Pe-acasa) |  |  |
| `30334db5b1968d48` | 2015-02-09 | Talking Heads | Stop Making Sense Live | `read-qualifier` `no-source` | [find](https://www.youtube.com/results?search_query=Talking%20Heads%20Stop%20Making%20Sense%20Live) |  |  |
| `acc06d4ed35b74d1` | 2015-02-16 | Giorgio Murderer | Primitive World | `no-source` | [find](https://www.youtube.com/results?search_query=Giorgio%20Murderer%20Primitive%20World) |  |  |
| `3798371be8c66838` | 2015-02-16 | Nat King Cole | Tres Palabras | `no-source` | [find](https://www.youtube.com/results?search_query=Nat%20King%20Cole%20Tres%20Palabras) |  |  |
| `8aeff2a7014f809a` | 2015-03-19 | Nick Drake | Saturday Sun | `no-source` | [find](https://www.youtube.com/results?search_query=Nick%20Drake%20Saturday%20Sun) |  |  |
| `41ac8b18fce6aa50` | 2015-03-23 | Parquet Courts | These Boots are Made for Walkin’ | `no-source` | [find](https://www.youtube.com/results?search_query=Parquet%20Courts%20These%20Boots%20are%20Made%20for%20Walkin%E2%80%99) |  |  |
| `58051a847b25713c` | 2015-04-20 | Radiohead | Reckoner | `read-qualifier` | [find](https://www.youtube.com/results?search_query=Radiohead%20Reckoner) |  |  |
| `17b024185a69baed` | 2015-05-06 | The Cure | Another Journey by Train | `read-qualifier` | [find](https://www.youtube.com/results?search_query=The%20Cure%20Another%20Journey%20by%20Train) |  |  |
| `f0f34b4275a8872d` | 2015-07-12 | Serge Gainsbourg | La Noyée | `no-source` | [find](https://www.youtube.com/results?search_query=Serge%20Gainsbourg%20La%20Noy%C3%A9e) |  |  |
| `5835e09b271ff5a1` | 2015-07-21 | Lee Moses | Bad Girl | `read-qualifier` | [find](https://www.youtube.com/results?search_query=Lee%20Moses%20Bad%20Girl) |  |  |
| `3a059083c2d488a8` | 2015-08-28 | Jorge Ben | Bebete Vãobora | `no-source` | [find](https://www.youtube.com/results?search_query=Jorge%20Ben%20Bebete%20V%C3%A3obora) |  |  |
| `8b3ea9385ff1baec` | 2015-10-27 | Mild High Club | Timeline | `read-qualifier` `no-source` | [find](https://www.youtube.com/results?search_query=Mild%20High%20Club%20Timeline) |  |  |
| `c5a15690a6b42126` | 2015-11-04 | Nick Cave & The Bad Seeds | Higgs Boson Blues | `read-qualifier` `ambiguous-credit` | [find](https://www.youtube.com/results?search_query=Nick%20Cave%20%26%20The%20Bad%20Seeds%20Higgs%20Boson%20Blues) |  |  |
| `ffd9feacb8d2aa81` | 2015-12-04 | John Maus | My Whole World is Coming Apart | `no-source` | [find](https://www.youtube.com/results?search_query=John%20Maus%20My%20Whole%20World%20is%20Coming%20Apart) |  |  |
| `340509f29a6c7580` | 2015-12-07 | Bass Drum of Death | Velvet Itch | `no-source` | [find](https://www.youtube.com/results?search_query=Bass%20Drum%20of%20Death%20Velvet%20Itch) |  |  |
| `fb97dbc6fbf4400c` | 2016-01-06 | Kevin Ayers | The Lady Rachel | `read-qualifier` `no-source` | [find](https://www.youtube.com/results?search_query=Kevin%20Ayers%20The%20Lady%20Rachel) |  |  |
| `afc627d429bccafa` | 2016-01-08 | Rival Consoles | Odyssey / Sonne (Bonus track version, Album, 2015 | `no-source` | [find](https://www.youtube.com/results?search_query=Rival%20Consoles%20Odyssey%20%2F%20Sonne%20(Bonus%20track%20version%2C%20Album%2C%202015) |  |  |
| `c1932973ae2b3238` | 2016-01-19 | M-H-D | Afro Trap | `read-qualifier` | [find](https://www.youtube.com/results?search_query=M-H-D%20Afro%20Trap) |  |  |
| `66a6cdbdb78bdae7` | 2016-09-02 | Elis Regina & Tom Jobim | Aguas de Março | `ambiguous-credit` | [find](https://www.youtube.com/results?search_query=Elis%20Regina%20%26%20Tom%20Jobim%20Aguas%20de%20Mar%C3%A7o) |  |  |
| `b44e645270b4862e` | 2016-09-03 | Tacocat | Crimson Wave | `read-qualifier` | [find](https://www.youtube.com/results?search_query=Tacocat%20Crimson%20Wave) |  |  |
| `0638685bbd7a4f5a` | 2016-09-09 | Nina Simone | Ain’t Got No - I Got Life | `read-qualifier` | [find](https://www.youtube.com/results?search_query=Nina%20Simone%20Ain%E2%80%99t%20Got%20No%20-%20I%20Got%20Life) |  |  |
| `7591cd31a69ef14a` | 2016-09-16 | Rita Pavone | Viva la pappa col pomodorro | `no-source` | [find](https://www.youtube.com/results?search_query=Rita%20Pavone%20Viva%20la%20pappa%20col%20pomodorro) |  |  |
| `2b419dffac7910a7` | 2016-09-23 | The Soft Boys | You’ll Have To Go Sideways | `no-source` | [find](https://www.youtube.com/results?search_query=The%20Soft%20Boys%20You%E2%80%99ll%20Have%20To%20Go%20Sideways) |  |  |
| `539aa2869c6f2561` | 2016-09-30 | Mary Clark | Take Me I’m Yours | `read-qualifier` | [find](https://www.youtube.com/results?search_query=Mary%20Clark%20Take%20Me%20I%E2%80%99m%20Yours) |  |  |
| `b44aeec787305a95` | 2016-10-07 | Marijata | I Walk Alone | `no-source` | [find](https://www.youtube.com/results?search_query=Marijata%20I%20Walk%20Alone) |  |  |
| `5a4d42fb31553ba7` | 2016-10-21 | Jeremy Steig | Howlin’ For Judy | `no-source` | [find](https://www.youtube.com/results?search_query=Jeremy%20Steig%20Howlin%E2%80%99%20For%20Judy) |  |  |
| `78e3302f93612c1b` | 2016-11-25 | The Normal | Warm Leatherette | `no-source` | [find](https://www.youtube.com/results?search_query=The%20Normal%20Warm%20Leatherette) |  |  |
| `681bc3ecdf9acd45` | 2016-11-25 | Fat White Family | Touch The Leather | `no-source` | [find](https://www.youtube.com/results?search_query=Fat%20White%20Family%20Touch%20The%20Leather) |  |  |
| `9cf07f0e54137541` | 2017-04-18 | The Jim Carroll Band | People Who Died | `no-source` | [find](https://www.youtube.com/results?search_query=The%20Jim%20Carroll%20Band%20People%20Who%20Died) |  |  |
| `59dd93f5cb6fd40a` | 2017-04-22 | Velvet Underground | Cool It Down | `no-source` | [find](https://www.youtube.com/results?search_query=Velvet%20Underground%20Cool%20It%20Down) |  |  |
| `8597cf515fdb3b31` | 2017-04-23 | Average Rap Band | El Sol Reprise | `widget-url` | [find](https://www.youtube.com/results?search_query=Average%20Rap%20Band%20El%20Sol%20Reprise) |  |  |
| `7b05551aa4105db7` | 2017-04-27 | Louise Bourgeois | Otte | `no-source` | [find](https://www.youtube.com/results?search_query=Louise%20Bourgeois%20Otte) |  |  |
| `bb35939e1cff6c86` | 2017-04-28 | Reykjavíkurdætur | Hæpið | `no-source` | [find](https://www.youtube.com/results?search_query=Reykjav%C3%ADkurd%C3%A6tur%20H%C3%A6pi%C3%B0) |  |  |
| `eebec0351ab8dc93` | 2017-04-30 | Odetta | Gallows Pole | `no-source` | [find](https://www.youtube.com/results?search_query=Odetta%20Gallows%20Pole) |  |  |
| `d5aba41b76792172` | 2017-05-02 | Giuseppe Verdi | Va, Pensiero | `read-qualifier` | [find](https://www.youtube.com/results?search_query=Giuseppe%20Verdi%20Va%2C%20Pensiero) |  |  |
| `bcda9bbf2aded14d` | 2017-05-04 | The Melodians | The Rivers of Babylon | `no-source` | [find](https://www.youtube.com/results?search_query=The%20Melodians%20The%20Rivers%20of%20Babylon) |  |  |
| `9a6aea224f74de49` | 2017-05-11 | Christine Laume | Rouge rouge | `no-source` | [find](https://www.youtube.com/results?search_query=Christine%20Laume%20Rouge%20rouge) |  |  |
| `592eb1acc609ca37` | 2017-05-12 | Brigitte Fontaine, The Art Ensemble of Chicago & Areski Belkacem | Comme à la radio | `ambiguous-credit` `no-source` | [find](https://www.youtube.com/results?search_query=Brigitte%20Fontaine%2C%20The%20Art%20Ensemble%20of%20Chicago%20%26%20Areski%20Belkacem%20Comme%20%C3%A0%20la%20radio) |  |  |
| `6bde764382dad226` | 2017-05-17 | Janice McClain | Giving My Love | `read-qualifier` `widget-url` | [find](https://www.youtube.com/results?search_query=Janice%20McClain%20Giving%20My%20Love) |  |  |
| `c3fcd5189ed9b5ca` | 2017-05-21 | Cymande | Brothers On The Slide | `no-source` | [find](https://www.youtube.com/results?search_query=Cymande%20Brothers%20On%20The%20Slide) |  |  |
| `c104772916e651f5` | 2017-05-22 | J.J. Cale | Bringin’ it Back | `read-qualifier` | [find](https://www.youtube.com/results?search_query=J.J.%20Cale%20Bringin%E2%80%99%20it%20Back) |  |  |
| `a7d2b9130536f2b3` | 2017-05-28 | Vanishing Twins | Eggs | `widget-url` | [find](https://www.youtube.com/results?search_query=Vanishing%20Twins%20Eggs) |  |  |
| `fa249f8d4e69a3d0` | 2017-05-31 | Tom Waits | Please wake me up | `read-qualifier` | [find](https://www.youtube.com/results?search_query=Tom%20Waits%20Please%20wake%20me%20up) |  |  |
| `64382d097e9e5216` | 2017-06-03 | Richard O’Brien | Science Fiction / Double Feature | `read-qualifier` | [find](https://www.youtube.com/results?search_query=Richard%20O%E2%80%99Brien%20Science%20Fiction%20%2F%20Double%20Feature) |  |  |
| `f4977126fc2741f8` | 2017-06-06 | Courtney Barnett | Pedestrian at Best | `read-qualifier` | [find](https://www.youtube.com/results?search_query=Courtney%20Barnett%20Pedestrian%20at%20Best) |  |  |
| `f375524326c1d17b` | 2017-06-11 | Charanjit Singh | Raga Madhuvanti | `no-source` | [find](https://www.youtube.com/results?search_query=Charanjit%20Singh%20Raga%20Madhuvanti) |  |  |
| `4643629862047c54` | 2017-06-12 | Ancient Methods | DJ Set | `read-qualifier` | [find](https://www.youtube.com/results?search_query=Ancient%20Methods%20DJ%20Set) |  |  |
| `9eca7f8a27cbecb0` | 2018-02-03 | Taxi Girl | Cherchez le garçon | `no-source` | [find](https://www.youtube.com/results?search_query=Taxi%20Girl%20Cherchez%20le%20gar%C3%A7on) |  |  |
| `e121d1ff7e329dae` | 2018-02-03 | Polo & Pan | Dragon Pom Z | `ambiguous-credit` | [find](https://www.youtube.com/results?search_query=Polo%20%26%20Pan%20Dragon%20Pom%20Z) |  |  |
| `cf367bd00952b902` | 2018-02-03 |  |  | `unsplit-title` | [find](https://www.youtube.com/results?search_query=%20) |  |  |
| `29a198ad0abcff76` | 2018-02-03 | Katerine | Je vous emmerde | `no-source` | [find](https://www.youtube.com/results?search_query=Katerine%20Je%20vous%20emmerde) |  |  |
| `0a0dd8cb9fea8f04` | 2019-01-31 | Murcof & Vanessa Wagner | Gnossienne No. 3 | `ambiguous-credit` | [find](https://www.youtube.com/results?search_query=Murcof%20%26%20Vanessa%20Wagner%20Gnossienne%20No.%203) |  |  |

Every row traces back to Tumblr through its post id: the recording it names carries the
permalink as an identity source.
