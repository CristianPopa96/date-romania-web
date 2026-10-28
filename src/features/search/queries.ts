import { queryOptions } from '@tanstack/react-query'

import { searchEntities } from '#/features/search/api'

export const searchQuery = (q: string) =>
  queryOptions({
    queryKey: ['search', q],
    queryFn: () => searchEntities({ data: { q } }),
  })
