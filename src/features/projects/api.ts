import { createServerFn } from '@tanstack/react-start'

import { getJson } from '#/lib/api'
import type { Schemas } from '#/lib/api'
import type { ProjectFilter } from '#/features/projects/list'

// Every project of every programme as one list (design D22): a page of it, and what it
// says about itself under the filters. See src/lib/api.ts for how the site reaches the API.

export type ProjectItem = Schemas['ProjectItem']
export type ProjectList = Schemas['ProjectList']
export type ProjectsOverview = Schemas['ProjectsOverview']
export type ProjectKind = ProjectItem['kind']
export type ProjectStatus = NonNullable<ProjectItem['status']>
export type Reach = ProjectItem['reach']

export const PROJECT_KINDS = [
  'anghel_saligny',
  'pnrr',
  'cohesion',
] as const satisfies ReadonlyArray<ProjectKind>
export const PROJECT_STATUSES = [
  'in_progress',
  'finished',
  'terminated',
] as const satisfies ReadonlyArray<ProjectStatus>
// The steps a road can be followed to, in its order.
export const REACHES = [
  'beneficiary',
  'payments',
  'purchases',
  'companies',
] as const satisfies ReadonlyArray<Reach>

const ROOT = '/v1/projects'

export const getProjectList = createServerFn({ method: 'GET' })
  .inputValidator(
    (data: {
      filter: ProjectFilter
      order: 'asc' | 'desc'
      size: number
      page: number
    }) => data,
  )
  .handler(async ({ data }): Promise<ProjectList> => {
    const found = await getJson<ProjectList>(ROOT, {
      ...data.filter,
      sort: 'value',
      order: data.order,
      limit: data.size,
      offset: (data.page - 1) * data.size,
    })
    return found ?? { total: 0, items: [] }
  })

export const getProjectsOverview = createServerFn({ method: 'GET' })
  .inputValidator((data: ProjectFilter) => data)
  .handler(({ data }) => getJson<ProjectsOverview>(`${ROOT}/overview`, data))
