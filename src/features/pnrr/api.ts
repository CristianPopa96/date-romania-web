import { createServerFn } from '@tanstack/react-start'

import { PAGE_SIZE, getJson } from '#/lib/api'
import type { Schemas } from '#/lib/api'

// The Recovery and Resilience Plan (PNRR), from MIPE's dashboard: the programme and its
// measures, the financing contracts, one contract with its payments. Natural persons
// never appear by name: the API leaves their contracts out and counts them. See api.ts
// for how the site reaches the API.

export type PnrrProgramme = Schemas['PnrrProgramme']
export type PnrrMeasureRow = Schemas['PnrrMeasureRow']
export type PnrrTopRecipient = Schemas['PnrrTopRecipient']
export type PnrrMeasure = Schemas['PnrrMeasure']
export type PnrrContractRow = Schemas['PnrrContractRow']
export type PnrrContractPage = Schemas['PnrrContractPage']
export type PnrrContract = Schemas['PnrrContract']
export type PnrrLine = Schemas['PnrrLine']
export type PnrrPayments = Schemas['PnrrPayments']

// in_progress  'În implementare'
// under_30     'În implementare (sub 30%)': under 30% of the way, as the ministry says
// finished     'Finalizat'
export const PNRR_STATUSES = ['in_progress', 'under_30', 'finished'] as const
export type PnrrStatus = (typeof PNRR_STATUSES)[number]

const ROOT = '/v1/programmes/pnrr'

// Null when no edition of the dashboard is held yet.
export const getPnrr = createServerFn({ method: 'GET' }).handler(() =>
  getJson<PnrrProgramme>(ROOT),
)

// `code` as the programme lists it ('C10.I3', 'C5.I1.a').
export const getPnrrMeasure = createServerFn({ method: 'GET' })
  .inputValidator((code: string) => code)
  .handler(({ data }) =>
    getJson<PnrrMeasure>(`${ROOT}/measures/${encodeURIComponent(data)}`),
  )

export type PnrrContractFilter = {
  measure?: string
  // As the dashboard writes it ('MUREȘ'), one of the measure's `counties`.
  county?: string
  // The beneficiary's CUI: its contracts, on an institution or supplier page.
  beneficiary?: number
  status?: PnrrStatus
  q?: string
  page: number
}

export const getPnrrContracts = createServerFn({ method: 'GET' })
  .inputValidator((data: PnrrContractFilter) => data)
  .handler(async ({ data }): Promise<PnrrContractPage> => {
    const found = await getJson<PnrrContractPage>(`${ROOT}/contracts`, {
      measure: data.measure,
      county: data.county,
      beneficiary: data.beneficiary,
      status: data.status,
      q: data.q,
      limit: PAGE_SIZE,
      offset: (data.page - 1) * PAGE_SIZE,
    })
    return found ?? { total: 0, items: [], natural_persons: 0 }
  })

// Null for a contract not held, and for a natural person's, which has no page.
export const getPnrrContract = createServerFn({ method: 'GET' })
  .inputValidator((id: number) => id)
  .handler(({ data }) => getJson<PnrrContract>(`${ROOT}/contracts/${data}`))
