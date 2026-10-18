import { createServerFn } from '@tanstack/react-start'

import { getJson } from '#/lib/api'
import type { Schemas } from '#/lib/api'

// An institution's budget: for a town hall or a county council, its executed budget for
// the latest year held and the Anghel Saligny payments to it, each with its own period;
// for any institution, the one that funds it. See api.ts for how the site reaches the API.

export type InstitutionBudget = Schemas['InstitutionBudget']

export type LocalBudget = Schemas['LocalBudgetOut']

export type RevenueLine = Schemas['RevenueAmount']['line']

export type Chapter = Schemas['ChapterAmount']['chapter']

export type ProgrammePayments = Schemas['ProgrammePayments']

// Null when the API does not hold the institution.
export const getInstitutionBudget = createServerFn({ method: 'GET' })
  .inputValidator((cui: number) => cui)
  .handler(({ data }) =>
    getJson<InstitutionBudget>(`/v1/institutions/${data}/budget`),
  )
