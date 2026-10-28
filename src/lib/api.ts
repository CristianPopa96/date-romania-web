import { createServerFn } from '@tanstack/react-start'

import type { components } from '#/lib/api-schema.gen'

// The site talks to the FastAPI back end only from the server, so the API
// address stays internal and the browser never needs CORS. The default is 127.0.0.1, not
// localhost: Docker publishes the API on IPv4 only, and localhost can try IPv6 first.
// The answers' shapes, generated from the API's schema (openapi.json, `pnpm
// generate-api-types`). Each file names the ones it uses.
export type Schemas = components['schemas']

type Params = Record<
  string,
  string | number | ReadonlyArray<string | number> | undefined
>

// A parameter left undefined is not sent; a list is sent once per value (state=7&state=3).
function apiUrl(path: string, params: Params = {}) {
  const url = new URL(path, process.env.API_URL ?? 'http://127.0.0.1:8000')
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue
    for (const each of Array.isArray(value) ? value : [value]) {
      url.searchParams.append(key, String(each))
    }
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

// A file the API writes (a CSV export), passed on byte for byte as it arrives, so a long
// one is never held whole here either. Reading it as text would drop the mark at its
// start that makes spreadsheet programs read the diacritics.
export async function getFile(path: string, params: Params = {}) {
  const response = await fetch(apiUrl(path, params))
  if (!response.ok || !response.body) {
    throw new Error(`API ${response.status} for ${path}`)
  }
  return response.body
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

export type Source = Schemas['Source']

export type EntityRef = Schemas['EntityRef']

export type Entity = Schemas['EntityOut']

export type Summary = Schemas['Summary']

export type Stats = Schemas['Stats']

export type Partner = Schemas['Partner']

// 'institutions' looks at an entity as a buyer, 'suppliers' as a seller.
export type Role = 'institutions' | 'suppliers'

export const PAGE_SIZE = 20

// SEAP's state for a purchase whose offer was accepted: the only ones that are money spent.
export const ACCEPTED = 7

// The legal limits for a direct purchase, in lei without VAT: for works (the highest), and
// for goods and services. The API holds each purchase to the one of its type for
// `above_limit`; these keep every page's wording in agreement with it.
export const DIRECT_PURCHASE_LIMIT = 900_400

export const DIRECT_PURCHASE_LIMIT_GOODS_SERVICES = 270_120

// The detail of a purchase (its lines and conditions) is one request to SEAP each, so the
// API collects it for accepted purchases from this value up, newest first. Keep it equal
// to `MIN_VALUE` in the API's `collectors/seap_direct/details.py`.
export const DETAIL_MIN_VALUE = 100_000

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

export type Period = Schemas['Period']
