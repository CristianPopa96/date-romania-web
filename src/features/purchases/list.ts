// The direct purchases of one institution or supplier as a list of the DataTable pattern:
// what its address holds, and what it asks the API for. The address is Romanian, the API's
// parameters English: /institutii/4305857?lista=achizitii&stare=7&valoare_min=50000.

import type { Role } from '#/lib/api'
import { searchParam } from '#/lib/urls'
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

// Text that reads as a number is kept as one (`q`, `stare`, `tip`, `cpv`), as on the
// search page: as text, the router would write it in quotes, ?stare=%227%22.
export type PurchaseListSearch = {
  q?: string | number
  de_la?: string
  pana_la?: string
  stare?: string | number
  tip?: string | number
  valoare_min?: number
  valoare_max?: number
  // The other party, by CUI: a supplier on an institution's page, an institution on a
  // supplier's.
  furnizor?: number
  institutie?: number
  cpv?: string | number
  ordine?: string
  pe_pagina?: PageSize
  vedere?: 'tabel'
}

// The columns that sort, by their name in the address. The party's name is text.
export const PURCHASE_COLUMNS = {
  data: { api: 'date' },
  valoare: { api: 'value' },
  furnizor: { api: 'supplier', text: true },
  institutie: { api: 'buyer', text: true },
} as const

// The other party of a list: the supplier on an institution's page and the other way round.
export function partyOf(role: Role) {
  return role === 'institutions'
    ? ({ param: 'furnizor', api: 'supplier' } as const)
    : ({ param: 'institutie', api: 'buyer' } as const)
}

export function validatePurchaseListSearch(
  search: Record<string, unknown>,
): PurchaseListSearch {
  const q =
    typeof search.q === 'string' || typeof search.q === 'number'
      ? String(search.q).trim().slice(0, 100)
      : ''
  const cpv = numberFromParam(search.cpv, 8)
  const stare = choiceFromParam(search.stare)
  const tip = choiceFromParam(search.tip)
  const sort = sortFromParam(search.ordine, PURCHASE_COLUMNS)
  return {
    q: q ? searchParam(q) : undefined,
    de_la: dayFromParam(search.de_la),
    pana_la: dayFromParam(search.pana_la),
    stare: stare && choiceToParam(stare),
    tip: tip && choiceToParam(tip),
    valoare_min: numberFromParam(search.valoare_min),
    valoare_max: numberFromParam(search.valoare_max),
    furnizor: numberFromParam(search.furnizor, 10),
    institutie: numberFromParam(search.institutie, 10),
    // A CPV code is digits; the address may give it as a number, which drops a leading 0.
    cpv:
      cpv !== undefined && String(search.cpv).length >= 2
        ? searchParam(String(search.cpv))
        : undefined,
    // The list's own order (newest first) is left out of the address.
    ordine:
      sort && !(sort.column === 'data' && sort.dir === 'desc')
        ? sortToParam(sort, PURCHASE_COLUMNS)
        : undefined,
    pe_pagina: pageSizeFromParam(search.pe_pagina),
    vedere: search.vedere === 'tabel' ? 'tabel' : undefined,
  }
}

export function purchaseSort(search: PurchaseListSearch): Sort {
  return (
    sortFromParam(search.ordine, PURCHASE_COLUMNS) ?? {
      column: 'data',
      dir: 'desc',
    }
  )
}

// What the API is asked, for the list, its figures and its file.
export type PurchaseFilter = {
  buyer?: number
  supplier?: number
  q?: string
  state?: Array<number>
  contract_type?: Array<number>
  value_min?: number
  value_max?: number
  cpv?: string
  date_from?: string
  date_to?: string
}

export function purchaseFilter(
  role: Role,
  cui: number,
  search: PurchaseListSearch,
): PurchaseFilter {
  const party = role === 'institutions' ? search.furnizor : search.institutie
  return {
    [role === 'institutions' ? 'buyer' : 'supplier']: cui,
    [partyOf(role).api]: party,
    q: search.q === undefined ? undefined : String(search.q),
    state: choiceFromParam(search.stare),
    contract_type: choiceFromParam(search.tip),
    value_min: search.valoare_min,
    value_max: search.valoare_max,
    cpv: search.cpv === undefined ? undefined : String(search.cpv),
    date_from: search.de_la,
    date_to: search.pana_la,
  }
}

export function purchaseApiSort(search: PurchaseListSearch) {
  const sort = purchaseSort(search)
  return {
    sort: PURCHASE_COLUMNS[sort.column as keyof typeof PURCHASE_COLUMNS].api,
    order: sort.dir,
  }
}

// The filters of the list, by their key; each key names the address parameters it sets.
export const PURCHASE_FILTER_PARAMS = {
  q: ['q'],
  perioada: ['de_la', 'pana_la'],
  valoare: ['valoare_min', 'valoare_max'],
  stare: ['stare'],
  tip: ['tip'],
  furnizor: ['furnizor'],
  institutie: ['institutie'],
  cpv: ['cpv'],
} as const satisfies Record<string, ReadonlyArray<keyof PurchaseListSearch>>
export type PurchaseFilterKey = keyof typeof PURCHASE_FILTER_PARAMS

// The filter of each API parameter, for "Fără filtrul «Valoare» ar fi 12" (lib/list.ts
// `emptyHint`).
export const PURCHASE_BY_API_PARAM: Record<string, PurchaseFilterKey> = {
  q: 'q',
  date_from: 'perioada',
  date_to: 'perioada',
  value_min: 'valoare',
  value_max: 'valoare',
  state: 'stare',
  contract_type: 'tip',
  supplier: 'furnizor',
  buyer: 'institutie',
  cpv: 'cpv',
}

// The address of the list as a file, with every filter and the order shown.
export function purchaseFileSearch(
  role: Role,
  cui: number,
  search: PurchaseListSearch,
): Record<string, string> {
  return {
    [role === 'institutions' ? 'cumparator' : 'vanzator']: String(cui),
    ...fileParams(PURCHASE_FILTER_PARAMS, search),
  }
}
