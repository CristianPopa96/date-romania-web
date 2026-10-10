import { queryOptions } from '@tanstack/react-query'

import {
  getApiHealth,
  getEntityPage,
  getPurchases,
  getRanking,
  getStats,
  searchEntities,
} from '#/lib/api'
import type { Role } from '#/lib/api'

export const healthQuery = queryOptions({
  queryKey: ['health'],
  queryFn: () => getApiHealth(),
})

export const statsQuery = queryOptions({
  queryKey: ['stats'],
  queryFn: () => getStats(),
})

export const searchQuery = (q: string) =>
  queryOptions({
    queryKey: ['search', q],
    queryFn: () => searchEntities({ data: { q } }),
  })

export const entityQuery = (role: Role, cui: number) =>
  queryOptions({
    queryKey: ['entity', role, cui],
    queryFn: () => getEntityPage({ data: { role, cui } }),
  })

export const purchasesQuery = (
  role: Role,
  cui: number,
  page: number,
  byValue: boolean,
) =>
  queryOptions({
    queryKey: ['purchases', role, cui, page, byValue],
    queryFn: () => getPurchases({ data: { role, cui, page, byValue } }),
  })

export const rankingQuery = (role: Role) =>
  queryOptions({
    queryKey: ['ranking', role],
    queryFn: () => getRanking({ data: { role } }),
  })
