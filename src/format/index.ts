/**
 * Turning stored values into something a page can show.
 *
 * `scripts/_date` does the same for the terminal; the two are kept apart because the
 * browser must not import a command's module to read a date.
 */

import type { PartialDate } from '../../types/index.js'

function pad (value: number, width = 2): string {
  return `${value}`.padStart(width, '0')
}

/** `null` when the date knows nothing, so the element can be skipped rather than empty. */
export function formatPartialDate (date: PartialDate): string | null {
  const parts = [
    date.year === null ? null : pad(date.year, 4),
    date.month === null ? null : pad(date.month),
    date.day === null ? null : pad(date.day)
  ].filter((part): part is string => part !== null)
  return parts.length === 0 ? null : parts.join('-')
}
