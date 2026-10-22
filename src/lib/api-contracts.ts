import { createServerFn } from '@tanstack/react-start'

import { PAGE_SIZE, getJson } from '#/lib/api'
import type {
  PurchaseWithDetail,
  Role,
  Source,
  Summary,
  Schemas,
} from '#/lib/api'
import type { RankingFilter } from '#/lib/urls'

// Award notices, their contracts, and one direct purchase: the calls behind the pages of
// single records. See api.ts for how the site reaches the API.

export type NoticeDetail = Schemas['NoticeDetail']

export type Notice = Schemas['AwardNoticeOut']

export type Winner = Schemas['Winner']

export type Contract = Schemas['Contract']

export type Period = Schemas['Period']

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

export const getPurchase = createServerFn({ method: 'GET' })
  .inputValidator((data: { id: number }) => data)
  .handler(({ data }) =>
    getJson<PurchaseWithDetail>(`/v1/direct-purchases/${data.id}`),
  )

// What one buyer bought directly from one supplier over the days we hold.
export const getPairSummary = createServerFn({ method: 'GET' })
  .inputValidator((data: { buyer: number; supplier: number }) => data)
  .handler(({ data }) =>
    getJson<Summary>('/v1/direct-purchases/summary', {
      buyer: data.buyer,
      supplier: data.supplier,
    }),
  )

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
function filterParams(filter: RankingFilter) {
  return {
    cpv: filter.cpv,
    eu_funded: filter.eu === undefined ? undefined : String(filter.eu),
  }
}

// Contracts signed in the period, without framework agreements: those of one buyer or
// one winner, newest first, or with no entity the largest of all, which the filters of
// the rankings can narrow.
export const getContracts = createServerFn({ method: 'GET' })
  .inputValidator(
    (data: { role?: Role; cui?: number; page: number } & RankingFilter) => data,
  )
  .handler(async ({ data }): Promise<ContractPage> => {
    const found = await getJson<ContractPage>('/v1/award-contracts', {
      [data.role === 'suppliers' ? 'supplier' : 'buyer']: data.cui,
      sort: data.cui === undefined ? 'value' : 'newest',
      ...filterParams(data),
      limit: PAGE_SIZE,
      offset: (data.page - 1) * PAGE_SIZE,
    })
    return found ?? { total: 0, period: null, items: [] }
  })

export type Won = NonNullable<Schemas['ContractRanking']['won']>
export type ContractRankingRow = Schemas['ContractRankingRow']
export type ContractRanking = Schemas['ContractRanking']

// Winners by what they won alone or in associations; institutions by what they awarded.
export const getContractRanking = createServerFn({ method: 'GET' })
  .inputValidator(
    (data: { role: Role; won?: Won; filter: RankingFilter }) => data,
  )
  .handler(({ data }) =>
    data.role === 'suppliers'
      ? getJson<ContractRanking>('/v1/rankings/contract-suppliers', {
          won: data.won ?? 'alone',
          ...filterParams(data.filter),
          limit: 20,
        })
      : getJson<ContractRanking>('/v1/rankings/contract-institutions', {
          ...filterParams(data.filter),
          limit: 20,
        }),
  )
