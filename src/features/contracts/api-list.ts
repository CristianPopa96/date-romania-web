import { createServerFn } from '@tanstack/react-start'

import type { ContractPage } from '#/features/contracts/api'
import type { ContractFilter } from '#/features/contracts/list'
import { getJson } from '#/lib/api'
import type { Schemas } from '#/lib/api'

// The contracts of one institution or company as a list with filters: a page of it, what
// it says about itself under the filters (figures, charts, options), and the options of
// its typeahead filters. See api.ts for how the site reaches the API.

export type ContractOverview = Schemas['ContractOverview']
export type PartyOption = Schemas['PartyOption']
export type CpvOption = Schemas['CpvOption']

export type ContractListQuery = {
  filter: ContractFilter
  sort: string
  order: 'asc' | 'desc'
  size: number
  page: number
}

export const getContractList = createServerFn({ method: 'GET' })
  .inputValidator((data: ContractListQuery) => data)
  .handler(async ({ data }): Promise<ContractPage> => {
    const found = await getJson<ContractPage>('/v1/award-contracts', {
      ...data.filter,
      sort: data.sort,
      order: data.order,
      limit: data.size,
      offset: (data.page - 1) * data.size,
    })
    return found ?? { total: 0, period: null, items: [] }
  })

// `scope` is the party whose list it is: the figures say what part of it the filters keep.
export const getContractOverview = createServerFn({ method: 'GET' })
  .inputValidator(
    (data: { filter: ContractFilter; scope: 'buyer' | 'supplier' }) => data,
  )
  .handler(({ data }) =>
    getJson<ContractOverview>('/v1/award-contracts/overview', {
      ...data.filter,
      scope: data.scope,
    }),
  )

export const getContractParties = createServerFn({ method: 'GET' })
  .inputValidator(
    (data: {
      filter: ContractFilter
      side: 'buyer' | 'supplier'
      find: string
    }) => data,
  )
  .handler(
    async ({ data }) =>
      (await getJson<Array<PartyOption>>('/v1/award-contracts/parties', {
        ...data.filter,
        side: data.side,
        find: data.find || undefined,
      })) ?? [],
  )

export const getContractCpvCodes = createServerFn({ method: 'GET' })
  .inputValidator((data: { filter: ContractFilter; find: string }) => data)
  .handler(
    async ({ data }) =>
      (await getJson<Array<CpvOption>>('/v1/award-contracts/cpv-codes', {
        ...data.filter,
        find: data.find || undefined,
      })) ?? [],
  )
