import { queryOptions } from '@tanstack/react-query'

import type { Role } from '#/lib/api'
import { getPurchaseList, getPurchaseOverview } from '#/lib/api-purchases'
import { purchaseApiSort, purchaseFilter } from '#/lib/purchase-list'
import type { PurchaseListSearch } from '#/lib/purchase-list'

// A page of the direct purchases of an institution or a supplier, under the filters, the
// order and the page size of its address; and what the list says about itself under the
// same filters.
export const purchaseListQuery = (
  role: Role,
  cui: number,
  search: PurchaseListSearch & { pagina?: number },
) => {
  const data = {
    filter: purchaseFilter(role, cui, search),
    ...purchaseApiSort(search),
    size: search.pe_pagina ?? 25,
    page: search.pagina ?? 1,
  }
  return queryOptions({
    queryKey: ['purchases', 'list', data],
    queryFn: () => getPurchaseList({ data }),
  })
}

export const purchaseOverviewQuery = (
  role: Role,
  cui: number,
  search: PurchaseListSearch,
) => {
  const data = {
    filter: purchaseFilter(role, cui, search),
    scope: role === 'institutions' ? ('buyer' as const) : ('supplier' as const),
  }
  return queryOptions({
    queryKey: ['purchases', 'overview', data],
    queryFn: () => getPurchaseOverview({ data }),
  })
}
