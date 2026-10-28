import { queryOptions } from '@tanstack/react-query'

import {
  getEuBeneficiary,
  getEuFunds,
  getEuProject,
  getEuProjects,
  getEuSeap,
} from '#/features/eu-projects/api'
import type { EuProjectFilter, EuSeapOf } from '#/features/eu-projects/api'

export const euFundsQuery = queryOptions({
  queryKey: ['eu-funds'],
  queryFn: () => getEuFunds(),
})

export const euProjectsQuery = (filter: EuProjectFilter) =>
  queryOptions({
    queryKey: ['eu-funds', 'projects', filter],
    queryFn: () => getEuProjects({ data: filter }),
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

// The EU lists of an entity page: 'failed' when the API did not answer, so the
// institution or company stays on screen with a note instead of an error page.
export const entityEuProjectsQuery = (cui: number, page: number) =>
  queryOptions({
    queryKey: ['eu-funds', 'beneficiary', cui, 'projects', page],
    queryFn: () =>
      getEuProjects({ data: { beneficiary: cui, page } }).catch(
        () => 'failed' as const,
      ),
  })

export const euSeapQuery = (of: EuSeapOf) =>
  queryOptions({
    queryKey: ['eu-funds', 'seap', of],
    queryFn: () => getEuSeap({ data: of }),
  })
