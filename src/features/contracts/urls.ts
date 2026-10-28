import {
  contractApiSort,
  contractFilter,
  validateContractListSearch,
} from '#/features/contracts/list'
import type { ContractFilter } from '#/features/contracts/list'
import type { RankingFilter } from '#/features/rankings'
import { cuiFromPath } from '#/lib/urls'

// The file of every contract of the period, which the filters of the rankings can narrow:
// /contracte.csv?cpv=45&ue=da. The file of one institution's or company's list is written
// by the list itself (contractFileSearch).
export function contractsCsvPath(filter: RankingFilter) {
  const params = new URLSearchParams()
  if (filter.cpv) params.set('cpv', filter.cpv)
  if (filter.eu !== undefined) params.set('ue', filter.eu ? 'da' : 'nu')
  const query = params.toString()
  return query ? `/contracte.csv?${query}` : '/contracte.csv'
}

// What the API is asked for a file: /contracte.csv?institutie=4981310&fel=3&ordine=valoare-desc,
// a company's with how it won (?furnizor=17886786&castig=asociere), or the whole period
// with the filters of the rankings, largest first. Null for an address with a CUI that is
// not one, or a ranking filter that is not one.
export function contractsCsvQuery(
  params: URLSearchParams,
): (ContractFilter & { sort: string; order: 'asc' | 'desc' }) | null {
  const buyerParam = params.get('institutie')
  const supplierParam = params.get('furnizor')
  const buyer = buyerParam === null ? undefined : cuiFromPath(buyerParam)
  const supplier =
    supplierParam === null ? undefined : cuiFromPath(supplierParam)
  if (buyer === null || supplier === null) return null
  const search = validateContractListSearch(Object.fromEntries(params))
  if (buyer === undefined && supplier === undefined) {
    const cpv = params.get('cpv')
    const eu = params.get('ue')
    if (cpv !== null && !/^\d{2,8}$/.test(cpv)) return null
    if (eu !== null && eu !== 'da' && eu !== 'nu') return null
    return {
      cpv: cpv ?? undefined,
      eu_funded: eu === null ? undefined : String(eu === 'da'),
      sort: 'value',
      order: 'desc',
    }
  }
  // A company's file is one way of winning, as its list is; a buyer's holds both.
  const won =
    supplier === undefined || buyer !== undefined
      ? undefined
      : search.castig === 'asociere'
        ? ('association' as const)
        : ('alone' as const)
  const filter =
    buyer !== undefined
      ? contractFilter('institutions', buyer, search)
      : contractFilter('suppliers', supplier as number, search, won)
  return {
    ...filter,
    // A buyer's file filtered by one winner, from its list.
    supplier: supplier ?? filter.supplier,
    ...contractApiSort(search),
  }
}
