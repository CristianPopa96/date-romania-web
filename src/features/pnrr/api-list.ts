import { createServerFn } from '@tanstack/react-start'

import type { PnrrContractPage } from '#/features/pnrr/api'
import type { PnrrListFilter } from '#/features/pnrr/list'
import { getJson } from '#/lib/api'
import type { Schemas } from '#/lib/api'

// The PNRR contracts of one beneficiary or one measure as a list with filters: a page of it, and what it
// says about itself under the filters. See api.ts for how the site reaches the API.

const ROOT = '/v1/programmes/pnrr/contracts'

export type PnrrContractOverview = Schemas['PnrrContractOverview']

export const getPnrrList = createServerFn({ method: 'GET' })
  .inputValidator(
    (data: {
      filter: PnrrListFilter
      sort: string
      order: 'asc' | 'desc'
      size: number
      page: number
    }) => data,
  )
  .handler(async ({ data }): Promise<PnrrContractPage> => {
    const found = await getJson<PnrrContractPage>(ROOT, {
      ...data.filter,
      sort: data.sort,
      order: data.order,
      limit: data.size,
      offset: (data.page - 1) * data.size,
    })
    return found ?? { total: 0, items: [], natural_persons: 0 }
  })

export const getPnrrOverview = createServerFn({ method: 'GET' })
  .inputValidator(
    (data: { filter: PnrrListFilter; scope: 'beneficiary' | 'measure' }) =>
      data,
  )
  .handler(({ data }) =>
    getJson<PnrrContractOverview>(`${ROOT}/overview`, {
      ...data.filter,
      // `whole` counts every contract of the beneficiary or the measure.
      scope: data.scope,
    }),
  )
