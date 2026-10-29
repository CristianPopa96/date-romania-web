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

// The project is found before this is asked, so a 404 means the API has no such
// endpoint (a site deployed before its API): null, and the page shows no section, never
// "nothing cites it". 'failed' when the API did not answer: the page stays up without it.
export const getEuSeap = createServerFn({ method: 'GET' })
  .inputValidator((data: EuSeapOf) => data)
  .handler(async ({ data }): Promise<EuSeapLinks | null | 'failed'> => {
    const path =
      data.kind === 'smis'
        ? `${ROOT}/projects/${data.id}/seap`
        : `/v1/programmes/pnrr/contracts/${data.id}/seap`
    try {
      return await getJson<EuSeapLinks>(path, {
        limit: PAGE_SIZE,
        offset: (data.page - 1) * PAGE_SIZE,
      })
    } catch {
      return 'failed'
    }
  })

// The EU money of one beneficiary, of both kinds, never added together: its cohesion
// projects by programme and its PNRR contracts and payments.
export type EuBeneficiaryFunds = Schemas['EuBeneficiaryFunds']
export type EuBeneficiaryPnrr = Schemas['EuBeneficiaryPnrr']

// The entity is found before this is asked: null when the API has no such endpoint (a
// site deployed before its API) and 'failed' when it did not answer, so the page stays up
// without the EU money and never says there is none.
export const getEuBeneficiary = createServerFn({ method: 'GET' })
  .inputValidator((cui: number) => cui)
  .handler(async ({ data }): Promise<EuBeneficiaryFunds | null | 'failed'> => {
    try {
      return await getJson<EuBeneficiaryFunds>(
        `/v1/programmes/eu-beneficiaries/${data}`,
      )
    } catch {
      return 'failed'
    }
  })
