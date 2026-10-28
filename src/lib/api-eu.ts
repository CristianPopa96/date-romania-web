import { createServerFn } from '@tanstack/react-start'

import { PAGE_SIZE, getJson } from '#/lib/api'
import type { Schemas } from '#/lib/api'

// EU cohesion projects, from MIPE's lists of contracted projects: the programmes held,
// the projects, one project. Each programme's list describes its own day, so their
// figures are never added. See api.ts for how the site reaches the API.

export type EuFunds = Schemas['EuFunds']
export type EuProgramme = Schemas['EuProgramme']
export type EuProjectRow = Schemas['EuProjectRow']
export type EuProjectPage = Schemas['EuProjectPage']
export type EuProject = Schemas['EuProject']
export type EuBeneficiary = Schemas['EuBeneficiary']
export type EuPayment = Schemas['EuPayment']

// in_progress  'În implementare'
// finished     'Finalizat'
// terminated   'Reziliat'
// Any other status the list writes is shown as written (`status_written`).
export const EU_STATUSES = ['in_progress', 'finished', 'terminated'] as const
export type EuStatus = (typeof EU_STATUSES)[number]

const ROOT = '/v1/programmes/eu-funds'

// Null when no list is held yet.
export const getEuFunds = createServerFn({ method: 'GET' }).handler(() =>
  getJson<EuFunds>(ROOT),
)

export type EuProjectFilter = {
  // A programme code as the API gives it ('POR', 'PoIDS').
  programme?: string
  status?: EuStatus
  q?: string
  page: number
}

export const getEuProjects = createServerFn({ method: 'GET' })
  .inputValidator((data: EuProjectFilter) => data)
  .handler(async ({ data }): Promise<EuProjectPage> => {
    const found = await getJson<EuProjectPage>(`${ROOT}/projects`, {
      programme: data.programme,
      status: data.status,
      q: data.q,
      limit: PAGE_SIZE,
      offset: (data.page - 1) * PAGE_SIZE,
    })
    return found ?? { total: 0, items: [] }
  })

// Null for a SMIS code not held.
export const getEuProject = createServerFn({ method: 'GET' })
  .inputValidator((smis: number) => smis)
  .handler(({ data }) => getJson<EuProject>(`${ROOT}/projects/${data}`))

// The SEAP records whose text cites a project: the contracts of the award notices (one
// page of them) and the accepted direct purchases. The rules live in the API
// (eu_seap_links.py); every tie rests on the buyer's own text, so none is sure.
export type EuSeapLinks = Schemas['EuSeapLinks']
export type EuSeapContract = Schemas['EuSeapContract']
export type EuSeapPurchase = Schemas['EuSeapPurchase']

// Whose records: a cohesion project by its SMIS code, or a PNRR contract by its id.
export type EuSeapOf = { kind: 'smis' | 'pnrr'; id: number; page: number }

export const getEuSeap = createServerFn({ method: 'GET' })
  .inputValidator((data: EuSeapOf) => data)
  .handler(async ({ data }): Promise<EuSeapLinks> => {
    const path =
      data.kind === 'smis'
        ? `${ROOT}/projects/${data.id}/seap`
        : `/v1/programmes/pnrr/contracts/${data.id}/seap`
    const found = await getJson<EuSeapLinks>(path, {
      limit: PAGE_SIZE,
      offset: (data.page - 1) * PAGE_SIZE,
    })
    return found ?? { contracts_total: 0, contracts: [], purchases: [] }
  })
