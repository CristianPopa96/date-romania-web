import { queryOptions } from '@tanstack/react-query'

import { getProjectList, getProjectsOverview } from '#/features/projects/api'
import type { ProjectKind } from '#/features/projects/api'
import { projectApiOrder, projectFilter } from '#/features/projects/list'
import type { ProjectListSearch } from '#/features/projects/list'

// A page of the projects under the filters, the order and the page size of the address,
// and what the list says about itself: 'failed' when the API did not answer, so the page
// stays on screen with a note instead of an error page. `fixed` is the programme of a
// programme's own page; `codes` the cohesion programmes the EU funds page names.
export const projectListQuery = (
  search: ProjectListSearch,
  fixed?: ProjectKind,
  codes?: Array<string>,
) => {
  const data = {
    filter: projectFilter(search, fixed, codes),
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
  fixed?: ProjectKind,
  codes?: Array<string>,
) => {
  const data = projectFilter(search, fixed, codes)
  return queryOptions({
    queryKey: ['projects', 'overview', data],
    queryFn: () => getProjectsOverview({ data }).catch(() => 'failed' as const),
  })
}
