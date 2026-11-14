import { queryOptions } from '@tanstack/react-query'

import { getNational } from '#/features/national/api'

export const nationalQuery = queryOptions({
  queryKey: ['national'],
  queryFn: () => getNational(),
})
