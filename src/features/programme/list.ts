// The Anghel Saligny projects as a list of the DataTable pattern: what its address holds,
// and what it asks the API for:
// /programe/anghel-saligny?judet=gorj&legatura=mai-multe,niciunul&lucrari=drumurile-publice.
// `firma` is a builder's CUI, for "every project this company builds".

import { MATCHES } from '#/features/programme/api'
import type { Match } from '#/features/programme/api'
import {
  MATCH_PARAMS,
  countyKey,
  isMatchParam,
  matchParam,
} from '#/features/programme/programme'
import {
  numberFromParam,
  pageSizeFromParam,
  plain,
  sortFromParam,
  sortToParam,
} from '#/lib/list'
import type { PageSize, Sort } from '#/lib/list'
import { cuiFromPath, pageFromParam, searchParam } from '#/lib/urls'

export type ProjectListSearch = {
  q?: string | number
  judet?: string
  // Match states as the address names them, several separated by commas.
  legatura?: string
  // Kinds of works as slugs (worksSlug), several separated by commas.
  lucrari?: string
  firma?: number
  platit_min?: number
  platit_max?: number
  ordine?: string
  pe_pagina?: PageSize
  vedere?: 'tabel'
  pagina?: number
}

export const PROJECT_COLUMNS = {
  platit: { api: 'paid' },
  valoare: { api: 'value' },
} as const

// A kind of works in an address: 'drumurile-publice' for 'Drumurile publice'.
export function worksSlug(category: string) {
  return plain(category)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

// The match states of the address, in the order given; undefined when any is unknown.
export function matchesFromParam(value: unknown): Array<Match> | undefined {
  if (typeof value !== 'string' || !value) return undefined
  const names = value.split(',')
  return names.every(isMatchParam)
    ? [...new Set(names.map((name) => MATCH_PARAMS[name]))]
    : undefined
}

export function matchesToParam(matches: Array<Match>): string | undefined {
  return matches.length
    ? MATCHES.filter((match) => matches.includes(match))
        .map((match) => matchParam(match))
        .join(',')
    : undefined
}

export function validateProjectListSearch(
  search: Record<string, unknown>,
): ProjectListSearch {
  // A number typed in the field arrives as a number, like a CUI in the search page.
  const q =
    typeof search.q === 'string' || typeof search.q === 'number'
      ? String(search.q).trim().slice(0, 100)
      : ''
  const builder =
    typeof search.firma === 'number' || typeof search.firma === 'string'
      ? cuiFromPath(String(search.firma))
      : null
  const matches = matchesFromParam(search.legatura)
  const sort = sortFromParam(search.ordine, PROJECT_COLUMNS)
  return {
    q: q.length >= 2 ? searchParam(q) : undefined,
    judet:
      typeof search.judet === 'string' &&
      /^[a-z]{2,20}(-[a-z]{2,20})?$/.test(search.judet)
        ? search.judet
        : undefined,
    legatura: matches && matchesToParam(matches),
    lucrari:
      typeof search.lucrari === 'string' &&
      /^[a-z0-9-]{2,300}(,[a-z0-9-]{2,300})*$/.test(search.lucrari)
        ? search.lucrari
        : undefined,
    // No company has the tax ID 0.
    firma: builder || undefined,
    platit_min: numberFromParam(search.platit_min),
    platit_max: numberFromParam(search.platit_max),
    // The list's own order (the most paid first) is left out of the address.
    ordine:
      sort && !(sort.column === 'platit' && sort.dir === 'desc')
        ? sortToParam(sort, PROJECT_COLUMNS)
        : undefined,
    pe_pagina: pageSizeFromParam(search.pe_pagina),
    vedere: search.vedere === 'tabel' ? 'tabel' : undefined,
    pagina: pageFromParam(search.pagina),
  }
}

export function projectSort(search: ProjectListSearch): Sort {
  return (
    sortFromParam(search.ordine, PROJECT_COLUMNS) ?? {
      column: 'platit',
      dir: 'desc',
    }
  )
}

export type ProjectListFilter = {
  county?: string
  q?: string
  builder?: number
  match?: Array<Match>
  category?: Array<string>
  paid_min?: number
  paid_max?: number
}

// `categories` are the kinds of works the overview offers: an address names them by slug.
export function projectFilter(
  search: ProjectListSearch,
  categories: ReadonlyArray<string> = [],
): ProjectListFilter {
  const slugs = search.lucrari?.split(',') ?? []
  const chosen = categories.filter((each) => slugs.includes(worksSlug(each)))
  return {
    county: search.judet ? countyKey(search.judet) : undefined,
    q: search.q === undefined ? undefined : String(search.q),
    builder: search.firma,
    match: matchesFromParam(search.legatura),
    category: chosen.length ? chosen : undefined,
    paid_min: search.platit_min,
    paid_max: search.platit_max,
  }
}

export function projectApiSort(search: ProjectListSearch) {
  const sort = projectSort(search)
  return {
    sort: PROJECT_COLUMNS[sort.column as keyof typeof PROJECT_COLUMNS].api,
    order: sort.dir,
  }
}

export const PROJECT_FILTER_PARAMS = {
  q: ['q'],
  judet: ['judet'],
  firma: ['firma'],
  legatura: ['legatura'],
  lucrari: ['lucrari'],
  platit: ['platit_min', 'platit_max'],
} as const satisfies Record<string, ReadonlyArray<keyof ProjectListSearch>>
export type ProjectFilterKey = keyof typeof PROJECT_FILTER_PARAMS

export const PROJECT_BY_API_PARAM: Record<string, ProjectFilterKey> = {
  q: 'q',
  county: 'judet',
  builder: 'firma',
  match: 'legatura',
  category: 'lucrari',
  paid_min: 'platit',
  paid_max: 'platit',
}
