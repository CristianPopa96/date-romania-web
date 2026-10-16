// What a shared address means: the parts of a URL that decide which page is shown.
import { isMatchParam } from '#/lib/programme'
import type { MatchParam } from '#/lib/programme'
import { sitePath } from '#/lib/reports'

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

// /surse?fila=metodologie; the sources themselves are the page's plain address.
// `despre` is the page a reader came from to report an error: /surse?despre=/contracte/9001.
export type SourcesSearch = {
  fila?: 'metodologie' | 'corecturi'
  despre?: string
}

export function validateSourcesSearch(
  search: Record<string, unknown>,
): SourcesSearch {
  return {
    fila:
      search.fila === 'metodologie' || search.fila === 'corecturi'
        ? search.fila
        : undefined,
    despre: sitePath(search.despre),
  }
}

// Whose contracts a CSV file holds: /contracte.csv?institutie=4981310, ?furnizor=...,
// or with neither, every contract of the period, which the filters of the rankings can
// narrow: /contracte.csv?cpv=45&ue=da.
export type CsvFilter = { buyer?: number; supplier?: number } & RankingFilter

export function contractsCsvPath(filter: CsvFilter) {
  if (filter.buyer !== undefined) {
    return `/contracte.csv?institutie=${filter.buyer}`
  }
  if (filter.supplier !== undefined) {
    return `/contracte.csv?furnizor=${filter.supplier}`
  }
  const params = new URLSearchParams()
  if (filter.cpv) params.set('cpv', filter.cpv)
  if (filter.eu !== undefined) params.set('ue', filter.eu ? 'da' : 'nu')
  const query = params.toString()
  return query ? `/contracte.csv?${query}` : '/contracte.csv'
}

// Null for an address that names something other than one CUI, or the whole period
// with valid filters. The contracts of one CUI take no filter, so one with a filter is
// refused rather than answered without it.
export function csvFilterFromSearch(params: URLSearchParams): CsvFilter | null {
  const buyer = params.get('institutie')
  const supplier = params.get('furnizor')
  if (buyer !== null && supplier !== null) return null
  const filtered = params.has('cpv') || params.has('ue')
  if ((buyer !== null || supplier !== null) && filtered) return null
  if (buyer !== null) {
    const cui = cuiFromPath(buyer)
    return cui === null ? null : { buyer: cui }
  }
  if (supplier !== null) {
    const cui = cuiFromPath(supplier)
    return cui === null ? null : { supplier: cui }
  }
  const cpv = params.get('cpv')
  const eu = params.get('ue')
  if (cpv !== null && !/^\d{2,8}$/.test(cpv)) return null
  if (eu !== null && eu !== 'da' && eu !== 'nu') return null
  return {
    cpv: cpv ?? undefined,
    eu: eu === null ? undefined : eu === 'da',
  }
}

// The file of the "just under the limit" pattern: every purchase of every pair, with the
// CPV filter of the tab. Null for an address with anything else, or a CPV that is not one.
export function patternCsvPath(cpv?: string) {
  return cpv ? `/tipare.csv?cpv=${cpv}` : '/tipare.csv'
}

export function patternCsvFilterFromSearch(
  params: URLSearchParams,
): { cpv?: string } | null {
  if ([...params.keys()].some((key) => key !== 'cpv')) return null
  const cpv = params.get('cpv')
  if (cpv !== null && !/^\d{2,8}$/.test(cpv)) return null
  return { cpv: cpv ?? undefined }
}

// The search page: the words searched, and one kind of result when a tab narrows them.
export type SearchKind = 'institutii' | 'firme'
// `q` is a number when the address carries one (a CUI): written back as text it would
// come out in quotes, `?q="4981310"`.
export type SearchSearch = { q: string | number; tip?: SearchKind }

// What the search box puts in the address for the words typed.
export function searchParam(text: string): string | number {
  return /^[1-9]\d{0,14}$/.test(text) ? Number(text) : text
}

export function validateSearchSearch(
  search: Record<string, unknown>,
): SearchSearch {
  return {
    q:
      typeof search.q === 'string' || typeof search.q === 'number'
        ? search.q
        : '',
    tip:
      search.tip === 'institutii' || search.tip === 'firme'
        ? search.tip
        : undefined,
  }
}

// The programme page: /programe/anghel-saligny?judet=gorj&q=drum&legatura=mai-multe.
// `firma` is a builder's CUI, for "every project this company builds".
export type ProgrammeSearch = {
  judet?: string
  q?: string
  legatura?: MatchParam
  firma?: number
  pagina?: number
}

export function validateProgrammeSearch(
  search: Record<string, unknown>,
): ProgrammeSearch {
  // A number typed in the field arrives as a number, like a CUI in the search page.
  const q =
    typeof search.q === 'string' || typeof search.q === 'number'
      ? String(search.q).trim().slice(0, 100)
      : ''
  const builder =
    typeof search.firma === 'number' || typeof search.firma === 'string'
      ? cuiFromPath(String(search.firma))
      : null
  return {
    judet:
      typeof search.judet === 'string' &&
      /^[a-z]{2,20}(-[a-z]{2,20})?$/.test(search.judet)
        ? search.judet
        : undefined,
    q: q.length >= 2 ? q : undefined,
    legatura: isMatchParam(search.legatura) ? search.legatura : undefined,
    // No company has the tax ID 0.
    firma: builder || undefined,
    pagina: validateEntitySearch(search).pagina,
  }
}
