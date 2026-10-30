// The PNRR contracts of one measure, as a list of the DataTable pattern: what its address
// holds, and what it asks the API for:
// /programe/pnrr/c10.i3?judet=gorj&beneficiar=4981310&stare=finalizat&progres_min=50.

import { PNRR_STATUSES } from '#/features/pnrr/api'
import type { PnrrStatus } from '#/features/pnrr/api'
import { PNRR_STATUS_PARAMS, statusOfParam } from '#/features/pnrr/urls'
import type { PnrrStatusParam } from '#/features/pnrr/urls'
import { countyBySlug } from '#/features/pnrr/pnrr'
import {
  numberFromParam,
  pageSizeFromParam,
  sortFromParam,
  sortToParam,
} from '#/lib/list'
import type { PageSize, Sort } from '#/lib/list'
import { searchParam } from '#/lib/urls'

// `stare` is shared with the lists of direct purchases (numbers) and of EU projects
// (their own words): each list reads only the words it knows.
export type PnrrListSearch = {
  q?: string | number
  // Measure codes in lower case, several separated by commas: 'c10.i3,c15.i9'. A
  // beneficiary's list only.
  masura?: string
  // The county without its marks (pnrr.ts) and a beneficiary's CUI: a measure's list only.
  judet?: string
  beneficiar?: number
  stare?: string | number
  valoare_min?: number
  valoare_max?: number
  // Physical progress in whole percents: from (included) and up to (excluded).
  progres_min?: number
  progres_max?: number
  ordine?: string
  pe_pagina?: PageSize
  vedere?: 'tabel'
}

export const PNRR_COLUMNS = {
  valoare: { api: 'value' },
  progres: { api: 'progress' },
} as const

// The progress bands of the list's chart and filter, in percents; the last is 100 %,
// finished, with no upper end.
export const PROGRESS_BANDS = [
  { min: 0, max: 25 },
  { min: 25, max: 50 },
  { min: 50, max: 75 },
  { min: 75, max: 100 },
  { min: 100 },
] as const

const MEASURES = /^c\d{1,2}\.[a-z0-9.]{1,12}(,c\d{1,2}\.[a-z0-9.]{1,12})*$/i

export function pnrrStatusesFromParam(
  value: unknown,
): Array<PnrrStatus> | undefined {
  if (typeof value !== 'string' || !value) return undefined
  const found = value
    .split(',')
    .map((word) => statusOfParam(word as PnrrStatusParam))
  return found.every((status) => status !== undefined)
    ? [...new Set(found)]
    : undefined
}

export function pnrrStatusesToParam(
  statuses: Array<PnrrStatus>,
): string | undefined {
  return statuses.length
    ? PNRR_STATUSES.filter((status) => statuses.includes(status))
        .map((status) => PNRR_STATUS_PARAMS[status])
        .join(',')
    : undefined
}

function percent(value: unknown) {
  const found = numberFromParam(value, 3)
  return found !== undefined && found <= 100 ? found : undefined
}

export function validatePnrrListSearch(
  search: Record<string, unknown>,
): PnrrListSearch {
  const q =
    typeof search.q === 'string' || typeof search.q === 'number'
      ? String(search.q).trim().slice(0, 100)
      : ''
  const statuses = pnrrStatusesFromParam(search.stare)
  const sort = sortFromParam(search.ordine, PNRR_COLUMNS)
  return {
    // The API reads words of two letters or more.
    q: q.length >= 2 ? searchParam(q) : undefined,
    masura:
      typeof search.masura === 'string' && MEASURES.test(search.masura)
        ? search.masura.toLowerCase()
        : undefined,
    stare: statuses && pnrrStatusesToParam(statuses),
    valoare_min: numberFromParam(search.valoare_min),
    valoare_max: numberFromParam(search.valoare_max),
    progres_min: percent(search.progres_min),
    progres_max: percent(search.progres_max),
    // The list's own order (largest first) is left out of the address.
    ordine:
      sort && !(sort.column === 'valoare' && sort.dir === 'desc')
        ? sortToParam(sort, PNRR_COLUMNS)
        : undefined,
    pe_pagina: pageSizeFromParam(search.pe_pagina),
    vedere: search.vedere === 'tabel' ? 'tabel' : undefined,
  }
}

// A measure's list reads the same address, with a county and a beneficiary in place of
// the measures.
export function validatePnrrMeasureSearch(
  search: Record<string, unknown>,
): PnrrListSearch {
  return {
    ...validatePnrrListSearch(search),
    masura: undefined,
    judet:
      typeof search.judet === 'string' && /^[a-z0-9-]{2,40}$/.test(search.judet)
        ? search.judet
        : undefined,
    beneficiar: numberFromParam(search.beneficiar, 10),
  }
}

export function pnrrSort(search: PnrrListSearch): Sort {
  return (
    sortFromParam(search.ordine, PNRR_COLUMNS) ?? {
      column: 'valoare',
      dir: 'desc',
    }
  )
}

// The band of the list's progress filter, by its place in PROGRESS_BANDS; -1 for none.
export function progressBand(search: PnrrListSearch): number {
  return PROGRESS_BANDS.findIndex(
    (band) =>
      band.min === search.progres_min &&
      ('max' in band ? band.max : undefined) === search.progres_max,
  )
}

// Whose list it is: a measure's, with the counties it has contracts in (the address names
// one without its marks).
export type PnrrListOf = { measure: string; counties: ReadonlyArray<string> }

export type PnrrListFilter = {
  beneficiary?: number
  measure?: Array<string>
  county?: string
  status?: Array<PnrrStatus>
  q?: string
  value_min?: number
  value_max?: number
  progress_min?: number
  progress_max?: number
}

// The measures as the API names them ('C10.I3'): it finds them whatever their case.
export function pnrrFilter(
  of: PnrrListOf,
  search: PnrrListSearch,
): PnrrListFilter {
  return {
    beneficiary: search.beneficiar,
    measure: [of.measure],
    // A county the measure has no contract in is not asked for.
    county: countyBySlug(of.counties, search.judet),
    status: pnrrStatusesFromParam(search.stare),
    // `q` is shared with lists that keep one letter: the API reads two or more.
    q:
      search.q !== undefined && String(search.q).length >= 2
        ? String(search.q)
        : undefined,
    value_min: search.valoare_min,
    value_max: search.valoare_max,
    progress_min:
      search.progres_min === undefined ? undefined : search.progres_min / 100,
    progress_max:
      search.progres_max === undefined ? undefined : search.progres_max / 100,
  }
}

export function pnrrApiSort(search: PnrrListSearch) {
  const sort = pnrrSort(search)
  return {
    sort: PNRR_COLUMNS[sort.column as keyof typeof PNRR_COLUMNS].api,
    order: sort.dir,
  }
}

export const PNRR_FILTER_PARAMS = {
  q: ['q'],
  judet: ['judet'],
  beneficiar: ['beneficiar'],
  stare: ['stare'],
  valoare: ['valoare_min', 'valoare_max'],
  progres: ['progres_min', 'progres_max'],
} as const satisfies Record<string, ReadonlyArray<keyof PnrrListSearch>>
export type PnrrFilterKey = keyof typeof PNRR_FILTER_PARAMS

export const PNRR_BY_API_PARAM: Record<string, PnrrFilterKey> = {
  q: 'q',
  county: 'judet',
  beneficiary: 'beneficiar',
  status: 'stare',
  value_min: 'valoare',
  value_max: 'valoare',
  progress_min: 'progres',
  progress_max: 'progres',
}
