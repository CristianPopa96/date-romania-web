import { queryOptions } from '@tanstack/react-query'

import { getCpvDivisions, getNearLimit } from '#/features/patterns/api'
import type { NearLimitQuery } from '#/features/patterns/api'
import { PATTERN_COLUMNS, patternSort } from '#/features/patterns/urls'
import type { PatternSearch } from '#/features/patterns/urls'

export const cpvDivisionsQuery = queryOptions({
  queryKey: ['cpv-divisions'],
  queryFn: () => getCpvDivisions(),
})

// What the API is asked for a page of the pairs, under the address's filters and order.
export function nearLimitRequest(search: PatternSearch): NearLimitQuery {
  const sort = patternSort(search.ordine)
  return {
    cpv: search.cpv === undefined ? undefined : String(search.cpv),
    contract_type: search.tip,
    sort: PATTERN_COLUMNS[sort.column as keyof typeof PATTERN_COLUMNS].api,
    order: sort.dir,
    size: search.pe_pagina ?? 25,
    page: search.pagina ?? 1,
  }
}

export const nearLimitQuery = (search: PatternSearch) => {
  const data = nearLimitRequest(search)
  return queryOptions({
    queryKey: ['patterns', 'near-limit', data],
    queryFn: () => getNearLimit({ data }),
  })
}
