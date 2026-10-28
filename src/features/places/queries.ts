import { queryOptions } from '@tanstack/react-query'

import {
  getCounties,
  getCounty,
  getLocality,
  searchPlaces,
} from '#/features/places/api'

export const countiesQuery = queryOptions({
  queryKey: ['counties'],
  queryFn: () => getCounties(),
})

export const countyQuery = (slug: string) =>
  queryOptions({
    queryKey: ['county', slug],
    queryFn: () => getCounty({ data: slug }),
  })

export const localityQuery = (county: string, uat: string) =>
  queryOptions({
    queryKey: ['locality', county, uat],
    queryFn: () => getLocality({ data: { county, uat } }),
  })

export const placeSearchQuery = (q: string) =>
  queryOptions({
    queryKey: ['place-search', q],
    queryFn: () => searchPlaces({ data: q }),
  })
