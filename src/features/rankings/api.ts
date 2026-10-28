import { createServerFn } from '@tanstack/react-start'

import { getJson } from '#/lib/api'
import type { Role, Schemas } from '#/lib/api'
import type { RankingFilter } from '#/features/rankings/urls'
import { filterParams } from '#/features/contracts'

export type RankingRow = Schemas['RankingRow']

export type Ranking = Schemas['Ranking']

export const getRanking = createServerFn({ method: 'GET' })
  .inputValidator((data: { role: Role; cpv?: string }) => data)
  .handler(({ data }) =>
    getJson<Ranking>(`/v1/rankings/${data.role}`, {
      cpv: data.cpv,
      limit: 20,
    }),
  )

export type Won = NonNullable<Schemas['ContractRanking']['won']>

export type ContractRankingRow = Schemas['ContractRankingRow']

export type ContractRanking = Schemas['ContractRanking']

// Winners by what they won alone or in associations; institutions by what they awarded.
export const getContractRanking = createServerFn({ method: 'GET' })
  .inputValidator(
    (data: { role: Role; won?: Won; filter: RankingFilter }) => data,
  )
  .handler(({ data }) =>
    data.role === 'suppliers'
      ? getJson<ContractRanking>('/v1/rankings/contract-suppliers', {
          won: data.won ?? 'alone',
          ...filterParams(data.filter),
          limit: 20,
        })
      : getJson<ContractRanking>('/v1/rankings/contract-institutions', {
          ...filterParams(data.filter),
          limit: 20,
        }),
  )
