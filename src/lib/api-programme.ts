import { createServerFn } from '@tanstack/react-start'

import { PAGE_SIZE, getJson } from '#/lib/api'
import type { EntityRef, Source } from '#/lib/api'

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

export type MatchCount = { count: number; amount: number }
export type MatchCounts = Record<Match, MatchCount>

export type ProgrammeGroup = {
  key: string
  name: string
  payments: number
  amount: number
  projects: number
}

export type ProgrammeFile = {
  published_on: string | null
  payments: number
  amount: number
  // Payments that name the builder by tax ID.
  with_tax_id: number
}

export type Programme = {
  payments: number
  amount: number
  projects: number
  town_halls: number
  builders: number
  first_day: string | null
  last_day: string | null
  networks: Array<ProgrammeGroup>
  counties: Array<ProgrammeGroup>
  files: Array<ProgrammeFile>
  payments_match: MatchCounts
  projects_match: MatchCounts
  // Of the payments tied, those whose links are all only possible, by match state.
  payments_possible: MatchCounts
  // The contracts searched were published in SEAP between these two days.
  contracts_first_day: string | null
  contracts_last_day: string | null
  source: Source
  contracts_source: Source
}

export type ProjectRow = {
  id: number
  investment: string | null
  county: string
  county_name: string
  town_hall: string
  network: string
  category: string | null
  total_value: number | null
  state_budget_value: number | null
  paid: number
  payments: number
  match: Match
}

export type ProjectPage = { total: number; items: Array<ProjectRow> }

export type ProjectPayment = {
  id: number
  published_on: string | null
  registered_on: string | null
  requested_on: string | null
  amount: number
  progress: string | null
  builder_text: string | null
}

export type TraceParty = {
  cui: number | null
  name: string | null
  // Set when the company has a page on the site.
  entity: EntityRef | null
}

// How sure a link between a payment and a contract is. None is sure: the payment
// files do not name the contract.
//   probable  an export puts the buyer in the project's county, or no other buyer in
//             SEAP's exports carries the town hall's name
//   possible  other buyers carry the same name
export type Confidence = 'probable' | 'possible'

export type TraceContract = {
  notice_no: string | null
  // Our id of the award notice, when we also collected it from SEAP: it has a page.
  notice_id: number | null
  notice_date: string | null
  contract_no: string | null
  contract_date: string | null
  title: string | null
  lot: string | null
  value_ron: number | null
  procedure_type: string | null
  contract_type: string | null
  is_framework: boolean | null
  buyer: EntityRef | null
  buyer_text: string | null
  confidence: Confidence
  // What the link rests on, in the API's words.
  method: string
  // The other winners of an association. The value is the whole contract's.
  partners: Array<TraceParty>
  // Contract value over the project's total value.
  ratio: number | null
}

export type TraceBuilder = TraceParty & {
  payments: number
  amount: number
  match: Match
  contracts: Array<TraceContract>
}

export type Project = ProjectRow & {
  town_hall_entity: EntityRef | null
  ministry_contract_no: string | null
  ministry_contract_date: string | null
  poim: boolean | null
  progress: string | null
  estimated_end: string | null
  items: Array<ProjectPayment>
  builders: Array<TraceBuilder>
  designers: Array<TraceParty>
  // The weakest link among the contracts shown; null when there are none.
  confidence: Confidence | null
  source: Source
  contracts_source: Source
}

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
