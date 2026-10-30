import { createServerFn } from '@tanstack/react-start'

import { getJson } from '#/lib/api'
import type { Schemas } from '#/lib/api'

// The rankings: parties by the value of their contracts or direct purchases, a page at a
// time, in any column's order. See api.ts of the site for how it reaches the API.

export type RankingRow = Schemas['RankingRow']

export type Ranking = Schemas['Ranking']

export type Won = NonNullable<Schemas['ContractRanking']['won']>

export type ContractRankingRow = Schemas['ContractRankingRow']

export type ContractRanking = Schemas['ContractRanking']

// Which ranking: winners and institutions of contracts, suppliers and institutions of
// direct purchases. Two kinds of money, never in one list.
export type RankingKind =
  'contract-suppliers' | 'contract-institutions' | 'suppliers' | 'institutions'

export type RankingQuery = {
  kind: RankingKind
  // For winners: how the contracts were won.
  won?: Won
  cpv?: string
  eu?: boolean
  // The county's code, of the party ranked.
  county?: string
  // Direct purchases only.
  date_from?: string
  date_to?: string
  q?: string
  sort: 'value' | 'count'
  order: 'asc' | 'desc'
  size: number
  page: number
}

// One row of any ranking: its place, the party, how many rows its value adds up and the
// value.
export type RankedParty = {
  rank: number
  cui: number
  name: string
  kind: string
  count: number
  value: number
}

export type RankedList = {
  total: number
  // Every party's value added up, beyond the page.
  value: number
  items: Array<RankedParty>
  // Contracts: the days the contracts were signed in; purchases: the days asked for.
  contract: ContractRanking | null
  direct: Ranking | null
}

export const getRankingList = createServerFn({ method: 'GET' })
  .inputValidator((data: RankingQuery) => data)
  .handler(async ({ data }): Promise<RankedList | null> => {
    const page = {
      q: data.q,
      sort: data.sort,
      order: data.order,
      limit: data.size,
      offset: (data.page - 1) * data.size,
    }
    if (
      data.kind === 'contract-suppliers' ||
      data.kind === 'contract-institutions'
    ) {
      const found = await getJson<ContractRanking>(
        `/v1/rankings/${data.kind}`,
        {
          won:
            data.kind === 'contract-suppliers'
              ? (data.won ?? 'alone')
              : undefined,
          cpv: data.cpv,
          eu_funded: data.eu === undefined ? undefined : String(data.eu),
          county: data.county,
          ...page,
        },
      )
      return (
        found && {
          total: found.total,
          value: found.value,
          items: found.items.map((row) => ({ ...row, count: row.contracts })),
          contract: found,
          direct: null,
        }
      )
    }
    const found = await getJson<Ranking>(`/v1/rankings/${data.kind}`, {
      date_from: data.date_from,
      date_to: data.date_to,
      cpv: data.cpv,
      county: data.county,
      ...page,
    })
    return (
      found && {
        total: found.total,
        value: found.value,
        items: found.items.map((row) => ({ ...row, count: row.accepted })),
        contract: null,
        direct: found,
      }
    )
  })
