import { queryOptions } from '@tanstack/react-query'

import {
  getProjectList,
  getProjectProgrammes,
  getProjectsOverview,
} from '#/features/projects/api'
import { projectApiOrder, projectFilter } from '#/features/projects/list'
import type { ProjectListSearch, ProjectScope } from '#/features/projects/list'

// A page of the projects under the filters, the order and the page size of the address,
// and what the list says about itself: 'failed' when the API did not answer, so the page
// stays on screen with a note instead of an error page. `scope` is what a page fixes.
export const projectListQuery = (
  search: ProjectListSearch,
  scope: ProjectScope = {},
) => {
  const data = {
    filter: projectFilter(search, scope),
    order: projectApiOrder(search),
    size: search.pe_pagina ?? 25,
    page: search.pagina ?? 1,
  }
  return queryOptions({
    queryKey: ['projects', 'list', data],
    queryFn: () => getProjectList({ data }).catch(() => 'failed' as const),
  })
}

export const projectsOverviewQuery = (
  search: ProjectListSearch,
  scope: ProjectScope = {},
) => {
  const data = projectFilter(search, scope)
  return queryOptions({
    queryKey: ['projects', 'overview', data],
    queryFn: () => getProjectsOverview({ data }).catch(() => 'failed' as const),
  })
}

// A beneficiary's projects by programme, each at its own day: 'failed' when the API did
// not answer, so the tab stays with its list.
export const projectProgrammesQuery = (beneficiary: number) =>
  queryOptions({
    queryKey: ['projects', 'programmes', beneficiary],
    queryFn: () =>
      getProjectProgrammes({ data: beneficiary }).catch(
        () => 'failed' as const,
      ),
  })
