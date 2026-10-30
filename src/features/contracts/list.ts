// The contracts of one institution or supplier as a list of the DataTable pattern: what its
// address holds, and what it asks the API for. The address is Romanian, the API's
// parameters English: /institutii/4305857?lista=contracte&fel=3&valoare_min=1000000. The
// same list of every contract (`cui` null) is the "Contracte" tab of Clasamente:
// /clasamente?furnizor=17886786&judet=gorj, the largest first.

import type { Role } from '#/lib/api'
import { countyCodeOfSlug } from '#/lib/counties'
import { countyParam } from '#/lib/county-filter'
import {
  choiceFromParam,
  choiceToParam,
  dayFromParam,
  fileParams,
  numberFromParam,
  pageSizeFromParam,
  sortFromParam,
  sortToParam,
} from '#/lib/list'
import type { PageSize, Sort } from '#/lib/list'
import { searchParam } from '#/lib/urls'

// The kinds of contract a list holds: ordinary and subsequent. A framework agreement is a
// ceiling and is never in the list.
export const CONTRACT_KINDS = [1, 3] as const

// How a company won: alone, or in an association. Never both in one list (DataTable).
export type WonParam = 'singur' | 'asociere'
export type Won = 'alone' | 'association'

// Text that reads as a number is kept as one (`q`, `fel`, `cpv`): as text, the router
// would write it in quotes. The names shared with the purchases list (q, de_la, valoare_min,
// furnizor, ordine...) mean the same there.
export type ContractListSearch = {
  q?: string | number
  de_la?: string
  pana_la?: string
  valoare_min?: number
  valoare_max?: number
  // The other party, by CUI: a winner on an institution's page, a buyer on a company's.
  furnizor?: number
  institutie?: number
  cpv?: string | number
  // The buyer's county, on the list of every contract.
  judet?: string
  fel?: string | number
  // EU funds: 'da' or 'nu', as the rankings say it.
  ue?: 'da' | 'nu'
  castig?: WonParam
  ordine?: string
  pe_pagina?: PageSize
  vedere?: 'tabel'
}

// The columns that sort, by their name in the address, as in the purchases list.
export const CONTRACT_COLUMNS = {
  data: { api: 'date' },
  valoare: { api: 'value' },
  furnizor: { api: 'supplier', text: true },
  institutie: { api: 'buyer', text: true },
} as const

// `largest`: the list of every contract opens on the largest, an entity's on the newest.
export function validateContractListSearch(
  search: Record<string, unknown>,
  largest = false,
): ContractListSearch {
  const q =
    typeof search.q === 'string' || typeof search.q === 'number'
      ? String(search.q).trim().slice(0, 100)
      : ''
  const cpv = numberFromParam(search.cpv, 8)
  const kinds = choiceFromParam(search.fel)?.filter((kind) =>
    (CONTRACT_KINDS as ReadonlyArray<number>).includes(kind),
  )
  const sort = sortFromParam(search.ordine, CONTRACT_COLUMNS)
  const own = defaultSort(largest)
  return {
    q: q ? searchParam(q) : undefined,
    de_la: dayFromParam(search.de_la),
    pana_la: dayFromParam(search.pana_la),
    valoare_min: numberFromParam(search.valoare_min),
    valoare_max: numberFromParam(search.valoare_max),
    furnizor: numberFromParam(search.furnizor, 10),
    institutie: numberFromParam(search.institutie, 10),
    cpv:
      cpv !== undefined && String(search.cpv).length >= 2
        ? searchParam(String(search.cpv))
        : undefined,
    judet: countyParam(search.judet),
    fel: kinds?.length ? choiceToParam(kinds) : undefined,
    ue: search.ue === 'da' || search.ue === 'nu' ? search.ue : undefined,
    castig:
      search.castig === 'singur' || search.castig === 'asociere'
        ? search.castig
        : undefined,
    // The list's own order is left out of the address.
    ordine:
      sort && !(sort.column === own.column && sort.dir === own.dir)
        ? sortToParam(sort, CONTRACT_COLUMNS)
        : undefined,
    pe_pagina: pageSizeFromParam(search.pe_pagina),
    vedere: search.vedere === 'tabel' ? 'tabel' : undefined,
  }
}

function defaultSort(largest: boolean): Sort {
  return { column: largest ? 'valoare' : 'data', dir: 'desc' }
}

