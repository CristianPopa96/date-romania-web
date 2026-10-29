import { queryOptions } from '@tanstack/react-query'

import { getPnrrList, getPnrrOverview } from '#/features/pnrr/api-list'
import { pnrrApiSort, pnrrFilter } from '#/features/pnrr/list'
import type { PnrrListSearch } from '#/features/pnrr/list'
import {
  getPnrr,
  getPnrrContract,
  getPnrrContracts,
  getPnrrMeasure,
} from '#/features/pnrr/api'
import type { PnrrContractFilter } from '#/features/pnrr/api'

export const pnrrQuery = queryOptions({
  queryKey: ['pnrr'],
  queryFn: () => getPnrr(),
})

export const pnrrMeasureQuery = (code: string) =>
  queryOptions({
    queryKey: ['pnrr', 'measure', code],
    queryFn: () => getPnrrMeasure({ data: code }),
  })

export const pnrrContractsQuery = (filter: PnrrContractFilter) =>
  queryOptions({
    queryKey: ['pnrr', 'contracts', filter],
    queryFn: () => getPnrrContracts({ data: filter }),
  })

export const pnrrContractQuery = (id: number) =>
  queryOptions({
    queryKey: ['pnrr', 'contract', id],
    queryFn: () => getPnrrContract({ data: id }),
  })

// A page of a beneficiary's PNRR contracts under the filters, the order and the page size
// of its address, and what the list says about itself: 'failed' when the API did not
// answer, so the page stays on screen with a note instead of an error page.
export const pnrrListQuery = (
  cui: number,
  search: PnrrListSearch & { pagina?: number },
) => {
  const data = {
    filter: pnrrFilter(cui, search),
    ...pnrrApiSort(search),
    size: search.pe_pagina ?? 25,
    page: search.pagina ?? 1,
  }
  return queryOptions({
    queryKey: ['pnrr', 'list', data],
    queryFn: () => getPnrrList({ data }).catch(() => 'failed' as const),
  })
}

export const pnrrOverviewQuery = (cui: number, search: PnrrListSearch) => {
  const data = pnrrFilter(cui, search)
  return queryOptions({
    queryKey: ['pnrr', 'overview', data],
    queryFn: () => getPnrrOverview({ data }).catch(() => 'failed' as const),
  })
}
