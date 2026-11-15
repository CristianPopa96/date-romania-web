import { createServerFn } from '@tanstack/react-start'

import { getJson } from '#/lib/api'
import type { Schemas } from '#/lib/api'

// The country's budget against what our data shows (the home page, design round 18):
// the planned year and its execution, the part that can go through procurement, the
// checks of official figures against ours, and spending by purpose (COFOG). See
// src/lib/api.ts for how the site reaches the API.

export type National = Schemas['National']
export type NationalBudget = Schemas['Budget']
export type Check = Schemas['Check']
export type CheckFigure = Schemas['Figure']
export type Ours = Schemas['Ours']
export type Segment = Schemas['Segment']
export type Domains = Schemas['Domains']

// 'failed' when the API did not answer, or has no such route (a site deployed before
// it): the home page stays up, its search usable, and says the figures could not be
// read, never that they are not collected.
export const getNational = createServerFn({ method: 'GET' }).handler(
  async (): Promise<National | 'failed'> => {
    try {
      return (await getJson<National>('/v1/national')) ?? 'failed'
    } catch {
      return 'failed'
    }
  },
)
