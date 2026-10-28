import { createServerFn } from '@tanstack/react-start'

import { getJson } from '#/lib/api'
import type { Schemas, Role } from '#/lib/api'

export type EntityPage = Schemas['EntityPage']

export const getEntityPage = createServerFn({ method: 'GET' })
  .inputValidator((data: { role: Role; cui: number }) => data)
  .handler(({ data }) =>
    getJson<EntityPage>(`/v1/${data.role}/${data.cui}`, { partners: 10 }),
  )
