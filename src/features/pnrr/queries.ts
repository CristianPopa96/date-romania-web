import { queryOptions } from '@tanstack/react-query'

import { getPnrrList, getPnrrOverview } from '#/features/pnrr/api-list'
import { pnrrApiSort, pnrrFilter } from '#/features/pnrr/list'
import type { PnrrListOf, PnrrListSearch } from '#/features/pnrr/list'
import { getPnrr, getPnrrContract, getPnrrMeasure } from '#/features/pnrr/api'

export const pnrrQuery = queryOptions({
  queryKey: ['pnrr'],
  queryFn: () => getPnrr(),
})

export const pnrrMeasureQuery = (code: string) =>
  queryOptions({
    queryKey: ['pnrr', 'measure', code],
    queryFn: () => getPnrrMeasure({ data: code }),
  })

export const pnrrContractQuery = (id: number) =>
  queryOptions({
    queryKey: ['pnrr', 'contract', id],
    queryFn: () => getPnrrContract({ data: id }),
  })

// A page of a beneficiary's or a measure's PNRR contracts under the filters, the order and the page size
// of its address, and what the list says about itself: 'failed' when the API did not
// answer, so the page stays on screen with a note instead of an error page.
export const pnrrListQuery = (
  of: PnrrListOf,
  search: PnrrListSearch & { pagina?: number },
) => {
  const data = {
    filter: pnrrFilter(of, search),
    ...pnrrApiSort(search),
    size: search.pe_pagina ?? 25,
    page: search.pagina ?? 1,
  }
  return queryOptions({
    queryKey: ['pnrr', 'list', data],
    queryFn: () => getPnrrList({ data }).catch(() => 'failed' as const),
  })
}

export const pnrrOverviewQuery = (of: PnrrListOf, search: PnrrListSearch) => {
  const data = {
    filter: pnrrFilter(of, search),
    scope:
      'beneficiary' in of ? ('beneficiary' as const) : ('measure' as const),
  }
  return queryOptions({
    queryKey: ['pnrr', 'overview', data],
    queryFn: () => getPnrrOverview({ data }).catch(() => 'failed' as const),
  })
}
