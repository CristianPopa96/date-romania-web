import { createServerFn } from '@tanstack/react-start'

import { getJson } from '#/lib/api'
import type { Schemas } from '#/lib/api'

// One source as we hold it: its days, how many records, when it was last read.
export type Dataset = Schemas['Dataset']

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
