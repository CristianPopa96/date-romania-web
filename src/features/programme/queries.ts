import { queryOptions } from '@tanstack/react-query'

import { getProgramme, getProject } from '#/features/programme/api'

export const programmeQuery = queryOptions({
  queryKey: ['programme'],
  queryFn: () => getProgramme(),
})

export const projectQuery = (id: number) =>
  queryOptions({
    queryKey: ['programme', 'project', id],
    queryFn: () => getProject({ data: id }),
  })
