import { createServerFn } from '@tanstack/react-start'

import { getJson } from '#/lib/api'
import type { Summary, Schemas } from '#/lib/api'
import type { PurchaseFilter } from '#/features/purchases/list'

// The direct purchases of one institution or supplier as a list with filters: a page of
// it, what it says about itself under the filters (figures, charts, options), and the
// options of its typeahead filters. See api.ts for how the site reaches the API.

export type PurchaseOverview = Schemas['PurchaseOverview']
export type PartyOption = Schemas['PartyOption']
export type CpvOption = Schemas['CpvOption']

export type PurchaseListQuery = {
  filter: PurchaseFilter
  sort: string
  order: 'asc' | 'desc'
  size: number
  page: number
}

export const getPurchaseList = createServerFn({ method: 'GET' })
  .inputValidator((data: PurchaseListQuery) => data)
  .handler(async ({ data }): Promise<PurchasePage> => {
    const found = await getJson<PurchasePage>('/v1/direct-purchases', {
      ...data.filter,
      sort: data.sort,
      order: data.order,
      limit: data.size,
      offset: (data.page - 1) * data.size,
    })
    return found ?? { total: 0, items: [] }
  })

// `scope` is the party whose list it is: the figures say what part of it the filters keep.
export const getPurchaseOverview = createServerFn({ method: 'GET' })
  .inputValidator(
    (data: { filter: PurchaseFilter; scope: 'buyer' | 'supplier' }) => data,
  )
  .handler(({ data }) =>
    getJson<PurchaseOverview>('/v1/direct-purchases/overview', {
      ...data.filter,
      scope: data.scope,
    }),
  )

export const getPurchaseParties = createServerFn({ method: 'GET' })
  .inputValidator(
    (data: {
      filter: PurchaseFilter
      side: 'buyer' | 'supplier'
      find: string
    }) => data,
  )
  .handler(
    async ({ data }) =>
      (await getJson<Array<PartyOption>>('/v1/direct-purchases/parties', {
        ...data.filter,
        side: data.side,
        find: data.find || undefined,
      })) ?? [],
  )

export const getPurchaseCpvCodes = createServerFn({ method: 'GET' })
  .inputValidator((data: { filter: PurchaseFilter; find: string }) => data)
  .handler(
    async ({ data }) =>
      (await getJson<Array<CpvOption>>('/v1/direct-purchases/cpv-codes', {
        ...data.filter,
        find: data.find || undefined,
      })) ?? [],
  )

export type Purchase = Schemas['Purchase']

// One purchase on its own page, with its lines and conditions once collected.
export type PurchaseWithDetail = Schemas['PurchaseWithDetail']

export type PurchaseDetail = Schemas['PurchaseDetail']

export type PurchasePage = Schemas['PurchasePage']

export const getPurchase = createServerFn({ method: 'GET' })
  .inputValidator((data: { id: number }) => data)
  .handler(({ data }) =>
    getJson<PurchaseWithDetail>(`/v1/direct-purchases/${data.id}`),
  )

// What one buyer bought directly from one supplier over the days we hold.
export const getPairSummary = createServerFn({ method: 'GET' })
  .inputValidator((data: { buyer: number; supplier: number }) => data)
  .handler(({ data }) =>
    getJson<Summary>('/v1/direct-purchases/summary', {
      buyer: data.buyer,
      supplier: data.supplier,
    }),
  )
