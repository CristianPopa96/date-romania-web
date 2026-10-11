// What a shared address means: the parts of a URL that decide which page is shown.

// Search params shared by the institution and the supplier page.
// `lista` picks one of the two lists; left out, the page opens on its contracts when it
// has any, else on its direct purchases.
export type EntityList = 'contracte' | 'achizitii'
export type EntitySearch = {
  lista?: EntityList
  pagina?: number
  ordine?: 'valoare'
}

export function validateEntitySearch(
  search: Record<string, unknown>,
): EntitySearch {
  const page = Number(search.pagina)
  return {
    lista:
      search.lista === 'contracte' || search.lista === 'achizitii'
        ? search.lista
        : undefined,
    pagina: Number.isInteger(page) && page > 1 ? page : undefined,
    ordine: search.ordine === 'valoare' ? 'valoare' : undefined,
  }
}

// The list an entity page shows. Contracts come first, but most institutions and
// companies have none signed in the period, and an empty list is a poor way in.
export function entityList(
  search: EntitySearch,
  hasContracts: boolean,
): EntityList {
  return search.lista ?? (hasContracts ? 'contracte' : 'achizitii')
}

// The address of a list on an entity page; the list shown by default is left out.
export function entityListSearch(
  list: EntityList,
  hasContracts: boolean,
): EntitySearch {
  return { lista: list === entityList({}, hasContracts) ? undefined : list }
}

// The CUI in an address like /institutii/4305857. Only the shape is checked here (a CUI
// has at most ten digits); the API knows which numbers exist and answers "not found".
export function cuiFromPath(text: string) {
  return /^\d{1,10}$/.test(text) ? Number(text) : null
}

// Search params of a page whose list is paged and nothing else.
export type PageSearch = { pagina?: number }

export function validatePageSearch(
  search: Record<string, unknown>,
): PageSearch {
  return { pagina: validateEntitySearch(search).pagina }
}

// SEAP's own id in an address like /contracte/100660503. Only the shape is checked; the
// API knows which records exist.
export function idFromPath(text: string) {
  return /^\d{1,12}$/.test(text) ? Number(text) : null
}

// The rankings page: which ranking, and for winners how the contracts were won.
export const RANKINGS = [
  'contracte',
  'furnizori',
  'achizitii',
  'institutii',
] as const
export type RankingTab = (typeof RANKINGS)[number]
export type RankingSearch = { clasament?: RankingTab; castigate?: 'asociere' }

export function validateRankingSearch(
  search: Record<string, unknown>,
): RankingSearch {
  const tab = RANKINGS.find((name) => name === search.clasament)
  return {
    // The largest contracts are the page's plain address.
    clasament: tab === 'contracte' ? undefined : tab,
    castigate:
      tab === 'furnizori' && search.castigate === 'asociere'
        ? 'asociere'
        : undefined,
  }
}

// Whose contracts a CSV file holds: /contracte.csv?institutie=4981310, ?furnizor=...,
// or with neither, every contract of the period.
export type CsvFilter = { buyer?: number; supplier?: number }

export function contractsCsvPath(filter: CsvFilter) {
  if (filter.buyer !== undefined) {
    return `/contracte.csv?institutie=${filter.buyer}`
  }
  if (filter.supplier !== undefined) {
    return `/contracte.csv?furnizor=${filter.supplier}`
  }
  return '/contracte.csv'
}

// Null for an address that names something other than one CUI.
export function csvFilterFromSearch(params: URLSearchParams): CsvFilter | null {
  const buyer = params.get('institutie')
  const supplier = params.get('furnizor')
  if (buyer !== null && supplier !== null) return null
  if (buyer !== null) {
    const cui = cuiFromPath(buyer)
    return cui === null ? null : { buyer: cui }
  }
  if (supplier !== null) {
    const cui = cuiFromPath(supplier)
    return cui === null ? null : { supplier: cui }
  }
  return {}
}
