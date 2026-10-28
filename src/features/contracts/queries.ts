import { queryOptions } from '@tanstack/react-query'

import type { Role } from '#/lib/api'
import {
  getContractList,
  getContractOverview,
} from '#/features/contracts/api-list'
import { contractApiSort, contractFilter } from '#/features/contracts/list'
import type { ContractListSearch, Won } from '#/features/contracts/list'
import {
  getEntityContracts,
  getNotice,
  getNoticeContracts,
} from '#/features/contracts/api'

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

export const entityContractsQuery = (role: Role, cui: number) =>
  queryOptions({
    queryKey: ['entity-contracts', role, cui],
    queryFn: () => getEntityContracts({ data: { role, cui } }),
  })

// A page of the contracts of an institution or a company, under the filters, the order and
// the page size of its address; and what the list says about itself under the same
// filters. `won` is how a company's list was won (wonOf); a buyer's holds both.
export const contractListQuery = (
  role: Role,
  cui: number,
  search: ContractListSearch & { pagina?: number },
  won?: Won,
) => {
  const data = {
    filter: contractFilter(role, cui, search, won),
    ...contractApiSort(search),
    size: search.pe_pagina ?? 25,
    page: search.pagina ?? 1,
  }
  return queryOptions({
    queryKey: ['contracts', 'list', data],
    queryFn: () => getContractList({ data }),
  })
}

export const contractOverviewQuery = (
  role: Role,
  cui: number,
  search: ContractListSearch,
  won?: Won,
) => {
  const data = {
    filter: contractFilter(role, cui, search, won),
    scope: role === 'institutions' ? ('buyer' as const) : ('supplier' as const),
  }
  return queryOptions({
    queryKey: ['contracts', 'overview', data],
    queryFn: () => getContractOverview({ data }),
  })
}
