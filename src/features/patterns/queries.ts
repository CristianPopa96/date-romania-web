import { queryOptions } from '@tanstack/react-query'

import { getCpvDivisions, getNearLimit } from '#/features/patterns/api'

export const cpvDivisionsQuery = queryOptions({
  queryKey: ['cpv-divisions'],
  queryFn: () => getCpvDivisions(),
})

export const nearLimitQuery = (cpv?: string) =>
  queryOptions({
    queryKey: ['patterns', 'near-limit', cpv ?? null],
    queryFn: () => getNearLimit({ data: { cpv } }),
  })
