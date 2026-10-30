/**
 * Reading and writing the two kinds of date these types hold.
 *
 * A {@link PartialDate} is as precise as the source was and no more; a {@link Timestamp}
 * is an exact moment with its offset. Both live here so that the command asking for one
 * and the build emitting it cannot disagree about what a string means.
 */

import type { PartialDate, Timestamp } from '../../types/index.js'

// Month and day are accepted unpadded — `1986-4-6` is the sixth of April — since every
// one of them is parsed into a number anyway.
const PARTIAL_DATE = /^(\d{4})(?:-(\d{1,2})(?:-(\d{1,2}))?)?$/
const TIMESTAMP = /^(\d{4})-(\d{1,2})-(\d{1,2})[ T](\d{1,2}):(\d{1,2})(?::(\d{1,2}))?$/

function pad (value: number, width = 2): string {
  return `${value}`.padStart(width, '0')
}

export function parsePartialDate (raw: string): PartialDate | null {
  const match = PARTIAL_DATE.exec(raw.trim())
  if (match === null) return null
  const [, rawYear, rawMonth, rawDay] = match
  const year = rawYear === undefined ? null : Number.parseInt(rawYear, 10)
  const month = rawMonth === undefined ? null : Number.parseInt(rawMonth, 10)
  const day = rawDay === undefined ? null : Number.parseInt(rawDay, 10)
  if (month !== null && (month < 1 || month > 12)) return null
  if (day !== null && (day < 1 || day > 31)) return null
  return { year, month, day }
}

export function formatPartialDate (date: PartialDate): string {
  const parts = [
    date.year === null ? null : pad(date.year, 4),
    date.month === null ? null : pad(date.month),
    date.day === null ? null : pad(date.day)
  ].filter((part): part is string => part !== null)
  return parts.length === 0 ? 'unknown' : parts.join('-')
}

/** A `Date` as a `Timestamp`, carrying the offset this machine had on that very day. */
export function toTimestamp (date: Date): Timestamp {
  const offset = -date.getTimezoneOffset()
  const sign = offset < 0 ? '-' : '+'
  return `${pad(date.getFullYear(), 4)}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
    + `T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
    + `${sign}${pad(Math.floor(Math.abs(offset) / 60))}:${pad(Math.abs(offset) % 60)}`
}

/**
 * The moment a written answer names, in this machine's timezone.
 *
 * `null` on anything incomplete or impossible: a `Timestamp` is the one date here that
 * cannot be vague. The round-trip through `Date` is what rejects 31 February, and reading
 * the offset off that same date is what gets summer time right.
 */
export function parseTimestamp (raw: string): Timestamp | null {
  const match = TIMESTAMP.exec(raw.trim())
  if (match === null) return null
  const [year, month, day, hour, minute, second] = match
    .slice(1)
    .map(part => part === undefined ? 0 : Number.parseInt(part, 10))
  if (year === undefined || month === undefined || day === undefined) return null
  if (hour === undefined || minute === undefined || second === undefined) return null
  const date = new Date(year, month - 1, day, hour, minute, second)
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null
  if (date.getHours() !== hour || date.getMinutes() !== minute) return null
  return toTimestamp(date)
}

/** Now, in the form the prompts ask for. */
export function nowAsString (): string {
  const now = new Date()
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
    + ` ${pad(now.getHours())}:${pad(now.getMinutes())}`
}

/** `2019-01-31T18:39:00+01:00` back into the `2019-01-31 18:39` a prompt asks for. */
export function timestampAsString (timestamp: Timestamp): string {
  return `${timestamp.slice(0, 10)} ${timestamp.slice(11, 16)}`
}
