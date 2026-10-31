import { createServerFn } from '@tanstack/react-start'

import { getJson } from '#/lib/api'
import type { Schemas } from '#/lib/api'

// One source as we hold it: its days, how many records, when it was last read.
export type Dataset = Schemas['Dataset']

// Each step of the road from a public source to a page, in figures.
export type DataRoad = Schemas['DataRoad']

// The tab says it could not be read, rather than taking the page down.
export const getDataRoad = createServerFn({ method: 'GET' }).handler(
  async (): Promise<DataRoad | 'failed'> => {
    try {
      return (await getJson<DataRoad>('/v1/data-road')) ?? 'failed'
    } catch {
      return 'failed'
    }
  },
)

// Like the totals, the table of what we hold must not take the home page down.
export const getDatasets = createServerFn({ method: 'GET' }).handler(
  async (): Promise<Array<Dataset>> => {
    try {
      const found = await getJson<{ items: Array<Dataset> }>('/v1/datasets')
      return found?.items ?? []
    } catch {
      return []
    }
  },
)
