import { createServerFn } from '@tanstack/react-start'

// The site talks to the FastAPI back end only from the server, so the API
// address stays internal and the browser never needs CORS. The default is 127.0.0.1, not
// localhost: Docker publishes the API on IPv4 only, and localhost can try IPv6 first.
type Params = Record<string, string | number | undefined>

// A parameter left undefined is not sent.
function apiUrl(path: string, params: Params = {}) {
  const url = new URL(path, process.env.API_URL ?? 'http://127.0.0.1:8000')
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) url.searchParams.set(key, String(value))
  }
  return url
}

// Null means the API answered "not found"; any other failure is thrown.
export async function getJson<T>(path: string, params: Params = {}) {
  const response = await fetch(apiUrl(path, params))
  if (response.status === 404) return null
  if (!response.ok) throw new Error(`API ${response.status} for ${path}`)
  return (await response.json()) as T
}

// A file the API writes (a CSV export), passed on byte for byte. Reading it as text
// would drop the mark at its start that makes spreadsheet programs read the diacritics.
export async function getFile(path: string, params: Params = {}) {
  const response = await fetch(apiUrl(path, params))
  if (!response.ok) throw new Error(`API ${response.status} for ${path}`)
  return response.arrayBuffer()
}

// The one thing the site sends to the API: a reader's error report. Returns the status.
export async function postJson(
  path: string,
  body: unknown,
  headers: Record<string, string> = {},
) {
  const response = await fetch(apiUrl(path), {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: JSON.stringify(body),
  })
  return response.status
}

export type Source = {
  publisher: string
  record: string | null
  url: string | null
  fetched_at: string | null
  document_id: number | null
  // One record: the hash of the stored answer it was read from, and the parser's version.
  sha256?: string | null
  parser_version?: number | null
  // A total: how many stored answers its rows were read from.
  documents?: number | null
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

// SEAP's state for a purchase whose offer was accepted: the only ones that are money spent.
export const ACCEPTED = 7

// The highest legal limit for a direct purchase (the one for works), in lei without VAT.
// The API uses the same value for `above_limit`; one constant keeps every page in agreement.
export const DIRECT_PURCHASE_LIMIT = 900_400

// One source as we hold it: its days, how many records, when it was last read.
export type Dataset = {
  key: string
  publisher: string
  first_day: string | null
  last_day: string | null
  records: number
  // False when the source publishes late, so the list of the period is never whole.
  complete: boolean
  fetched_at: string | null
  // Days read in full, and days the source would not give in full.
  days_collected: number
  days_partial: number
  // Raw answers kept from the source.
  documents: number
  // Rows of those answers the parser could not read; null until every answer was seen
  // (read, or set aside unread) by a parser that counts them.
  rejected_rows: number | null
  // What is held, by kind of row; `records` is the one the totals use.
  counts: Record<string, number | undefined>
}

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
      // The largest are ranked among accepted purchases only: a refused offer can carry
      // any value and is not money spent.
      state: data.byValue ? ACCEPTED : undefined,
      limit: PAGE_SIZE,
      offset: (data.page - 1) * PAGE_SIZE,
    })
    return found ?? { total: 0, items: [] }
  })

export const getRanking = createServerFn({ method: 'GET' })
  .inputValidator((data: { role: Role; cpv?: string }) => data)
  .handler(({ data }) =>
    getJson<Ranking>(`/v1/rankings/${data.role}`, {
      cpv: data.cpv,
      limit: 20,
    }),
  )
