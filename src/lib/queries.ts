import { queryOptions } from '@tanstack/react-query'

import { getStats } from '#/lib/api'

export const statsQuery = queryOptions({
  queryKey: ['stats'],
  queryFn: () => getStats(),
})
