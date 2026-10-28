import {
  getEuBeneficiary,
  getEuFunds,
  getEuProject,
  getEuProjects,
  getEuSeap,
} from '#/lib/api-eu'
import type { EuProjectFilter, EuSeapOf } from '#/lib/api-eu'
import {
  getPnrr,
  getPnrrContract,
  getPnrrContracts,
  getPnrrMeasure,
} from '#/lib/api-pnrr'
import type { PnrrContractFilter } from '#/lib/api-pnrr'
import { euCounts, euLists } from '#/lib/eu'
import { queryOptions } from '@tanstack/react-query'
import type { QueryClient } from '@tanstack/react-query'

import {
  getDatasets,
  getEntityPage,
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
import { getInstitutionBudget } from '#/lib/api-budget'
import { getCpvDivisions, getNearLimit } from '#/lib/api-patterns'
import {
  getCounties,
  getCounty,
  getLocality,
  searchPlaces,
} from '#/lib/api-places'
import { getProgramme, getProject, getProjects } from '#/lib/api-programme'
import type { ProjectFilter } from '#/lib/api-programme'
import { getCorrections } from '#/lib/api-reports'
import { contractCount } from '#/lib/contracts'
import {
  purchaseListQuery,
  purchaseOverviewQuery,
} from '#/lib/queries-purchases'
import { entityList } from '#/lib/urls'
import type { EntitySearch, RankingFilter } from '#/lib/urls'

export const datasetsQuery = queryOptions({
  queryKey: ['datasets'],
  queryFn: () => getDatasets(),
})

export const correctionsQuery = queryOptions({
  queryKey: ['corrections'],
  queryFn: () => getCorrections(),
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

export const rankingQuery = (role: Role, cpv?: string) =>
  queryOptions({
    queryKey: ['ranking', role, cpv ?? null],
    queryFn: () => getRanking({ data: { role, cpv } }),
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

export const budgetQuery = (cui: number) =>
  queryOptions({
    queryKey: ['institution-budget', cui],
    queryFn: () => getInstitutionBudget({ data: cui }),
  })

export const contractsQuery = (role: Role, cui: number, page: number) =>
  queryOptions({
    queryKey: ['contracts', role, cui, page],
    queryFn: () => getContracts({ data: { role, cui, page } }),
  })

export const largestContractsQuery = (filter: RankingFilter) =>
  queryOptions({
    queryKey: ['contracts', 'largest', filter],
    queryFn: () => getContracts({ data: { page: 1, ...filter } }),
  })

export const contractRankingQuery = (
  role: Role,
  filter: RankingFilter,
  won?: Won,
) =>
  queryOptions({
    queryKey: ['contract-ranking', role, won ?? null, filter],
    queryFn: () => getContractRanking({ data: { role, won, filter } }),
  })

export const cpvDivisionsQuery = queryOptions({
  queryKey: ['cpv-divisions'],
  queryFn: () => getCpvDivisions(),
})

export const nearLimitQuery = (cpv?: string) =>
  queryOptions({
    queryKey: ['patterns', 'near-limit', cpv ?? null],
    queryFn: () => getNearLimit({ data: { cpv } }),
  })

// Everything the page of an institution or a supplier reads, for the list its address
// asks for. Null when the API knows no entity with this CUI.
export async function loadEntityPage(
  client: QueryClient,
  role: Role,
  cui: number,
  search: EntitySearch,
) {
  const [page, totals, , , funds] = await Promise.all([
    client.ensureQueryData(entityQuery(role, cui)),
    client.ensureQueryData(entityContractsQuery(role, cui)),
    client.ensureQueryData(statsQuery),
    role === 'institutions' ? client.ensureQueryData(budgetQuery(cui)) : null,
    client.ensureQueryData(euBeneficiaryQuery(cui)),
  ])
  if (!page || !totals) return null
  const list = entityList(search, contractCount(totals) > 0, euLists(funds))
  const pageNumber = search.pagina ?? 1
  if (list === 'contracte') {
    await client.ensureQueryData(contractsQuery(role, cui, pageNumber))
  } else if (list === 'coeziune') {
    await client.ensureQueryData(entityEuProjectsQuery(cui, pageNumber))
  } else if (list === 'pnrr') {
    // Paid with no contract held: nothing to list.
    if (euCounts(funds).pnrr > 0) {
      await client.ensureQueryData(entityPnrrContractsQuery(cui, pageNumber))
    }
  } else {
    await Promise.all([
      client.ensureQueryData(purchaseListQuery(role, cui, search)),
      client.ensureQueryData(purchaseOverviewQuery(role, cui, search)),
    ])
  }
  return page
}

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

export const programmeQuery = queryOptions({
  queryKey: ['programme'],
  queryFn: () => getProgramme(),
})

export const projectsQuery = (filter: ProjectFilter) =>
  queryOptions({
    queryKey: ['programme', 'projects', filter],
    queryFn: () => getProjects({ data: filter }),
  })

export const projectQuery = (id: number) =>
  queryOptions({
    queryKey: ['programme', 'project', id],
    queryFn: () => getProject({ data: id }),
  })

export const countiesQuery = queryOptions({
  queryKey: ['counties'],
  queryFn: () => getCounties(),
})

export const countyQuery = (slug: string) =>
  queryOptions({
    queryKey: ['county', slug],
    queryFn: () => getCounty({ data: slug }),
  })

export const localityQuery = (county: string, uat: string) =>
  queryOptions({
    queryKey: ['locality', county, uat],
    queryFn: () => getLocality({ data: { county, uat } }),
  })

export const placeSearchQuery = (q: string) =>
  queryOptions({
    queryKey: ['place-search', q],
    queryFn: () => searchPlaces({ data: q }),
  })

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

export const entityPnrrContractsQuery = (cui: number, page: number) =>
  queryOptions({
    queryKey: ['eu-funds', 'beneficiary', cui, 'pnrr', page],
    queryFn: () =>
      getPnrrContracts({ data: { beneficiary: cui, page } }).catch(
        () => 'failed' as const,
      ),
  })

export const euSeapQuery = (of: EuSeapOf) =>
  queryOptions({
    queryKey: ['eu-funds', 'seap', of],
    queryFn: () => getEuSeap({ data: of }),
  })
