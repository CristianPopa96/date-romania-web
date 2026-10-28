import { cuiFromPath } from '#/lib/urls'
import type { RankingFilter } from '#/features/rankings'

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
