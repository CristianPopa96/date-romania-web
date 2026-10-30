import { createServerFn } from '@tanstack/react-start'

import { getJson } from '#/lib/api'
import type { Schemas } from '#/lib/api'

// Places (flow 6): the counties, one county with its UATs, one UAT (a commune, town,
// municipality or Bucharest sector) and a search for them. A place is addressed by its
// slugs: /localitati/alba/comuna-albac. See api.ts for how the site reaches the API.

export type PlaceRef = Schemas['PlaceRef']

export type Counties = Schemas['Counties']

export type County = Schemas['County']

export type Locality = Schemas['Locality']

export type PlaceFigures = Schemas['PlaceFigures']

export type TopWinner = Schemas['TopWinner']

export type LocalInstitution = Schemas['LocalInstitution']

export type PlaceHit = Schemas['PlaceHit']

export type CountyUatRow = Schemas['CountyUat']

export const getCounties = createServerFn({ method: 'GET' }).handler(
  async () => (await getJson<Counties>('/v1/places')) ?? { items: [] },
)

// Null when there is no such county.
export const getCounty = createServerFn({ method: 'GET' })
  .inputValidator((slug: string) => slug)
  .handler(({ data }) =>
    getJson<County>(`/v1/places/${encodeURIComponent(data)}`),
  )

// Null when there is no such UAT in that county.
export const getLocality = createServerFn({ method: 'GET' })
  .inputValidator((data: { county: string; uat: string }) => data)
  .handler(({ data }) =>
    getJson<Locality>(
      `/v1/places/${encodeURIComponent(data.county)}/${encodeURIComponent(data.uat)}`,
    ),
  )

export const searchPlaces = createServerFn({ method: 'GET' })
  .inputValidator((q: string) => q)
  .handler(async ({ data }): Promise<Array<PlaceHit>> => {
    const q = data.trim().slice(0, 100)
    // A CUI is never the name of a place.
    if (q.length < 2 || /^(ro)?\s*\d+$/i.test(q)) return []
    const found = await getJson<Schemas['PlaceResults']>('/v1/places/search', {
      q,
      limit: 20,
    })
    return found?.items ?? []
  })
