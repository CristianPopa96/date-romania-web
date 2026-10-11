import { queryOptions } from '@tanstack/react-query'
import type { QueryClient } from '@tanstack/react-query'

import {
  getDatasets,
  getEntityPage,
  getPurchases,
  getRanking,
  getStats,
  searchEntities,
} from '#/lib/api'
import type { Role } from '#/lib/api'
import {
  getContractRanking,
  getContracts,
  getEntityContracts,
  getNotice,
  getNoticeContracts,
  getPairSummary,
  getPurchase,
} from '#/lib/api-contracts'
import type { Won } from '#/lib/api-contracts'
import { contractCount } from '#/lib/contracts'
import { entityList } from '#/lib/urls'
import type { EntitySearch } from '#/lib/urls'

export const datasetsQuery = queryOptions({
  queryKey: ['datasets'],
  queryFn: () => getDatasets(),
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

export const noticeQuery = (id: number) =>
  queryOptions({
    queryKey: ['notice', id],
    queryFn: () => getNotice({ data: { id } }),
  })

export const noticeContractsQuery = (id: number, page: number) =>
  queryOptions({
    queryKey: ['notice-contracts', id, page],
    queryFn: () => getNoticeContracts({ data: { id, page } }),
  })

export const purchaseQuery = (id: number) =>
  queryOptions({
    queryKey: ['purchase', id],
    queryFn: () => getPurchase({ data: { id } }),
  })

export const pairSummaryQuery = (buyer: number, supplier: number) =>
  queryOptions({
    queryKey: ['pair-summary', buyer, supplier],
    queryFn: () => getPairSummary({ data: { buyer, supplier } }),
  })

export const entityContractsQuery = (role: Role, cui: number) =>
  queryOptions({
    queryKey: ['entity-contracts', role, cui],
    queryFn: () => getEntityContracts({ data: { role, cui } }),
  })

export const contractsQuery = (role: Role, cui: number, page: number) =>
  queryOptions({
    queryKey: ['contracts', role, cui, page],
    queryFn: () => getContracts({ data: { role, cui, page } }),
  })

export const largestContractsQuery = queryOptions({
  queryKey: ['contracts', 'largest'],
  queryFn: () => getContracts({ data: { page: 1 } }),
})

export const contractRankingQuery = (role: Role, won?: Won) =>
  queryOptions({
    queryKey: ['contract-ranking', role, won ?? null],
    queryFn: () => getContractRanking({ data: { role, won } }),
  })

// Everything the page of an institution or a supplier reads, for the list its address
// asks for. Null when the API knows no entity with this CUI.
export async function loadEntityPage(
  client: QueryClient,
  role: Role,
  cui: number,
  search: EntitySearch,
) {
  const [page, totals] = await Promise.all([
    client.ensureQueryData(entityQuery(role, cui)),
    client.ensureQueryData(entityContractsQuery(role, cui)),
    client.ensureQueryData(statsQuery),
  ])
  if (!page || !totals) return null
  const list = entityList(search, contractCount(totals) > 0)
  const pageNumber = search.pagina ?? 1
  if (list === 'contracte') {
    await client.ensureQueryData(contractsQuery(role, cui, pageNumber))
  } else {
    await client.ensureQueryData(
      purchasesQuery(role, cui, pageNumber, search.ordine === 'valoare'),
    )
  }
  return page
}
