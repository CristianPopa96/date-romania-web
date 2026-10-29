import { createServerFn } from '@tanstack/react-start'

import { PAGE_SIZE, getJson } from '#/lib/api'
import type { Role, Source, Schemas, Period } from '#/lib/api'
import type { RankingFilter } from '#/features/rankings'

// Award notices, their contracts, and one direct purchase: the calls behind the pages of
// single records. See api.ts for how the site reaches the API.

export type NoticeDetail = Schemas['NoticeDetail']

export type Notice = Schemas['AwardNoticeOut']

export type Winner = Schemas['Winner']

export type Contract = Schemas['Contract']

export type ContractPage = Schemas['ContractPage']

// The contracts of one notice, a page at a time.
export const NOTICE_PAGE_SIZE = 50

export const FRAMEWORK = 2

export const getNotice = createServerFn({ method: 'GET' })
  .inputValidator((data: { id: number }) => data)
  .handler(({ data }) => getJson<Notice>(`/v1/award-notices/${data.id}`))

export const getNoticeContracts = createServerFn({ method: 'GET' })
  .inputValidator((data: { id: number; page: number }) => data)
  .handler(async ({ data }): Promise<ContractPage> => {
    const found = await getJson<ContractPage>(
      `/v1/award-notices/${data.id}/contracts`,
      {
        limit: NOTICE_PAGE_SIZE,
        offset: (data.page - 1) * NOTICE_PAGE_SIZE,
      },
    )
    return found ?? { total: 0, period: null, items: [] }
  })

export type ContractTotals = Schemas['ContractTotals']

// What an institution awarded, or what a company won, among the contracts signed in the
// period we hold. For a company the two figures are never added: `association` is the
// whole value of contracts won with others, which SEAP does not split between members.
export type EntityContracts = { period: Period; source: Source } & (
  | { role: 'institutions'; awarded: ContractTotals }
  | { role: 'suppliers'; alone: ContractTotals; association: ContractTotals }
)

type InstitutionAnswer = Schemas['InstitutionContracts']

type SupplierAnswer = Schemas['SupplierContracts']

export const getEntityContracts = createServerFn({ method: 'GET' })
  .inputValidator((data: { role: Role; cui: number }) => data)
  .handler(async ({ data }): Promise<EntityContracts | null> => {
    const path = `/v1/${data.role}/${data.cui}/contracts`
    if (data.role === 'suppliers') {
      const found = await getJson<SupplierAnswer>(path)
      return found && { role: 'suppliers', ...found }
    }
    const found = await getJson<InstitutionAnswer>(path)
    return (
      found && {
        role: 'institutions',
        period: found.period,
        source: found.source,
        awarded: { contracts: found.contracts, value: found.value },
      }
    )
  })

// The filters of the rankings, as the API names them.
export function filterParams(filter: RankingFilter) {
  return {
    cpv: filter.cpv,
    eu_funded: filter.eu === undefined ? undefined : String(filter.eu),
  }
}

// The largest contracts signed in the period, without framework agreements, which the
// filters of the rankings can narrow. An entity's contracts are a list of their own
// (api-list.ts).
export const getLargestContracts = createServerFn({ method: 'GET' })
  .inputValidator((data: RankingFilter) => data)
  .handler(async ({ data }): Promise<ContractPage> => {
    const found = await getJson<ContractPage>('/v1/award-contracts', {
      sort: 'value',
      ...filterParams(data),
      limit: PAGE_SIZE,
      offset: 0,
    })
    return found ?? { total: 0, period: null, items: [] }
  })
