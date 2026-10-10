import { createServerFn } from '@tanstack/react-start'

// The site talks to the FastAPI back end only from the server, so the API
// address stays internal and the browser never needs CORS.
function apiUrl(path: string) {
  const base = process.env.API_URL ?? 'http://localhost:8000'
  return new URL(path, base)
}

type Params = Record<string, string | number | undefined>

// Null means the API answered "not found"; any other failure is thrown.
async function getJson<T>(path: string, params: Params = {}) {
  const url = apiUrl(path)
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) url.searchParams.set(key, String(value))
  }
  const response = await fetch(url)
  if (response.status === 404) return null
  if (!response.ok) throw new Error(`API ${response.status} for ${path}`)
  return (await response.json()) as T
}

export type ApiHealth = { status: string; database: string; version: string }

export type Source = {
  publisher: string
  record: string | null
  url: string | null
  fetched_at: string | null
  document_id: number | null
}

export type EntityRef = { cui: number; name: string; kind: string }
export type Entity = EntityRef & {
  county: string | null
  locality: string | null
}

export type Summary = {
  purchases: number
  accepted: number
  value: number
  above_limit: number
  above_limit_value: number
  first_day: string | null
  last_day: string | null
}

export type Stats = {
  direct_purchases: Summary
  institutions: number
  suppliers: number
  limit: number
  source: Source
}

export type Partner = EntityRef & { accepted: number; value: number }

export type EntityPage = {
  entity: Entity
  direct_purchases: Summary
  partners: Array<Partner>
  source: Source
}

export type Purchase = {
  id: number
  code: string | null
  name: string | null
  state_id: number | null
  state: string | null
  cpv_code: string | null
  cpv_name: string | null
  buyer: EntityRef | null
  buyer_text: string | null
  supplier: EntityRef | null
  supplier_text: string | null
  published_at: string | null
  finalized_at: string | null
  estimated_value: number | null
  value: number | null
  above_limit: boolean
  source: Source
}

export type PurchasePage = { total: number; items: Array<Purchase> }

export type RankingRow = Partner & { rank: number }
export type Ranking = {
  date_from: string | null
  date_to: string | null
  items: Array<RankingRow>
  source: Source
}

// 'institutions' looks at an entity as a buyer, 'suppliers' as a seller.
export type Role = 'institutions' | 'suppliers'

export const PAGE_SIZE = 20

export const getApiHealth = createServerFn({ method: 'GET' }).handler(
  async (): Promise<ApiHealth | null> => {
    try {
      return await getJson<ApiHealth>('/v1/health')
    } catch {
      return null
    }
  },
)

// The home page must still render when the API is down, so this one never throws.
export const getStats = createServerFn({ method: 'GET' }).handler(
  async (): Promise<Stats | null> => {
    try {
      return await getJson<Stats>('/v1/stats')
    } catch {
      return null
    }
  },
)

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

export const getEntityPage = createServerFn({ method: 'GET' })
  .inputValidator((data: { role: Role; cui: number }) => data)
  .handler(({ data }) =>
    getJson<EntityPage>(`/v1/${data.role}/${data.cui}`, { partners: 10 }),
  )

export const getPurchases = createServerFn({ method: 'GET' })
  .inputValidator(
    (data: { role: Role; cui: number; page: number; byValue: boolean }) => data,
  )
  .handler(async ({ data }): Promise<PurchasePage> => {
    const found = await getJson<PurchasePage>('/v1/direct-purchases', {
      [data.role === 'institutions' ? 'buyer' : 'supplier']: data.cui,
      sort: data.byValue ? 'value' : 'newest',
      limit: PAGE_SIZE,
      offset: (data.page - 1) * PAGE_SIZE,
    })
    return found ?? { total: 0, items: [] }
  })

export const getRanking = createServerFn({ method: 'GET' })
  .inputValidator((data: { role: Role }) => data)
  .handler(({ data }) =>
    getJson<Ranking>(`/v1/rankings/${data.role}`, { limit: 20 }),
  )
