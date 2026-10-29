import { createServerFn } from '@tanstack/react-start'

import { getJson } from '#/lib/api'
import type { Schemas } from '#/lib/api'

// The patterns (measured facts worth asking documents for) and the CPV divisions the
// rankings can be filtered by. See api.ts for how the site reaches the API.

export type CpvDivision = Schemas['CpvDivision']

// A secondary list: when the API cannot give it, the filter still works on the code in
// the address, so a failure here is null rather than an error that takes the page down.
export const getCpvDivisions = createServerFn({ method: 'GET' }).handler(
  async () => {
    try {
      return await getJson<Array<CpvDivision>>('/v1/cpv-divisions')
    } catch (error) {
      console.error(error)
      return null
    }
  },
)

// SEAP's contract types: 1 goods, 2 services, 3 works.
export type ContractType = Schemas['NearLimitPair']['contract_type']

export type NearLimitPurchase = Schemas['NearLimitPurchase']

export type NearLimitPair = Schemas['NearLimitPair']

export type NearLimitPattern = Schemas['NearLimitPattern']

// A page of the pairs, under the list's filters and order.
export type NearLimitQuery = {
  cpv?: string
  contract_type?: number
  sort: 'purchases' | 'value'
  order: 'asc' | 'desc'
  size: number
  page: number
}

export const getNearLimit = createServerFn({ method: 'GET' })
  .inputValidator((data: NearLimitQuery) => data)
  .handler(({ data }) =>
    getJson<NearLimitPattern>('/v1/patterns/near-limit', {
      cpv: data.cpv,
      contract_type: data.contract_type,
      sort: data.sort,
      order: data.order,
      limit: data.size,
      offset: (data.page - 1) * data.size,
    }),
  )
