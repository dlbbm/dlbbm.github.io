import type { FunctionComponent } from 'preact'
import { clss } from '@design-edito/tools/agnostic/css/clss/index.js'
import { mergeClassNames } from '@design-edito/tools/agnostic/css/merge-class-names/index.js'
import { formatDate } from '@design-edito/tools/agnostic/time/dates/format-date/index.js'
import type { DateToken } from '@design-edito/tools/agnostic/time/dates/format-date/types.js'
import { formattedDate as publicClassName } from '../public-classnames.js'
import type { ClassNameProps } from '../types.js'
import { dateTokenUnits } from './types.js'

const templateToken = /\{\{([^{}]+)\}\}/g

type Piece =
  | { kind: 'literal', text: string }
  | { kind: 'token', token: DateToken }

function isDateToken (raw: string): raw is DateToken {
  return Object.hasOwn(dateTokenUnits, raw)
}

function toPieces (format: string): Piece[] {
  const pieces: Piece[] = []
  let cursor = 0
  for (const match of format.matchAll(templateToken)) {
    const raw = match[1] ?? ''
    if (match.index > cursor) pieces.push({ kind: 'literal', text: format.slice(cursor, match.index) })
    if (isDateToken(raw)) { pieces.push({ kind: 'token', token: raw }) }
    else { pieces.push({ kind: 'literal', text: match[0] }) }
    cursor = match.index + match[0].length
  }
  if (cursor < format.length) pieces.push({ kind: 'literal', text: format.slice(cursor) })
  return pieces
}

/**
 * Props for the {@link FormattedDate} component.
 *
 * @property date - The moment to render. An invalid `Date` renders nothing at all.
 * @property format - The template, in `formatDate`'s own grammar:
 * `'{{YYYY}}-{{MM}}-{{DD}}'`. Everything outside `{{…}}` is a literal.
 * @property locale - Handed to `formatDate`, which localises month and weekday names.
 * @property dateTime - The machine-readable value the `<time>` element carries. Left out,
 * the date's ISO string is used; `null` leaves the attribute off, for a precision HTML has
 * no form for.
 * @property className - Additional class name(s) applied to the root element.
 */
export type Props = {
  date: Date
  format: string
  locale?: string
  dateTime?: string | null
} & ClassNameProps

/**
 * A date rendered one element per piece of its template.
 *
 * ### CSS elements
 * - `part` — one per token, carrying the unit it renders as a modifier: `day`, `weekday`,
 *   `month`, `year`, `hours`, `minutes`, `seconds`, `milliseconds`, `meridiem`, `ordinal`.
 *   The token itself is on the element, as `data-token`.
 * - `literal` — one per run of text between two tokens, separators included.
 *
 * @param props - Component properties.
 * @see {@link Props}
 * @returns A `<time>` element holding one element per piece of the template.
 *
 * @remarks
 * Not one token's meaning is implemented here: each is handed back to `formatDate` on its
 * own, so what `MMMM` says in French stays the library's business. All this component
 * knows is where a template's pieces begin and end.
 *
 * An unknown token comes out a literal, braces included, which is what `formatDate` does
 * with one — a typo shows rather than silently rendering nothing.
 *
 * The root carries no modifier, holding no state of its own; and a token being a name
 * rather than a value a stylesheet computes with, it goes to a `data-` attribute and not
 * to a custom property.
 */
export const FormattedDate: FunctionComponent<Props> = ({
  date,
  format,
  locale,
  dateTime,
  className
}) => {
  if (Number.isNaN(date.getTime())) return null
  const machineValue = dateTime === undefined ? date.toISOString() : dateTime

  // Rendering
  const c = clss(publicClassName)
  const rootClss = mergeClassNames(c(), className)
  return <time
    className={rootClss}
    dateTime={machineValue ?? undefined}>{toPieces(format).map((piece, index) => piece.kind === 'literal'
      ? <span className={c('literal')} key={index}>{piece.text}</span>
      : <span
        className={c('part', dateTokenUnits[piece.token])}
        data-token={piece.token}
        key={index}>{formatDate(date, `{{${piece.token}}}`, locale)}</span>)}</time>
}
