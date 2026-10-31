import { queryOptions } from '@tanstack/react-query'

import { getDataRoad, getDatasets } from '#/features/sources/api'
import { getCorrections } from '#/lib/api-reports'

export const datasetsQuery = queryOptions({
  queryKey: ['datasets'],
  queryFn: () => getDatasets(),
})

export const dataRoadQuery = queryOptions({
  queryKey: ['data-road'],
  queryFn: () => getDataRoad(),
})

export const correctionsQuery = queryOptions({
  queryKey: ['corrections'],
  queryFn: () => getCorrections(),
})
