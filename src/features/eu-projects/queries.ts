import { queryOptions } from '@tanstack/react-query'

import {
  getEuProjectList,
  getEuProjectOverview,
} from '#/features/eu-projects/api-list'
import { euProjectApiSort, euProjectFilter } from '#/features/eu-projects/list'
import type { EuProjectListSearch } from '#/features/eu-projects/list'
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

// The EU lists of an entity page: 'failed' when the API did not answer, so the
// institution or company stays on screen with a note instead of an error page.
// A page of a beneficiary's projects (or of every one's, with no CUI) under the filters,
// the order and the page size of its address, and what the list says about itself. `codes`
// are the programmes the address names (programmeCodes).
export const euProjectListQuery = (
  cui: number,
  search: EuProjectListSearch & { pagina?: number },
  codes: Array<string> | undefined,
) => {
  const data = {
    filter: euProjectFilter(cui, search, codes),
    ...euProjectApiSort(search),
    size: search.pe_pagina ?? 25,
    page: search.pagina ?? 1,
  }
  return queryOptions({
    queryKey: ['eu-funds', 'list', data],
    queryFn: () => getEuProjectList({ data }).catch(() => 'failed' as const),
  })
}

export const euProjectOverviewQuery = (
  cui: number,
  search: EuProjectListSearch,
  codes: Array<string> | undefined,
) => {
  const data = euProjectFilter(cui, search, codes)
  return queryOptions({
    queryKey: ['eu-funds', 'overview', data],
    queryFn: () =>
      getEuProjectOverview({ data }).catch(() => 'failed' as const),
  })
}

export const euSeapQuery = (of: EuSeapOf) =>
  queryOptions({
    queryKey: ['eu-funds', 'seap', of],
    queryFn: () => getEuSeap({ data: of }),
  })
