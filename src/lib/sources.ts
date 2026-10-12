// Reading what the API says about a source, for the sources page.

import type { Dataset } from '#/lib/api'

const DAY = 24 * 60 * 60 * 1000

// How the days of a source's period were read.
//   expected  days from the first to the last one, both included
//   full      read in full
//   partial   the source would not give them in full; they wait to be read again
//   missing   never read, or every try failed
export function coverage(
  dataset: Pick<
    Dataset,
    'first_day' | 'last_day' | 'days_collected' | 'days_partial'
  >,
) {
  if (!dataset.first_day || !dataset.last_day) return null
  const span = Date.parse(dataset.last_day) - Date.parse(dataset.first_day)
  const expected = Math.round(span / DAY) + 1
  // The API counts only days inside the period. Should it ever say more, the page still
  // must not read "41 of 40 days".
  const full = Math.min(dataset.days_collected, expected)
  const partial = Math.min(dataset.days_partial, expected - full)
  return {
    expected,
    full,
    partial,
    missing: Math.max(expected - full - partial, 0),
  }
}