export function contractSort(
  search: ContractListSearch,
  largest = false,
): Sort {
  return sortFromParam(search.ordine, CONTRACT_COLUMNS) ?? defaultSort(largest)
}

// How a company's list was won: the address's choice, else alone when it won anything
// alone, else in an association.
export function wonOf(search: ContractListSearch, alone: number): Won {
  if (search.castig === 'asociere') return 'association'
  if (search.castig === 'singur') return 'alone'
  return alone > 0 ? 'alone' : 'association'
}

// What the API is asked, for the list, its figures and its file.
export type ContractFilter = {
  buyer?: number
  supplier?: number
  q?: string
  won?: Won
  kind?: Array<number>
  eu_funded?: string
  value_min?: number
  value_max?: number
  cpv?: string
  county?: string
  date_from?: string
  date_to?: string
}

// How the address's "Câștigat" reads, on the list of every contract.
export function wonOfParam(param: WonParam | undefined): Won | undefined {
  if (param === undefined) return undefined
  return param === 'asociere' ? 'association' : 'alone'
}

// `won` is the company's way of winning (wonOf); a buyer's list holds both. With no CUI,
// the list of every contract: the company and the institution are the address's filters.
export function contractFilter(
  role: Role,
  cui: number | null,
  search: ContractListSearch,
  won?: Won,
): ContractFilter {
  const party = role === 'institutions' ? search.furnizor : search.institutie
  const parties =
    cui === null
      ? { buyer: search.institutie, supplier: search.furnizor }
      : {
          [role === 'institutions' ? 'buyer' : 'supplier']: cui,
          [role === 'institutions' ? 'supplier' : 'buyer']: party,
        }
  return {
    ...parties,
    q: search.q === undefined ? undefined : String(search.q),
    won:
      cui === null
        ? wonOfParam(search.castig)
        : role === 'suppliers'
          ? won
          : undefined,
    kind: choiceFromParam(search.fel),
    eu_funded: search.ue === undefined ? undefined : String(search.ue === 'da'),
    value_min: search.valoare_min,
    value_max: search.valoare_max,
    cpv: search.cpv === undefined ? undefined : String(search.cpv),
    county: countyCodeOfSlug(search.judet),
    date_from: search.de_la,
    date_to: search.pana_la,
  }
}

export function contractApiSort(search: ContractListSearch, largest = false) {
  const sort = contractSort(search, largest)
  return {
    sort: CONTRACT_COLUMNS[sort.column as keyof typeof CONTRACT_COLUMNS].api,
    order: sort.dir,
  }
}

// The filters of the list, by their key; each key names the address parameters it sets.
// `castig` is not one of them: it picks which list a company's is, like the tabs.
export const CONTRACT_FILTER_PARAMS = {
  q: ['q'],
  perioada: ['de_la', 'pana_la'],
  valoare: ['valoare_min', 'valoare_max'],
  furnizor: ['furnizor'],
  institutie: ['institutie'],
  cpv: ['cpv'],
  judet: ['judet'],
  fel: ['fel'],
  ue: ['ue'],
} as const satisfies Record<string, ReadonlyArray<keyof ContractListSearch>>
export type ContractFilterKey = keyof typeof CONTRACT_FILTER_PARAMS

export const CONTRACT_BY_API_PARAM: Record<string, ContractFilterKey> = {
  q: 'q',
  date_from: 'perioada',
  date_to: 'perioada',
  value_min: 'valoare',
  value_max: 'valoare',
  supplier: 'furnizor',
  buyer: 'institutie',
  cpv: 'cpv',
  county: 'judet',
  kind: 'fel',
  eu_funded: 'ue',
}

// The address of the list as a file: the CUI, how a company's was won, the filters and the
// order shown. The list of every contract keeps its "Câștigat" as it is.
export function contractFileSearch(
  role: Role,
  cui: number | null,
  search: ContractListSearch,
  won?: Won,
): Record<string, string> {
  if (cui === null) {
    return {
      // Not one party's list: its company and institution are filters, its order the
      // largest first.
      toate: 'da',
      ...(search.castig ? { castig: search.castig } : {}),
      ...fileParams(CONTRACT_FILTER_PARAMS, search),
    }
  }
  return {
    [role === 'institutions' ? 'institutie' : 'furnizor']: String(cui),
    ...(role === 'suppliers' && won
      ? { castig: won === 'alone' ? 'singur' : 'asociere' }
      : {}),
    ...fileParams(CONTRACT_FILTER_PARAMS, search),
  }
}
