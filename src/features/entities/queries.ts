import { queryOptions } from '@tanstack/react-query'
import type { QueryClient } from '@tanstack/react-query'

import {
  euCounts,
  euLists,
  euBeneficiaryQuery,
  euProjectListQuery,
  euProjectOverviewQuery,
  programmeCodes,
} from '#/features/eu-projects'
import { getEntityPage } from '#/features/entities/api'
import type { Role } from '#/lib/api'
import {
  contractCount,
  entityContractsQuery,
  contractListQuery,
  contractOverviewQuery,
  contractsWon,
} from '#/features/contracts'
import { purchaseListQuery, purchaseOverviewQuery } from '#/features/purchases'
import { entityList } from '#/features/entities/urls'
import type { EntitySearch } from '#/features/entities/urls'
import { pageCount } from '#/lib/list'
import { statsQuery } from '#/lib/queries'
import { budgetQuery } from '#/features/budget'
import { pnrrListQuery, pnrrOverviewQuery } from '#/features/pnrr'

export const entityQuery = (role: Role, cui: number) =>
  queryOptions({
    queryKey: ['entity', role, cui],
    queryFn: () => getEntityPage({ data: { role, cui } }),
  })

// Everything the page of an institution or a supplier reads, for the list its address
// asks for, and the last page of that list when it pages with the list pattern (the
// route sends a page past it to it). Null when the API knows no entity with this CUI.
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
  if (list === 'contracte') {
    const won = contractsWon(totals, search)
    const [contracts] = await Promise.all([
      client.ensureQueryData(contractListQuery(role, cui, search, won)),
      client.ensureQueryData(contractOverviewQuery(role, cui, search, won)),
    ])
    return {
      page,
      last:
        contracts === 'failed'
          ? null
          : pageCount(contracts.total, search.pe_pagina ?? 25),
    }
  } else if (list === 'coeziune') {
    const codes =
      funds && funds !== 'failed'
        ? programmeCodes(funds.cohesion, search.program)
        : undefined
    const [projects] = await Promise.all([
      client.ensureQueryData(euProjectListQuery(cui, search, codes)),
      client.ensureQueryData(euProjectOverviewQuery(cui, search, codes)),
    ])
    return {
      page,
      last:
        projects === 'failed'
          ? null
          : pageCount(projects.total, search.pe_pagina ?? 25),
    }
  } else if (list === 'pnrr') {
    // Paid with no contract held: nothing to list.
    if (euCounts(funds).pnrr > 0) {
      const [contracts] = await Promise.all([
        client.ensureQueryData(pnrrListQuery(cui, search)),
        client.ensureQueryData(pnrrOverviewQuery(cui, search)),
      ])
      return {
        page,
        last:
          contracts === 'failed'
            ? null
            : pageCount(contracts.total, search.pe_pagina ?? 25),
      }
    }
  } else {
    const [purchases] = await Promise.all([
      client.ensureQueryData(purchaseListQuery(role, cui, search)),
      client.ensureQueryData(purchaseOverviewQuery(role, cui, search)),
    ])
    return {
      page,
      last: pageCount(purchases.total, search.pe_pagina ?? 25),
    }
  }
  return { page, last: null }
}
