import type { DateToken } from '@design-edito/tools/agnostic/time/dates/format-date/types.js'

/**
 * What each token is a token *of*.
 *
 * A part's modifier says the unit rather than the token, because what a stylesheet has an
 * opinion about is the year, whether the template asked for `YY` or `YYYY`. The token
 * itself stays on the element as `data-token`, for the once in a while when the padding is
 * the thing being styled.
 *
 * A table rather than a bare union: a consumer writing the stylesheet needs the values at
 * runtime, and a type has nothing to hand them.
 */
export const dateTokenUnits = {
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
} as const satisfies Record<DateToken, string>

/** The unit a part names, which is the modifier a stylesheet targets. */
export type DateUnit = typeof dateTokenUnits[keyof typeof dateTokenUnits]
