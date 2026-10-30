import { queryOptions } from '@tanstack/react-query'
import type { QueryClient } from '@tanstack/react-query'

import {
  projectListQuery,
  projectProgrammesQuery,
  projectsOverviewQuery,
} from '#/features/projects'
import type { ProjectScope } from '#/features/projects'
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

export const entityQuery = (role: Role, cui: number) =>
  queryOptions({
    queryKey: ['entity', role, cui],
    queryFn: () => getEntityPage({ data: { role, cui } }),
  })

// What an entity page's projects are: an institution's as their beneficiary, a company's
// also those it was paid through.
export function entityProjects(role: Role, cui: number): ProjectScope {
  return {
    party: role === 'suppliers' ? { company: cui } : { beneficiary: cui },
  }
}

// Everything the page of an institution or a supplier reads, for the list its address
// asks for, and the last page of that list when it pages with the list pattern (the
// route sends a page past it to it). Null when the API knows no entity with this CUI.
export async function loadEntityPage(
  client: QueryClient,
  role: Role,
  cui: number,
  search: EntitySearch,
) {
  const scope = entityProjects(role, cui)
  const [page, totals, , , projects] = await Promise.all([
    client.ensureQueryData(entityQuery(role, cui)),
    client.ensureQueryData(entityContractsQuery(role, cui)),
    client.ensureQueryData(statsQuery),
    role === 'institutions' ? client.ensureQueryData(budgetQuery(cui)) : null,
    // Every project of the entity, for the tab's count.
    client.ensureQueryData(projectListQuery({}, scope)),
  ])
  if (!page || !totals) return null
  const held = projects === 'failed' ? 0 : projects.total
  const list = entityList(search, contractCount(totals) > 0, held > 0)
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
  } else if (list === 'proiecte') {
    const [found] = await Promise.all([
      client.ensureQueryData(projectListQuery(search, scope)),
      client.ensureQueryData(projectsOverviewQuery(search, scope)),
      client.ensureQueryData(projectProgrammesQuery(cui)),
    ])
    return {
      page,
      last:
        found === 'failed'
          ? null
          : pageCount(found.total, search.pe_pagina ?? 25),
    }
  }
  const [purchases] = await Promise.all([
    client.ensureQueryData(purchaseListQuery(role, cui, search)),
    client.ensureQueryData(purchaseOverviewQuery(role, cui, search)),
  ])
  return {
    page,
    last: pageCount(purchases.total, search.pe_pagina ?? 25),
  }
}
