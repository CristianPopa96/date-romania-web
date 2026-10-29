import {
  dayFromParam,
  pageSizeFromParam,
  sortFromParam,
  sortToParam,
} from '#/lib/list'
import type { PageSize, Sort } from '#/lib/list'
import { pageFromParam, searchParam } from '#/lib/urls'
import { PATTERN_COLUMNS, contractTypeFromParam } from '#/features/patterns'

// The rankings page: which ranking, for winners how the contracts were won, and the
// filters: /clasamente?clasament=furnizori&cpv=45&ue=da. A ranking is a list of the
// DataTable pattern: words of a name, its order, its page size and page are in the address
// too: /clasamente?clasament=institutii&q=spital&ordine=numar&pagina=2.
export const RANKINGS = [
  'contracte',
  'furnizori',
  'achizitii',
  'institutii',
  'tipare',
] as const

export type RankingTab = (typeof RANKINGS)[number]

export type RankingSearch = {
  clasament?: RankingTab
  castigate?: 'asociere'
  // The start of a CPV code; the page offers divisions (two digits). A number when it
  // reads as one, like `q` on the search page, so the address is ?cpv=45, not ?cpv="45".
  cpv?: string | number
  // EU funds: only award notices say how they are paid for.
  ue?: 'da' | 'nu'
  // Direct purchases: who bought (`institutii`) rather than who sold, and their period.
  parte?: 'institutii'
  de_la?: string
  pana_la?: string
  q?: string | number
  // Tipare: SEAP's contract type, 1 goods, 2 services, 3 works.
  tip?: number
  ordine?: string
  pe_pagina?: PageSize
  pagina?: number
  vedere?: 'tabel'
}

// What the API filters a ranking by.
export type RankingFilter = { cpv?: string; eu?: boolean }

// The columns a ranking sorts by, by their name in the address.
export const RANKING_COLUMNS = {
  valoare: { api: 'value' },
  numar: { api: 'count' },
} as const

// The tabs that rank contracts, the only ones the EU funds filter applies to.
export function isContractTab(tab: RankingTab) {
  return tab === 'contracte' || tab === 'furnizori' || tab === 'institutii'
}

// The tabs that are one ranking of parties.
export function isRankingTab(tab: RankingTab) {
  return tab === 'furnizori' || tab === 'institutii' || tab === 'achizitii'
}

export function validateRankingSearch(
  search: Record<string, unknown>,
): RankingSearch {
  const tab = RANKINGS.find((name) => name === search.clasament) ?? 'contracte'
  // A code typed as digits arrives as a number: 45 for "45".
  const cpv =
    typeof search.cpv === 'string' || typeof search.cpv === 'number'
      ? String(search.cpv)
      : ''
  const q =
    typeof search.q === 'string' || typeof search.q === 'number'
      ? String(search.q).trim().slice(0, 100)
      : ''
  const ranking = isRankingTab(tab)
  const patterns = tab === 'tipare'
  // A list of the page: a ranking, or the pairs of a pattern.
  const list = ranking || patterns
  const direct = tab === 'achizitii'
  const sort = patterns
    ? sortFromParam(search.ordine, PATTERN_COLUMNS)
    : sortFromParam(search.ordine, RANKING_COLUMNS)
  // Each list's own order (the largest first) is left out of the address.
  const own = patterns
    ? sort?.column === 'achizitii' && sort.dir === 'desc'
    : sort?.column === 'valoare' && sort.dir === 'desc'
  return {
    // The largest contracts are the page's plain address.
    clasament: tab === 'contracte' ? undefined : tab,
    castigate:
      tab === 'furnizori' && search.castigate === 'asociere'
        ? 'asociere'
        : undefined,
    cpv: /^\d{2,8}$/.test(cpv) ? searchParam(cpv) : undefined,
    ue:
      isContractTab(tab) && (search.ue === 'da' || search.ue === 'nu')
        ? search.ue
        : undefined,
    parte: direct && search.parte === 'institutii' ? 'institutii' : undefined,
    de_la: direct ? dayFromParam(search.de_la) : undefined,
    pana_la: direct ? dayFromParam(search.pana_la) : undefined,
    // The API reads words of two letters or more, or a CUI.
    q: ranking && q.length >= 2 ? searchParam(q) : undefined,
    tip: patterns ? contractTypeFromParam(search.tip) : undefined,
    ordine:
      list && sort && !own
        ? sortToParam(sort, patterns ? PATTERN_COLUMNS : RANKING_COLUMNS)
        : undefined,
    pe_pagina: list ? pageSizeFromParam(search.pe_pagina) : undefined,
    pagina: list ? pageFromParam(search.pagina) : undefined,
    vedere: ranking && search.vedere === 'tabel' ? 'tabel' : undefined,
  }
}

export function rankingFilter(search: RankingSearch): RankingFilter {
  return {
    cpv: search.cpv === undefined ? undefined : String(search.cpv),
    eu: search.ue === undefined ? undefined : search.ue === 'da',
  }
}

export function rankingSort(search: RankingSearch): Sort {
  return (
    sortFromParam(search.ordine, RANKING_COLUMNS) ?? {
      column: 'valoare',
      dir: 'desc',
    }
  )
}

// The filters of a ranking in the address, for the empty state's "remove the filters".
export const RANKING_FILTER_PARAMS = {
  q: ['q'],
  cpv: ['cpv'],
  ue: ['ue'],
  perioada: ['de_la', 'pana_la'],
  tip: ['tip'],
} as const satisfies Record<string, ReadonlyArray<keyof RankingSearch>>
