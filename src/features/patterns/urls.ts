import { choiceFromParam, sortFromParam } from '#/lib/list'
import type { PageSize, Sort } from '#/lib/list'

// The pattern's list as the rankings page holds it: /clasamente?clasament=tipare&cpv=45&tip=3
// &ordine=valoare-desc. `tip` is SEAP's contract type: 1 goods, 2 services, 3 works.
export const CONTRACT_TYPES = [1, 2, 3] as const
export type ContractTypeParam = (typeof CONTRACT_TYPES)[number]

// What the pattern's list reads of the address (the rankings page validates it).
export type PatternSearch = {
  cpv?: string | number
  tip?: number
  ordine?: string
  pe_pagina?: PageSize
  pagina?: number
}

export const PATTERN_COLUMNS = {
  achizitii: { api: 'purchases' },
  valoare: { api: 'value' },
} as const

export function contractTypeFromParam(
  value: unknown,
): ContractTypeParam | undefined {
  const found = choiceFromParam(value)
  return found?.length === 1
    ? CONTRACT_TYPES.find((type) => type === found[0])
    : undefined
}

export function patternSort(ordine: unknown): Sort {
  return (
    sortFromParam(ordine, PATTERN_COLUMNS) ?? {
      column: 'achizitii',
      dir: 'desc',
    }
  )
}

// The file of the "just under the limit" pattern: every purchase of every pair, with the
// filters of the list. Null for an address with anything else, or a value that is not one.
export function patternCsvPath(cpv?: string, type?: ContractTypeParam) {
  const params = new URLSearchParams()
  if (cpv) params.set('cpv', cpv)
  if (type) params.set('tip', String(type))
  const query = params.toString()
  return query ? `/tipare.csv?${query}` : '/tipare.csv'
}

export function patternCsvFilterFromSearch(
  params: URLSearchParams,
): { cpv?: string; contract_type?: ContractTypeParam } | null {
  if ([...params.keys()].some((key) => key !== 'cpv' && key !== 'tip')) {
    return null
  }
  const cpv = params.get('cpv')
  if (cpv !== null && !/^\d{2,8}$/.test(cpv)) return null
  const tip = params.get('tip')
  const type = tip === null ? undefined : contractTypeFromParam(Number(tip))
  if (tip !== null && type === undefined) return null
  return { cpv: cpv ?? undefined, contract_type: type }
}
