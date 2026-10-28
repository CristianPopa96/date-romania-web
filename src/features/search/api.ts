import { createServerFn } from '@tanstack/react-start'

import { getJson } from '#/lib/api'
import type { Entity } from '#/lib/api'

export const searchEntities = createServerFn({ method: 'GET' })
  .inputValidator((data: { q: string }) => data)
  .handler(async ({ data }): Promise<Array<Entity>> => {
    const q = data.q.trim().slice(0, 100)
    if (q.length < 2) return []
    const found = await getJson<{ items: Array<Entity> }>('/v1/search', {
      q,
      limit: 30,
    })
    return found?.items ?? []
  })
