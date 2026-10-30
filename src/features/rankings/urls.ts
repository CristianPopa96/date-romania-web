import {
  dayFromParam,
  pageSizeFromParam,
  sortFromParam,
  sortToParam,
} from '#/lib/list'
import type { PageSize, Sort } from '#/lib/list'
import { countyParam } from '#/lib/county-filter'
import { pageFromParam, searchParam } from '#/lib/urls'
import { PATTERN_COLUMNS, contractTypeFromParam } from '#/features/patterns'
import { validateContractListSearch } from '#/features/contracts'
import type { ContractListSearch } from '#/features/contracts'
import { validatePurchaseListSearch } from '#/features/purchases'
import type { PurchaseListSearch } from '#/features/purchases'

// The rankings page, Clasamente (design round 14): two lists of SEAP records, "Contracte"
// (the page's plain address) and "Achiziții directe", whose addresses are their lists'
// (contracts/list.ts, purchases/list.ts); two rankings of parties, "Furnizori" and
// "Instituții", each by contracts or, with `bani`, by direct purchases; and "Tipare". A
// ranking is a list of the DataTable pattern:
// /clasamente?clasament=institutii&bani=achizitii&judet=gorj&q=spital&ordine=numar&pagina=2.
export const RANKINGS = [
  'contracte',
  'furnizori',
  'achizitii',
  'institutii',
  'tipare',
] as const

export type RankingTab = (typeof RANKINGS)[number]

// The address of a ranking of parties, or of Tipare.
export type RankingSearch = {
  clasament?: RankingTab
  // A ranking by direct purchases rather than by contracts: one kind of money at a time.
  bani?: 'achizitii'
  castigate?: 'asociere'
  // The start of a CPV code; the page offers divisions (two digits). A number when it
  // reads as one, like `q` on the search page, so the address is ?cpv=45, not ?cpv="45".
  cpv?: string | number
  // EU funds: only award notices say how they are paid for.
  ue?: 'da' | 'nu'
  // The county of the party ranked.
  judet?: string
  // Direct purchases: their period.
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

// The tabs that rank parties.
export function isRankingTab(tab: RankingTab) {
  return tab === 'furnizori' || tab === 'institutii'
}

// The tabs that are lists of records, each with its own address.
export function isRecordTab(tab: RankingTab) {
  return tab === 'contracte' || tab === 'achizitii'
}

export function tabOf(search: Record<string, unknown>): RankingTab {
  return RANKINGS.find((name) => name === search.clasament) ?? 'contracte'
}

export function validateRankingSearch(
  search: Record<string, unknown>,
): RankingSearch {
  const tab = tabOf(search)
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
  const direct = ranking && search.bani === 'achizitii'
  const sort = patterns
    ? sortFromParam(search.ordine, PATTERN_COLUMNS)
    : sortFromParam(search.ordine, RANKING_COLUMNS)
  // Each list's own order (the largest first) is left out of the address.
  const own = patterns
    ? sort?.column === 'achizitii' && sort.dir === 'desc'
    : sort?.column === 'valoare' && sort.dir === 'desc'
  return {
    clasament: tab,
    bani: direct ? 'achizitii' : undefined,
    castigate:
      tab === 'furnizori' && !direct && search.castigate === 'asociere'
        ? 'asociere'
        : undefined,
    cpv: /^\d{2,8}$/.test(cpv) ? searchParam(cpv) : undefined,
    ue:
      ranking && !direct && (search.ue === 'da' || search.ue === 'nu')
        ? search.ue
        : undefined,
    judet: ranking ? countyParam(search.judet) : undefined,
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

// The filters that go with the reader from one tab to the next, where they apply.
export function keptAcrossTabs(search: Record<string, unknown>) {
  return { cpv: search.cpv, ue: search.ue, judet: search.judet }
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
  judet: ['judet'],
  perioada: ['de_la', 'pana_la'],
  tip: ['tip'],
} as const satisfies Record<string, ReadonlyArray<keyof RankingSearch>>

// The address of the whole page: a ranking's, or the list of the tab it opens.
export type ClasamenteSearch = RankingSearch &
  ContractListSearch &
  PurchaseListSearch & { pagina?: number }

// The two lists of records keep their own list's address, the largest first, with only the
// filters the tab offers: never a filter the reader cannot see.
export function validateClasamenteSearch(
  search: Record<string, unknown>,
): ClasamenteSearch {
  const tab = tabOf(search)
  const page = { pagina: pageFromParam(search.pagina) }
  if (tab === 'contracte') {
    const list = validateContractListSearch(search, true)
    return {
      ...list,
      fel: undefined,
      valoare_min: undefined,
      valoare_max: undefined,
      ...page,
    }
  }
  if (tab === 'achizitii') {
    const list = validatePurchaseListSearch(search, true)
    return {
      clasament: 'achizitii',
      ...list,
      stare: undefined,
      tip: undefined,
      valoare_min: undefined,
      valoare_max: undefined,
      ...page,
    }
  }
  return validateRankingSearch(search)
}
