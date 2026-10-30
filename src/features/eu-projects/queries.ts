import { queryOptions } from '@tanstack/react-query'

import {
  getEuBeneficiary,
  getEuFunds,
  getEuProject,
  getEuSeap,
} from '#/features/eu-projects/api'
import type { EuSeapOf } from '#/features/eu-projects/api'

export const euFundsQuery = queryOptions({
  queryKey: ['eu-funds'],
  queryFn: () => getEuFunds(),
})

export const euProjectQuery = (smis: number) =>
  queryOptions({
    queryKey: ['eu-funds', 'project', smis],
    queryFn: () => getEuProject({ data: smis }),
  })

export const euBeneficiaryQuery = (cui: number) =>
  queryOptions({
    queryKey: ['eu-funds', 'beneficiary', cui],
    queryFn: () => getEuBeneficiary({ data: cui }),
  })

export const euSeapQuery = (of: EuSeapOf) =>
  queryOptions({
    queryKey: ['eu-funds', 'seap', of],
    queryFn: () => getEuSeap({ data: of }),
  })
