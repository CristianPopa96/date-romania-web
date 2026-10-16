import { createServerFn } from '@tanstack/react-start'

import { getJson } from '#/lib/api'
import type { EntityRef, Source } from '#/lib/api'

// The patterns (measured facts worth asking documents for) and the CPV divisions the
// rankings can be filtered by. See api.ts for how the site reaches the API.

export type CpvDivision = { code: string; name: string | null }

export const getCpvDivisions = createServerFn({ method: 'GET' }).handler(() =>
  getJson<Array<CpvDivision>>('/v1/cpv-divisions'),
)

// SEAP's contract types: 1 goods, 2 services, 3 works.
export type ContractType = 1 | 2 | 3

export type NearLimitPurchase = {
  id: number
  code: string | null
  name: string | null
  finalized_at: string | null
  value: number
}

export type NearLimitPair = {
  buyer: EntityRef
  supplier: EntityRef
  contract_type: ContractType
  limit: number
  purchases: number
  value: number
  // Oldest first.
  items: Array<NearLimitPurchase>
}

export type NearLimitPattern = {
  // A purchase from `share` of its limit up to the limit is near it; a pair needs
  // `repeats` of them.
  rule: { share: number; repeats: number; limits: Record<string, number> }
  first_day: string | null
  last_day: string | null
  // Every pair that matches; `items` may hold fewer.
  pairs: number
  items: Array<NearLimitPair>
  // Accepted purchases whose contract type is not known, so not checked.
  unknown_type: number
  source: Source
}

export const NEAR_LIMIT_ROWS = 50

export const getNearLimit = createServerFn({ method: 'GET' })
  .inputValidator((data: { cpv?: string }) => data)
  .handler(({ data }) =>
    getJson<NearLimitPattern>('/v1/patterns/near-limit', {
      cpv: data.cpv,
      limit: NEAR_LIMIT_ROWS,
    }),
  )
