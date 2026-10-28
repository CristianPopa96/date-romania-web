import { queryOptions } from '@tanstack/react-query'

import type { Role } from '#/lib/api'
import {
  getContracts,
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

export const contractsQuery = (role: Role, cui: number, page: number) =>
  queryOptions({
    queryKey: ['contracts', role, cui, page],
    queryFn: () => getContracts({ data: { role, cui, page } }),
  })
