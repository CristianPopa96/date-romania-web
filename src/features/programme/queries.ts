import { queryOptions } from '@tanstack/react-query'

import { getProgramme, getProject } from '#/features/programme/api'
import {
  getProjectList,
  getProjectOverview,
} from '#/features/programme/api-list'
import { projectApiSort, projectFilter } from '#/features/programme/list'
import type { ProjectListSearch } from '#/features/programme/list'

export const programmeQuery = queryOptions({
  queryKey: ['programme'],
  queryFn: () => getProgramme(),
})

// A page of the projects under the filters, the order and the page size of the address,
// and what the list says about itself: 'failed' when the API did not answer, so the page
// stays on screen with a note instead of an error page. `categories` are the programme's
// kinds of works, which the address names by slug.
export const projectListQuery = (
  search: ProjectListSearch,
  categories: ReadonlyArray<string>,
) => {
  const data = {
    filter: projectFilter(search, categories),
    ...projectApiSort(search),
    size: search.pe_pagina ?? 25,
    page: search.pagina ?? 1,
  }
  return queryOptions({
    queryKey: ['programme', 'list', data],
    queryFn: () => getProjectList({ data }).catch(() => 'failed' as const),
  })
}

export const projectOverviewQuery = (
  search: ProjectListSearch,
  categories: ReadonlyArray<string>,
) => {
  const data = projectFilter(search, categories)
  return queryOptions({
    queryKey: ['programme', 'overview', data],
    queryFn: () => getProjectOverview({ data }).catch(() => 'failed' as const),
  })
}

export const projectQuery = (id: number) =>
  queryOptions({
    queryKey: ['programme', 'project', id],
    queryFn: () => getProject({ data: id }),
  })
