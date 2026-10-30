// The EU cohesion projects as a list of the DataTable pattern, of one beneficiary or of
// every one: what its address holds, and what it asks the API for:
// /institutii/4491342?lista=coeziune&program=peo-2021&stare=in-implementare, or
// /programe/fonduri-europene?program=por-2014,peo-2021&q=drum.

import { EU_STATUSES } from '#/features/eu-projects/api'
import type { EuStatus } from '#/features/eu-projects/api'
import { programmeSlug } from '#/features/eu-projects/eu'
import { EU_STATUS_PARAMS, euStatusOfParam } from '#/features/eu-projects/urls'
import type { EuStatusParam } from '#/features/eu-projects/urls'
import {
  numberFromParam,
  pageSizeFromParam,
  sortFromParam,
  sortToParam,
} from '#/lib/list'
import type { PageSize, Sort } from '#/lib/list'
import { searchParam } from '#/lib/urls'

// `stare` is shared with the list of direct purchases, which writes its states as numbers:
// each list reads only the words it knows.
export type EuProjectListSearch = {
  q?: string | number
  // Programmes as slugs, several separated by commas: 'por-2014,peo-2021'.
  program?: string
  stare?: string | number
  valoare_min?: number
  valoare_max?: number
  ordine?: string
  pe_pagina?: PageSize
  vedere?: 'tabel'
}

export const EU_PROJECT_COLUMNS = {
  valoare: { api: 'value' },
  platit: { api: 'paid' },
} as const

const SLUGS = /^[a-z]{2,10}-\d{4}(,[a-z]{2,10}-\d{4})*$/i

// The statuses of a list in the address, in the order given; undefined when any word is
// not one of a project's.
export function euStatusesFromParam(
  value: unknown,
): Array<EuStatus> | undefined {
  if (typeof value !== 'string' || !value) return undefined
  const found = value
    .split(',')
    .map((word) => euStatusOfParam(word as EuStatusParam))
  return found.every((status) => status !== undefined)
    ? [...new Set(found)]
    : undefined
}

export function euStatusesToParam(
  statuses: Array<EuStatus>,
): string | undefined {
  return statuses.length
    ? EU_STATUSES.filter((status) => statuses.includes(status))
        .map((status) => EU_STATUS_PARAMS[status])
        .join(',')
    : undefined
}

export function validateEuProjectListSearch(
  search: Record<string, unknown>,
): EuProjectListSearch {
  const q =
    typeof search.q === 'string' || typeof search.q === 'number'
      ? String(search.q).trim().slice(0, 100)
      : ''
  const statuses = euStatusesFromParam(search.stare)
  const sort = sortFromParam(search.ordine, EU_PROJECT_COLUMNS)
  return {
    // The API reads words of two letters or more, or a SMIS code.
    q: q.length >= 2 ? searchParam(q) : undefined,
    program:
      typeof search.program === 'string' && SLUGS.test(search.program)
        ? search.program.toLowerCase()
        : undefined,
    stare: statuses && euStatusesToParam(statuses),
    valoare_min: numberFromParam(search.valoare_min),
    valoare_max: numberFromParam(search.valoare_max),
    // The list's own order (largest first) is left out of the address.
    ordine:
      sort && !(sort.column === 'valoare' && sort.dir === 'desc')
        ? sortToParam(sort, EU_PROJECT_COLUMNS)
        : undefined,
    pe_pagina: pageSizeFromParam(search.pe_pagina),
    vedere: search.vedere === 'tabel' ? 'tabel' : undefined,
  }
}

export function euProjectSort(search: EuProjectListSearch): Sort {
  return (
    sortFromParam(search.ordine, EU_PROJECT_COLUMNS) ?? {
      column: 'valoare',
      dir: 'desc',
    }
  )
}

// The programme codes the address names, from the programmes the beneficiary has (a code
// alone is not enough: POAT and PoAT differ only in case).
export function programmeCodes(
  programmes: ReadonlyArray<{ code: string; period: string }>,
  program: string | undefined,
): Array<string> | undefined {
  if (!program) return undefined
  const slugs = program.split(',')
  const codes = programmes
    .filter((each) => slugs.includes(programmeSlug(each)))
    .map((each) => each.code)
  return codes.length ? codes : undefined
}

export type EuProjectListFilter = {
  // Undefined on the list of every beneficiary.
  beneficiary?: number
  programme?: Array<string>
  status?: Array<EuStatus>
  q?: string
  value_min?: number
  value_max?: number
}

export function euProjectFilter(
  cui: number,
  search: EuProjectListSearch,
  codes: Array<string> | undefined,
): EuProjectListFilter {
  return {
    beneficiary: cui,
    programme: codes,
    status: euStatusesFromParam(search.stare),
    // `q` is shared with lists that keep one letter: the API reads two or more.
    q:
      search.q !== undefined && String(search.q).length >= 2
        ? String(search.q)
        : undefined,
    value_min: search.valoare_min,
    value_max: search.valoare_max,
  }
}

export function euProjectApiSort(search: EuProjectListSearch) {
  const sort = euProjectSort(search)
  return {
    sort: EU_PROJECT_COLUMNS[sort.column as keyof typeof EU_PROJECT_COLUMNS]
      .api,
    order: sort.dir,
  }
}

export const EU_PROJECT_FILTER_PARAMS = {
  q: ['q'],
  program: ['program'],
  stare: ['stare'],
  valoare: ['valoare_min', 'valoare_max'],
} as const satisfies Record<string, ReadonlyArray<keyof EuProjectListSearch>>
export type EuProjectFilterKey = keyof typeof EU_PROJECT_FILTER_PARAMS

export const EU_PROJECT_BY_API_PARAM: Record<string, EuProjectFilterKey> = {
  q: 'q',
  programme: 'program',
  status: 'stare',
  value_min: 'valoare',
  value_max: 'valoare',
}
