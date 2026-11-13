/**
 * Asking MusicBrainz, which is the one register of how an act spells itself that is free
 * to query.
 *
 * Every request goes through `ask`, which holds the published rate — one a second, and it
 * is enforced — so the pace is kept whoever is asking and however many names a caller
 * walks. A search answers with a score out of 100; under `SCORE` it is answering about
 * somebody else.
 *
 * What comes back is never an answer, only a candidate: MusicBrainz stylises its names,
 * and its search will score a tribute band 100 for the artist it covers.
 */

/** MusicBrainz asks every client to say what it is and where to complain about it. */
const AGENT = 'dlbbm-scripts/1.0 ( https://dlbbm.github.io )'

const WAIT = 1100

export const SCORE = 85

/**
 * One name MusicBrainz offers, with what it says to tell it apart from a namesake.
 *
 * `disambiguation` is MusicBrainz's own one-liner for an artist; for a recording it holds
 * who it is by, which is the thing that tells two takes of one title apart.
 */
export type Candidate = {
  name: string
  score: number
  type: string | null
  country: string | null
  disambiguation: string | null
  aliases: string[]
}

/** One stored lookup, kept with the name it was made for. */
export type Looked = {
  id: string
  name: string
  candidates: Candidate[]
}

const sleep = async (ms: number): Promise<void> =>
  await new Promise(resolve => setTimeout(resolve, ms))

let asked = 0

async function ask (url: string, attempt = 0): Promise<Record<string, unknown>> {
  const since = Date.now() - asked
  if (since < WAIT) await sleep(WAIT - since)
  asked = Date.now()
  const response = await fetch(url, {
    headers: { 'User-Agent': AGENT, Accept: 'application/json' }
  })
  if (response.status === 503 && attempt < 4) {
    await sleep(WAIT * 5 * (attempt + 1))
    return await ask(url, attempt + 1)
  }
  if (!response.ok) throw new Error(`musicbrainz answered ${response.status}`)
  return await response.json() as Record<string, unknown>
}

/** Lucene reads the punctuation in a name as syntax, so it is escaped rather than dropped. */
function escapeQuery (name: string): string {
  return name.replace(/([\+\-\&\|\!\(\)\{\}\[\]\^"\~\*\?\:\\\/])/gv, '\\$1')
}

const text = (value: unknown): string | null =>
  typeof value === 'string' && value !== '' ? value : null

function search (entity: 'artist' | 'recording', query: string): string {
  return `https://musicbrainz.org/ws/2/${entity}`
    + `?query=${encodeURIComponent(query)}`
    + '&fmt=json&limit=5'
}

function aliasesOf (found: Record<string, unknown>): string[] {
  return Array.isArray(found.aliases)
    ? found.aliases.map(alias => String((alias as { name?: unknown }).name ?? ''))
    : []
}

export async function searchArtist (name: string): Promise<Candidate[]> {
  const body = await ask(search('artist', `artist:"${escapeQuery(name)}"`))
  const artists = Array.isArray(body.artists) ? body.artists as Array<Record<string, unknown>> : []
  return artists.map(found => ({
    name: String(found.name ?? ''),
    score: Number(found.score ?? 0),
    type: text(found.type),
    country: text(found.country),
    disambiguation: text(found.disambiguation),
    aliases: aliasesOf(found)
  }))
}

/**
 * The recordings MusicBrainz has under a title, narrowed by who plays it when that is
 * known.
 *
 * A recording rather than a work: MusicBrainz's works are thinly populated next to its
 * recordings, and a title is a title either way. Its credit comes back as the
 * disambiguation, since a title alone cannot be judged.
 */
export async function searchRecording (title: string, by: string | null): Promise<Candidate[]> {
  const query = by === null
    ? `recording:"${escapeQuery(title)}"`
    : `recording:"${escapeQuery(title)}" AND artist:"${escapeQuery(by)}"`
  const body = await ask(search('recording', query))
  const recordings = Array.isArray(body.recordings)
    ? body.recordings as Array<Record<string, unknown>>
    : []
  return recordings.map(found => {
    const credits = Array.isArray(found['artist-credit'])
      ? (found['artist-credit'] as Array<Record<string, unknown>>)
        .map(credit => String((credit.artist as { name?: unknown } | undefined)?.name ?? ''))
        .filter(name => name !== '')
      : []
    return {
      name: String(found.title ?? ''),
      score: Number(found.score ?? 0),
      type: null,
      country: null,
      disambiguation: [credits.join(', '), text(found.disambiguation)]
        .filter(part => part !== null && part !== '')
        .join(', ') || null,
      aliases: aliasesOf(found)
    }
  })
}

/**
 * The candidate that is the same thing under another spelling, by the fold `key` applies.
 *
 * `comparisonKey` is what the caller passes, so an artist and a title are judged by the
 * same rule the duplicate pass uses — an article, a conjunction or a diacritic is not what
 * makes two names differ.
 */
export function sameThing (
  name: string,
  candidates: Candidate[],
  key: (value: string) => string
): Candidate | null {
  const folded = key(name)
  return candidates
    .filter(candidate => candidate.score >= SCORE)
    .find(candidate => key(candidate.name) === folded
      || candidate.aliases.some(alias => key(alias) === folded)) ?? null
}

/** What MusicBrainz says about a candidate, for the line above the question. */
export function describeCandidate (candidate: Candidate): string {
  return [candidate.type, candidate.country, candidate.disambiguation]
    .filter(part => part !== null)
    .join(', ')
}
