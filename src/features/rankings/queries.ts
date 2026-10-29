import { queryOptions } from '@tanstack/react-query'

import { getRankingList } from '#/features/rankings/api'
import type { RankingKind, RankingQuery } from '#/features/rankings/api'
import { getLargestContracts } from '#/features/contracts'
import {
  RANKING_COLUMNS,
  rankingFilter,
  rankingSort,
} from '#/features/rankings/urls'
import type { RankingFilter, RankingSearch } from '#/features/rankings/urls'

export const largestContractsQuery = (filter: RankingFilter) =>
  queryOptions({
    queryKey: ['contracts', 'largest', filter],
    queryFn: () => getLargestContracts({ data: filter }),
  })

// Which ranking a tab of the address shows.
export function rankingKind(search: RankingSearch): RankingKind {
  if (search.clasament === 'furnizori') return 'contract-suppliers'
  if (search.clasament === 'institutii') return 'contract-institutions'
  return search.parte === 'institutii' ? 'institutions' : 'suppliers'
}

// What the API is asked for a ranking's page, under the address's filters and order.
export function rankingQuery(search: RankingSearch): RankingQuery {
  const sort = rankingSort(search)
  return {
    kind: rankingKind(search),
    won: search.castigate === 'asociere' ? 'association' : 'alone',
    ...rankingFilter(search),
    date_from: search.de_la,
    date_to: search.pana_la,
    q: search.q === undefined ? undefined : String(search.q),
    sort: RANKING_COLUMNS[sort.column as keyof typeof RANKING_COLUMNS].api,
    order: sort.dir,
    size: search.pe_pagina ?? 25,
    page: search.pagina ?? 1,
  }
}

// A page of a ranking: 'failed' when the API did not answer, so the page stays on screen
// with a note instead of an error page.
export const rankingListQuery = (search: RankingSearch) => {
  const data = rankingQuery(search)
  return queryOptions({
    queryKey: ['ranking', data],
    queryFn: () => getRankingList({ data }).catch(() => 'failed' as const),
  })
}

// The ten largest under the same filters, for the chart: whatever the page, order or
// words of the list.
export const rankingTopQuery = (search: RankingSearch) => {
  const data: RankingQuery = {
    ...rankingQuery(search),
    q: undefined,
    sort: 'value',
    order: 'desc',
    size: 10,
    page: 1,
  }
  return queryOptions({
    queryKey: ['ranking', data],
    queryFn: () => getRankingList({ data }).catch(() => 'failed' as const),
  })
}
