// The direct purchases of one institution or supplier as a list of the DataTable pattern:
// what its address holds, and what it asks the API for. The address is Romanian, the API's
// parameters English: /institutii/4305857?lista=achizitii&stare=7&valoare_min=50000. The
// list of every accepted purchase (`cui` null) is the "Achiziții directe" tab of
// Clasamente: /clasamente?clasament=achizitii&institutie=4981310&judet=gorj, the largest
// first.

import { ACCEPTED } from '#/lib/api'
import type { Role } from '#/lib/api'
import { countyCodeOfSlug } from '#/lib/counties'
import { countyParam } from '#/lib/county-filter'
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
  // The buyer's county, on the list of every purchase.
  judet?: string
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

// The most rows a file holds (the API's `CSV_ROWS`): the whole country is far more.
export const FILE_ROWS = 100_000

// `largest`: the list of every purchase opens on the largest, an entity's on the newest.
export function validatePurchaseListSearch(
  search: Record<string, unknown>,
  largest = false,
): PurchaseListSearch {
  const q =
    typeof search.q === 'string' || typeof search.q === 'number'
      ? String(search.q).trim().slice(0, 100)
      : ''
  const cpv = numberFromParam(search.cpv, 8)
  const stare = choiceFromParam(search.stare)
  const tip = choiceFromParam(search.tip)
  const sort = sortFromParam(search.ordine, PURCHASE_COLUMNS)
  // "Cele mai mari acceptate", the switch this list had before its columns sorted, wrote
  // ?ordine=valoare: such a link keeps showing the largest accepted purchases.
  const legacy = search.ordine === 'valoare' && stare === undefined
  const own = defaultSort(largest)
  return {
    q: q ? searchParam(q) : undefined,
    de_la: dayFromParam(search.de_la),
    pana_la: dayFromParam(search.pana_la),
    stare: legacy ? ACCEPTED : stare && choiceToParam(stare),
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
    judet: countyParam(search.judet),
    // The list's own order is left out of the address.
    ordine:
      sort && !(sort.column === own.column && sort.dir === own.dir)
        ? sortToParam(sort, PURCHASE_COLUMNS)
        : undefined,
    pe_pagina: pageSizeFromParam(search.pe_pagina),
    vedere: search.vedere === 'tabel' ? 'tabel' : undefined,
  }
}

function defaultSort(largest: boolean): Sort {
  return { column: largest ? 'valoare' : 'data', dir: 'desc' }
}

export function purchaseSort(
  search: PurchaseListSearch,
  largest = false,
): Sort {
  return sortFromParam(search.ordine, PURCHASE_COLUMNS) ?? defaultSort(largest)
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
  county?: string
  date_from?: string
  date_to?: string
}

// With no CUI, the list of every accepted purchase: the money spent, each row one value.
// Its company and institution are the address's filters.
export function purchaseFilter(
  role: Role,
  cui: number | null,
  search: PurchaseListSearch,
): PurchaseFilter {
  const party = role === 'institutions' ? search.furnizor : search.institutie
  const parties =
    cui === null
      ? { buyer: search.institutie, supplier: search.furnizor }
      : {
          [role === 'institutions' ? 'buyer' : 'supplier']: cui,
          [partyOf(role).api]: party,
        }
  return {
    ...parties,
    q: search.q === undefined ? undefined : String(search.q),
    state: cui === null ? [ACCEPTED] : choiceFromParam(search.stare),
    contract_type: choiceFromParam(search.tip),
    value_min: search.valoare_min,
    value_max: search.valoare_max,
    cpv: search.cpv === undefined ? undefined : String(search.cpv),
    county: countyCodeOfSlug(search.judet),
    date_from: search.de_la,
    date_to: search.pana_la,
  }
}

export function purchaseApiSort(search: PurchaseListSearch, largest = false) {
  const sort = purchaseSort(search, largest)
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
  judet: ['judet'],
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
  county: 'judet',
}

// The address of the list as a file, with every filter and the order shown.
export function purchaseFileSearch(
  role: Role,
  cui: number | null,
  search: PurchaseListSearch,
): Record<string, string> {
  // Not one party's list: its company and institution are filters.
  if (cui === null) {
    return { toate: 'da', ...fileParams(PURCHASE_FILTER_PARAMS, search) }
  }
  return {
    [role === 'institutions' ? 'cumparator' : 'vanzator']: String(cui),
    ...fileParams(PURCHASE_FILTER_PARAMS, search),
  }
}
