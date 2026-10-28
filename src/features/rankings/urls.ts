import { searchParam } from '#/lib/urls'

// The rankings page: which ranking, for winners how the contracts were won, and the
// filters: /clasamente?clasament=furnizori&cpv=45&ue=da.
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
}

// What the API filters a ranking by.
export type RankingFilter = { cpv?: string; eu?: boolean }

// The tabs that rank contracts, the only ones the EU funds filter applies to.
export function isContractTab(tab: RankingTab) {
  return tab === 'contracte' || tab === 'furnizori' || tab === 'institutii'
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
  }
}

export function rankingFilter(search: RankingSearch): RankingFilter {
  return {
    cpv: search.cpv === undefined ? undefined : String(search.cpv),
    eu: search.ue === undefined ? undefined : search.ue === 'da',
  }
}
