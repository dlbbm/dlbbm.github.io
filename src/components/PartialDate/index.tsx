import { clss } from '@design-edito/tools/agnostic/css/clss/index.js'
import { formatDate } from '@design-edito/tools/agnostic/time/dates/format-date/index.js'
import type { PartialDate as PartialDateValue } from '../../../shared/types/index.js'
import { FormattedDate } from '../../basics/FormattedDate/index.js'

const bem = clss('partial-date')

export type PartialDateProps = {
  date: PartialDateValue
}

/**
 * A date as precise as it is known, and no more.
 *
 * The template is picked from the parts that are there, so nothing invented is rendered.
 * `<time>` accepts `1968` and `1968-04` as readily as a whole date, which is what the
 * attribute carries — but only those three shapes, so a fragment the type allows and HTML
 * does not, a month without its year, is shown without one.
 */
export function PartialDate ({ date }: PartialDateProps) {
  const { year, month, day } = date
  const format = [
    year === null ? null : '{{YYYY}}',
    month === null ? null : '{{MM}}',
    day === null ? null : '{{DD}}'
  ].filter((token): token is string => token !== null).join('-')
  if (format === '') return null

  const filled = new Date(year ?? 2000, (month ?? 1) - 1, day ?? 1)
  const statable = year !== null && (month !== null || day === null)
  return <FormattedDate
    date={filled}
    format={format}
    dateTime={statable ? formatDate(filled, format) : null}
    className={bem()} />
}
