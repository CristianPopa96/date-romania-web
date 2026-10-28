import { createServerFn } from '@tanstack/react-start'

import { PAGE_SIZE, getJson } from '#/lib/api'
import type { Schemas } from '#/lib/api'

// The Anghel Saligny programme: the ministry's payments, the projects they pay for, and
// the SEAP contracts a payment could be tied to. See api.ts for how the site reaches
// the API.

// Whether a contract was found for a payment or a project.
//   one      the contracts of a single award notice
//   several  more than one notice; the files do not say which
//   none     the builder is named by tax ID, and no contract was found
//   unnamed  the files name the builder by name only, so nothing can be tied
export const MATCHES = ['one', 'several', 'none', 'unnamed'] as const
export type Match = (typeof MATCHES)[number]

export type MatchCount = Schemas['MatchCount']
export type MatchCounts = Schemas['ProgrammeMatch']

export type ProgrammeGroup = Schemas['ProgrammeGroup']

export type ProgrammeFile = Schemas['ProgrammeFile']

export type Programme = Schemas['Programme']

export type ProjectRow = Schemas['ProjectRow']

export type ProjectPage = Schemas['ProjectPage']

export type ProjectPayment = Schemas['ProjectPayment']

export type TraceParty = Schemas['TraceParty']

// How sure a link between a payment and a contract is. None is sure: the payment
// files do not name the contract.
//   probable  an export puts the buyer in the project's county, or no other buyer in
//             SEAP's exports carries the town hall's name
//   possible  other buyers carry the same name
export type Confidence = Schemas['TraceContract']['confidence']

export type TraceContract = Schemas['TraceContract']

export type TraceBuilder = Schemas['TraceBuilder']

export type Project = Schemas['Project']

const ROOT = '/v1/programmes/anghel-saligny'

// Null when the API holds no payment file yet.
export const getProgramme = createServerFn({ method: 'GET' }).handler(() =>
  getJson<Programme>(ROOT),
)

export type ProjectFilter = {
  county?: string
  q?: string
  match?: Match
  builder?: number
  page: number
}

export const getProjects = createServerFn({ method: 'GET' })
  .inputValidator((data: ProjectFilter) => data)
  .handler(async ({ data }): Promise<ProjectPage> => {
    const found = await getJson<ProjectPage>(`${ROOT}/projects`, {
      county: data.county,
      q: data.q,
      match: data.match,
      builder: data.builder,
      limit: PAGE_SIZE,
      offset: (data.page - 1) * PAGE_SIZE,
    })
    return found ?? { total: 0, items: [] }
  })

export const getProject = createServerFn({ method: 'GET' })
  .inputValidator((id: number) => id)
  .handler(({ data }) => getJson<Project>(`${ROOT}/projects/${data}`))
