import { createServerFn } from '@tanstack/react-start'

import { PAGE_SIZE, getJson } from '#/lib/api'
import type { EntityRef, Purchase, Role, Source, Summary } from '#/lib/api'

// Award notices, their contracts, and one direct purchase: the calls behind the pages of
// single records. See api.ts for how the site reaches the API.

export type NoticeDetail = {
  call_notice_no: string | null
  call_published_at: string | null
  ted_notice_no: string | null
  lots: number
  eu_funded: boolean | null
  financing_types: Array<string>
  eu_funds: Array<string>
  eu_project: string | null
}

export type Notice = {
  id: number
  notice_no: string | null
  notice_type_id: number | null
  title: string | null
  buyer: EntityRef | null
  buyer_text: string | null
  cpv_code: string | null
  cpv_name: string | null
  contract_type: string | null
  procedure_type: string | null
  published_at: string | null
  // Null until the versions of the notice are collected.
  first_published_at: string | null
  versions: number | null
  // Null until the detail of the notice is collected.
  detail: NoticeDetail | null
  contracts: number
  ordinary: number
  frameworks: number
  subsequent: number
  // Ordinary and subsequent contracts of this notice, whatever their date.
  total: number
  source: Source
}

export type Winner = {
  supplier: EntityRef | null
  text: string | null
  country: string | null
}

export type Contract = {
  id: number
  notice_id: number
  notice_no: string | null
  notice_title: string | null
  contract_no: string | null
  title: string | null
  signed_at: string | null
  // 1 ordinary, 2 framework agreement, 3 subsequent contract.
  kind: number | null
  // False for a framework agreement: a ceiling, never added to a total.
  counted: boolean
  lots: string | null
  value: number | null
  buyer: EntityRef | null
  buyer_text: string | null
  procedure_type: string | null
  cpv_code: string | null
  // In SEAP's order. More than one is an association: one value, never split.
  winners: Array<Winner>
  source: Source
}

export type Period = { first_day: string | null; last_day: string | null }

export type ContractPage = {
  total: number
  period: Period | null
  items: Array<Contract>
}

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
  .handler(({ data }) => getJson<Purchase>(`/v1/direct-purchases/${data.id}`))

// What one buyer bought directly from one supplier over the days we hold.
export const getPairSummary = createServerFn({ method: 'GET' })
  .inputValidator((data: { buyer: number; supplier: number }) => data)
  .handler(({ data }) =>
    getJson<Summary>('/v1/direct-purchases/summary', {
      buyer: data.buyer,
      supplier: data.supplier,
    }),
  )

export type ContractTotals = { contracts: number; value: number }

// What an institution awarded, or what a company won, among the contracts signed in the
// period we hold. For a company the two figures are never added: `association` is the
// whole value of contracts won with others, which SEAP does not split between members.
export type EntityContracts = { period: Period; source: Source } & (
  | { role: 'institutions'; awarded: ContractTotals }
  | { role: 'suppliers'; alone: ContractTotals; association: ContractTotals }
)

type InstitutionAnswer = ContractTotals & { period: Period; source: Source }
type SupplierAnswer = {
  period: Period
  alone: ContractTotals
  association: ContractTotals
  source: Source
}

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

// Contracts signed in the period, without framework agreements: those of one buyer or
// one winner, newest first, or with no entity the largest of all.
export const getContracts = createServerFn({ method: 'GET' })
  .inputValidator((data: { role?: Role; cui?: number; page: number }) => data)
  .handler(async ({ data }): Promise<ContractPage> => {
    const found = await getJson<ContractPage>('/v1/award-contracts', {
      [data.role === 'suppliers' ? 'supplier' : 'buyer']: data.cui,
      sort: data.cui === undefined ? 'value' : 'newest',
      limit: PAGE_SIZE,
      offset: (data.page - 1) * PAGE_SIZE,
    })
    return found ?? { total: 0, period: null, items: [] }
  })

export type Won = 'alone' | 'association'
export type ContractRankingRow = EntityRef & {
  rank: number
  contracts: number
  value: number
}
export type ContractRanking = {
  period: Period
  won: Won | null
  items: Array<ContractRankingRow>
  source: Source
}

// Winners by what they won alone or in associations; institutions by what they awarded.
export const getContractRanking = createServerFn({ method: 'GET' })
  .inputValidator((data: { role: Role; won?: Won }) => data)
  .handler(({ data }) =>
    data.role === 'suppliers'
      ? getJson<ContractRanking>('/v1/rankings/contract-suppliers', {
          won: data.won ?? 'alone',
          limit: 20,
        })
      : getJson<ContractRanking>('/v1/rankings/contract-institutions', {
          limit: 20,
        }),
  )
