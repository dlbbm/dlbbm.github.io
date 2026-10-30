import { clss } from '@design-edito/tools/agnostic/css/clss/index.js'
import { mergeClassNames } from '@design-edito/tools/agnostic/css/merge-class-names/index.js'
import { formatDate } from '@design-edito/tools/agnostic/time/dates/format-date/index.js'
import type { DateToken } from '@design-edito/tools/agnostic/time/dates/format-date/types.js'

const bem = clss('formatted-date')

const TEMPLATE_TOKEN = /\{\{([^{}]+)\}\}/g

/**
 * What each token is a token *of*.
 *
 * The modifier says the unit rather than the token, because what a stylesheet has an
 * opinion about is the year, whether the template asked for `YY` or `YYYY`. The token
 * itself stays on the element as `data-token`, for the once in a while when the padding is
 * the thing being styled.
 */
const TOKEN_UNITS: Record<DateToken, string> = {
  D: 'day',
  DD: 'day',
  d: 'day',
  dd: 'day',
  ddd: 'weekday',
  dddd: 'weekday',
  M: 'month',
  MM: 'month',
  MMM: 'month',
  MMMM: 'month',
  YY: 'year',
  YYYY: 'year',
  H: 'hours',
  HH: 'hours',
  h: 'hours',
  hh: 'hours',
  m: 'minutes',
  mm: 'minutes',
  s: 'seconds',
  ss: 'seconds',
  ms: 'milliseconds',
  A: 'meridiem',
  a: 'meridiem',
  th: 'ordinal'
}

function isDateToken (raw: string): raw is DateToken {
  return Object.hasOwn(TOKEN_UNITS, raw)
}

type Piece =
  | { kind: 'literal', text: string }
  | { kind: 'token', token: DateToken }

/**
 * The template, cut into the pieces an element each.
 *
 * An unknown token comes out a literal, braces included, which is what `formatDate` does
 * with one: a typo shows rather than silently rendering nothing.
 */
function toPieces (format: string): Piece[] {
  const pieces: Piece[] = []
  let cursor = 0
  for (const match of format.matchAll(TEMPLATE_TOKEN)) {
    const raw = match[1] ?? ''
    if (match.index > cursor) pieces.push({ kind: 'literal', text: format.slice(cursor, match.index) })
    if (isDateToken(raw)) { pieces.push({ kind: 'token', token: raw }) }
    else { pieces.push({ kind: 'literal', text: match[0] }) }
    cursor = match.index + match[0].length
  }
  if (cursor < format.length) pieces.push({ kind: 'literal', text: format.slice(cursor) })
  return pieces
}

export type FormattedDateProps = {
  date: Date
  /** The template `formatDate` reads, `'{{YYYY}}-{{MM}}-{{DD}}'` and the like. */
  format: string
  locale?: string
  /** The machine-readable value. `null` leaves the attribute off, for a date no `<time>` can state. */
  dateTime?: string | null
  className?: string
}

/**
 * `formatDate`, rendered one element per piece of the template.
 *
 * Not one token's meaning is reimplemented here: each is handed back to `formatDate` on
 * its own, so what `MMMM` says in French stays the library's business. All this component
 * knows is where a template's pieces begin and end.
 */
export function FormattedDate ({
  date,
  format,
  locale,
  dateTime,
  className
}: FormattedDateProps) {
  if (Number.isNaN(date.getTime())) return null
  const machine = dateTime === undefined ? date.toISOString() : dateTime
  return <time
    class={mergeClassNames(bem(), className)}
    dateTime={machine ?? undefined}>{toPieces(format).map((piece, index) => piece.kind === 'literal'
      ? <span class={bem('literal')} key={index}>{piece.text}</span>
      : <span
        class={bem('part', TOKEN_UNITS[piece.token])}
        data-token={piece.token}
        key={index}>{formatDate(date, `{{${piece.token}}}`, locale)}</span>)}</time>
}
