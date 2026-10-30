/**
 * Turning stored values into something a page can show.
 *
 * A date is not here: rendering one is `basics/Date`, which cuts a template into elements
 * rather than into a string.
 */

import type { Place } from '../../../shared/types/index.js'

/** `null` when the place knows nothing, so the element can be skipped. */
export function formatPlace (place: Place): string | null {
  const parts = [place.venue, place.city, place.country].filter((part): part is string => part !== null)
  return parts.length === 0 ? null : parts.join(', ')
}
