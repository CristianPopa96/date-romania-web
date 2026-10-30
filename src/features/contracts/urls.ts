import {
  contractApiSort,
  contractFilter,
  validateContractListSearch,
  wonOf,
} from '#/features/contracts/list'
import type { ContractFilter } from '#/features/contracts/list'
import { cuiFromPath } from '#/lib/urls'

// What the API is asked for a file: /contracte.csv?institutie=4981310&fel=3&ordine=valoare-desc,
// a company's with how it won (?furnizor=17886786&castig=asociere), or the list of every
// contract with its filters (?toate=da&judet=gorj&furnizor=17886786), largest first. Null
// for an address with a CUI that is not one.
export function contractsCsvQuery(
  params: URLSearchParams,
): (ContractFilter & { sort: string; order: 'asc' | 'desc' }) | null {
  const buyerParam = params.get('institutie')
  const supplierParam = params.get('furnizor')
  const buyer = buyerParam === null ? undefined : cuiFromPath(buyerParam)
  const supplier =
    supplierParam === null ? undefined : cuiFromPath(supplierParam)
  if (buyer === null || supplier === null) return null
  if (params.get('toate') === 'da' || (!buyer && !supplier)) {
    const every = validateContractListSearch(Object.fromEntries(params), true)
    return {
      ...contractFilter('institutions', null, every),
      ...contractApiSort(every, true),
    }
  }
  const search = validateContractListSearch(Object.fromEntries(params))
  // A company's file is one way of winning, as its list is: its link always says how
  // (`castig`), even with an institution chosen as a filter. A buyer's holds both.
  if (supplier !== undefined && (buyer === undefined || search.castig)) {
    return {
      ...contractFilter('suppliers', supplier, search, wonOf(search, 1)),
      ...contractApiSort(search),
    }
  }
  return {
    // A buyer's file filtered by one winner, from its list.
    ...contractFilter('institutions', buyer as number, search),
    supplier,
    ...contractApiSort(search),
  }
}

// The file's name: the company's, for a company's list; else the institution's.
export function contractsCsvName(params: URLSearchParams): string {
  if (params.get('toate') === 'da') return 'contracte'
  const cui = params.has('castig')
    ? params.get('furnizor')
    : (params.get('institutie') ?? params.get('furnizor'))
  return cui ? `contracte-${cui}` : 'contracte'
}
