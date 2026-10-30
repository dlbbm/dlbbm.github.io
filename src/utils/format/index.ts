/**
 * Turning stored values into something a page can show.
 */

import { formatDate } from '@design-edito/tools/agnostic/time/dates/format-date/index.js'
import type { PartialDate } from '../../../types/index.js'

/**
 * A date, rendered as precisely as it is known and no more.
 *
 * `formatDate` wants a `Date`, which is the one thing a partial date is not: the missing
 * parts are filled in to build one, then left out of the template, so nothing invented
 * reaches the page. `null` when the date knows nothing at all, so a caller can skip the
 * element rather than print an empty one.
 */
export function formatPartialDate (date: PartialDate): string | null {
  const tokens = [
    date.year === null ? null : '{{YYYY}}',
    date.month === null ? null : '{{MM}}',
    date.day === null ? null : '{{DD}}'
  ].filter((token): token is string => token !== null)
  if (tokens.length === 0) return null
  const filled = new Date(date.year ?? 2000, (date.month ?? 1) - 1, date.day ?? 1)
  return formatDate(filled, tokens.join('-'))
}
