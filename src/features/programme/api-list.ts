import { createServerFn } from '@tanstack/react-start'

import type { ProjectPage } from '#/features/programme/api'
import type { ProjectListFilter } from '#/features/programme/list'
import { getJson } from '#/lib/api'
import type { Schemas } from '#/lib/api'

// The Anghel Saligny projects as a list with filters: a page of it, and what it says about
// itself under the filters. See api.ts for how the site reaches the API.

const ROOT = '/v1/programmes/anghel-saligny/projects'

export type ProjectOverview = Schemas['ProjectOverview']

export const getProjectList = createServerFn({ method: 'GET' })
  .inputValidator(
    (data: {
      filter: ProjectListFilter
      sort: string
      order: 'asc' | 'desc'
      size: number
      page: number
    }) => data,
  )
  .handler(async ({ data }): Promise<ProjectPage> => {
    const found = await getJson<ProjectPage>(ROOT, {
      ...data.filter,
      sort: data.sort,
      order: data.order,
      limit: data.size,
      offset: (data.page - 1) * data.size,
    })
    return found ?? { total: 0, items: [] }
  })

export const getProjectOverview = createServerFn({ method: 'GET' })
  .inputValidator((data: ProjectListFilter) => data)
  .handler(({ data }) => getJson<ProjectOverview>(`${ROOT}/overview`, data))
