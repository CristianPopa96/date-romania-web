import { createServerFn } from '@tanstack/react-start'

import type { EuProjectPage } from '#/features/eu-projects/api'
import type { EuProjectListFilter } from '#/features/eu-projects/list'
import { getJson } from '#/lib/api'
import type { Schemas } from '#/lib/api'

// The EU projects of one beneficiary as a list with filters: a page of it, and what it
// says about itself under the filters. See api.ts for how the site reaches the API.

const ROOT = '/v1/programmes/eu-funds/projects'

export type EuProjectOverview = Schemas['EuProjectOverview']

export const getEuProjectList = createServerFn({ method: 'GET' })
  .inputValidator(
    (data: {
      filter: EuProjectListFilter
      sort: string
      order: 'asc' | 'desc'
      size: number
      page: number
    }) => data,
  )
  .handler(async ({ data }): Promise<EuProjectPage> => {
    const found = await getJson<EuProjectPage>(ROOT, {
      ...data.filter,
      sort: data.sort,
      order: data.order,
      limit: data.size,
      offset: (data.page - 1) * data.size,
    })
    return found ?? { total: 0, items: [] }
  })

export const getEuProjectOverview = createServerFn({ method: 'GET' })
  .inputValidator((data: EuProjectListFilter) => data)
  .handler(({ data }) =>
    getJson<EuProjectOverview>(`${ROOT}/overview`, {
      ...data,
      scope: 'beneficiary',
    }),
  )
