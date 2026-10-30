// "Județ" on a list whose API cannot count each county (the contracts, the direct purchases,
// the rankings): every county is offered, by name, one at a time, without counts. The
// address names it by its slug (?judet=gorj), the API by its code ('GJ').

import type { ChoiceFilter } from '#/components/list/filter-types'
import {
  COUNTY_CODES,
  countyCodeOfSlug,
  countyName,
  countySlugOfCode,
} from '#/lib/counties'

// The slug of a county the address names, or nothing.
export function countyParam(value: unknown): string | undefined {
  const code = countyCodeOfSlug(value)
  return code === undefined ? undefined : countySlugOfCode(code)
}

export function countyFilter(judet: string | undefined, label: string) {
  const code = countyCodeOfSlug(judet)
  const index = code === undefined ? -1 : COUNTY_CODES.indexOf(code)
  const filter: ChoiceFilter = {
    key: 'judet',
    kind: 'choice',
    single: true,
    label,
    value: index >= 0 ? [index] : [],
    options: COUNTY_CODES.map((each, at) => ({
      value: at,
      label: countyName(each) ?? each,
    })),
    chip: code === undefined ? null : (countyName(code) ?? null),
    clear: { judet: undefined },
    patch: (next) => ({
      judet: next.length ? countySlugOfCode(COUNTY_CODES[next[0]]) : undefined,
    }),
  }
  return filter
}
