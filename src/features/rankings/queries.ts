import { queryOptions } from '@tanstack/react-query'

import { getRankingList } from '#/features/rankings/api'
import type { RankingKind, RankingQuery } from '#/features/rankings/api'
import {
  RANKING_COLUMNS,
  rankingFilter,
  rankingSort,
} from '#/features/rankings/urls'
import type { RankingSearch } from '#/features/rankings/urls'
import { countyCodeOfSlug } from '#/lib/counties'

// Which ranking a tab of the address shows: by contracts, or by direct purchases.
export function rankingKind(search: RankingSearch): RankingKind {
  const buyers = search.clasament === 'institutii'
  if (search.bani === 'achizitii') return buyers ? 'institutions' : 'suppliers'
  return buyers ? 'contract-institutions' : 'contract-suppliers'
}

// What the API is asked for a ranking's page, under the address's filters and order.
export function rankingQuery(search: RankingSearch): RankingQuery {
  const sort = rankingSort(search)
  return {
    kind: rankingKind(search),
    won: search.castigate === 'asociere' ? 'association' : 'alone',
    ...rankingFilter(search),
    county: countyCodeOfSlug(search.judet),
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

// The ten largest under the same filters and words, for the chart: whatever the page or
// order of the list. A party found by its words keeps its place in the whole ranking.
export const rankingTopQuery = (search: RankingSearch) => {
  const data: RankingQuery = {
    ...rankingQuery(search),
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
