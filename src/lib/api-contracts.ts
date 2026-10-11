import { createServerFn } from '@tanstack/react-start'

import { getJson } from '#/lib/api'
import type { EntityRef, Purchase, Source, Summary } from '#/lib/api'

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
  // In lei. Null when SEAP gives no value in lei, even if it gives one below.
  value: number | null
  // The value as the contract states it, in `currency` ("RON", "EUR").
  original_value: number | null
  currency: string | null
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
