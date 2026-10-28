import { queryOptions } from '@tanstack/react-query'

import {
  getPnrr,
  getPnrrContract,
  getPnrrContracts,
  getPnrrMeasure,
} from '#/features/pnrr/api'
import type { PnrrContractFilter } from '#/features/pnrr/api'

export const pnrrQuery = queryOptions({
  queryKey: ['pnrr'],
  queryFn: () => getPnrr(),
})

export const pnrrMeasureQuery = (code: string) =>
  queryOptions({
    queryKey: ['pnrr', 'measure', code],
    queryFn: () => getPnrrMeasure({ data: code }),
  })

export const pnrrContractsQuery = (filter: PnrrContractFilter) =>
  queryOptions({
    queryKey: ['pnrr', 'contracts', filter],
    queryFn: () => getPnrrContracts({ data: filter }),
  })

export const pnrrContractQuery = (id: number) =>
  queryOptions({
    queryKey: ['pnrr', 'contract', id],
    queryFn: () => getPnrrContract({ data: id }),
  })

export const entityPnrrContractsQuery = (cui: number, page: number) =>
  queryOptions({
    queryKey: ['eu-funds', 'beneficiary', cui, 'pnrr', page],
    queryFn: () =>
      getPnrrContracts({ data: { beneficiary: cui, page } }).catch(
        () => 'failed' as const,
      ),
  })
