// The contracts of one institution or supplier as a list of the DataTable pattern: what its
// address holds, and what it asks the API for. The address is Romanian, the API's
// parameters English: /institutii/4305857?lista=contracte&fel=3&valoare_min=1000000.

import type { Role } from '#/lib/api'
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

export function validateContractListSearch(
  search: Record<string, unknown>,
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
    fel: kinds?.length ? choiceToParam(kinds) : undefined,
    ue: search.ue === 'da' || search.ue === 'nu' ? search.ue : undefined,
    castig:
      search.castig === 'singur' || search.castig === 'asociere'
        ? search.castig
        : undefined,
    // The list's own order (newest first) is left out of the address.
    ordine:
      sort && !(sort.column === 'data' && sort.dir === 'desc')
        ? sortToParam(sort, CONTRACT_COLUMNS)
        : undefined,
    pe_pagina: pageSizeFromParam(search.pe_pagina),
    vedere: search.vedere === 'tabel' ? 'tabel' : undefined,
  }
}

export function contractSort(search: ContractListSearch): Sort {
  return (
    sortFromParam(search.ordine, CONTRACT_COLUMNS) ?? {
      column: 'data',
      dir: 'desc',
    }
  )
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
  date_from?: string
  date_to?: string
}

// `won` is the company's way of winning (wonOf); a buyer's list holds both.
export function contractFilter(
  role: Role,
  cui: number,
  search: ContractListSearch,
  won?: Won,
): ContractFilter {
  const party = role === 'institutions' ? search.furnizor : search.institutie
  return {
    [role === 'institutions' ? 'buyer' : 'supplier']: cui,
    [role === 'institutions' ? 'supplier' : 'buyer']: party,
    q: search.q === undefined ? undefined : String(search.q),
    won: role === 'suppliers' ? won : undefined,
    kind: choiceFromParam(search.fel),
    eu_funded: search.ue === undefined ? undefined : String(search.ue === 'da'),
    value_min: search.valoare_min,
    value_max: search.valoare_max,
    cpv: search.cpv === undefined ? undefined : String(search.cpv),
    date_from: search.de_la,
    date_to: search.pana_la,
  }
}

export function contractApiSort(search: ContractListSearch) {
  const sort = contractSort(search)
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
  kind: 'fel',
  eu_funded: 'ue',
}

// The address of the list as a file: the CUI, how a company's was won, the filters and the
// order shown.
export function contractFileSearch(
  role: Role,
  cui: number,
  search: ContractListSearch,
  won?: Won,
): Record<string, string> {
  return {
    [role === 'institutions' ? 'institutie' : 'furnizor']: String(cui),
    ...(role === 'suppliers' && won
      ? { castig: won === 'alone' ? 'singur' : 'asociere' }
      : {}),
    ...fileParams(CONTRACT_FILTER_PARAMS, search),
  }
}
