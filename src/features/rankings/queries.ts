import { queryOptions } from '@tanstack/react-query'

import { getRanking, getContractRanking } from '#/features/rankings/api'
import type { Role } from '#/lib/api'
import { getContracts } from '#/features/contracts'
import type { Won } from '#/features/rankings/api'
import type { RankingFilter } from '#/features/rankings/urls'

export const rankingQuery = (role: Role, cpv?: string) =>
  queryOptions({
    queryKey: ['ranking', role, cpv ?? null],
    queryFn: () => getRanking({ data: { role, cpv } }),
  })

export const largestContractsQuery = (filter: RankingFilter) =>
  queryOptions({
    queryKey: ['contracts', 'largest', filter],
    queryFn: () => getContracts({ data: { page: 1, ...filter } }),
  })

export const contractRankingQuery = (
  role: Role,
  filter: RankingFilter,
  won?: Won,
) =>
  queryOptions({
    queryKey: ['contract-ranking', role, won ?? null, filter],
    queryFn: () => getContractRanking({ data: { role, won, filter } }),
  })
