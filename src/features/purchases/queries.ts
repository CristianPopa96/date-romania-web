import { queryOptions } from '@tanstack/react-query'

import type { Role } from '#/lib/api'
import {
  getPairSummary,
  getPurchase,
  getPurchaseList,
  getPurchaseOverview,
} from '#/features/purchases/api'
import { purchaseApiSort, purchaseFilter } from '#/features/purchases/list'
import type { PurchaseListSearch } from '#/features/purchases/list'

// A page of the direct purchases of an institution or a supplier, under the filters, the
// order and the page size of its address; and what the list says about itself under the
// same filters.
export const purchaseListQuery = (
  role: Role,
  cui: number | null,
  search: PurchaseListSearch & { pagina?: number },
) => {
  const data = {
    filter: purchaseFilter(role, cui, search),
    // The list of every purchase opens on the largest.
    ...purchaseApiSort(search, cui === null),
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
  cui: number | null,
  search: PurchaseListSearch,
) => {
  const data = {
    filter: purchaseFilter(role, cui, search),
    scope:
      cui === null
        ? undefined
        : role === 'institutions'
          ? ('buyer' as const)
          : ('supplier' as const),
  }
  return queryOptions({
    queryKey: ['purchases', 'overview', data],
    queryFn: () => getPurchaseOverview({ data }),
  })
}

export const purchaseQuery = (id: number) =>
  queryOptions({
    queryKey: ['purchase', id],
    queryFn: () => getPurchase({ data: { id } }),
  })

export const pairSummaryQuery = (buyer: number, supplier: number) =>
  queryOptions({
    queryKey: ['pair-summary', buyer, supplier],
    queryFn: () => getPairSummary({ data: { buyer, supplier } }),
  })
