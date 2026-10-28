import { queryOptions } from '@tanstack/react-query'

import { getProgramme, getProject, getProjects } from '#/features/programme/api'
import type { ProjectFilter } from '#/features/programme/api'

export const programmeQuery = queryOptions({
  queryKey: ['programme'],
  queryFn: () => getProgramme(),
})

export const projectsQuery = (filter: ProjectFilter) =>
  queryOptions({
    queryKey: ['programme', 'projects', filter],
    queryFn: () => getProjects({ data: filter }),
  })

export const projectQuery = (id: number) =>
  queryOptions({
    queryKey: ['programme', 'project', id],
    queryFn: () => getProject({ data: id }),
  })
