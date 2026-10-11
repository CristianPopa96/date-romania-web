// What a shared address means: the parts of a URL that decide which page is shown.

// Search params shared by the institution and the supplier page.
export type EntitySearch = { pagina?: number; ordine?: 'valoare' }

export function validateEntitySearch(
  search: Record<string, unknown>,
): EntitySearch {
  const page = Number(search.pagina)
  return {
    pagina: Number.isInteger(page) && page > 1 ? page : undefined,
    ordine: search.ordine === 'valoare' ? 'valoare' : undefined,
  }
}

// The CUI in an address like /institutii/4305857. Only the shape is checked here (a CUI
// has at most ten digits); the API knows which numbers exist and answers "not found".
export function cuiFromPath(text: string) {
  return /^\d{1,10}$/.test(text) ? Number(text) : null
}

// Search params of a page whose list is paged and nothing else.
export type PageSearch = { pagina?: number }

export function validatePageSearch(
  search: Record<string, unknown>,
): PageSearch {
  return { pagina: validateEntitySearch(search).pagina }
}

// SEAP's own id in an address like /contracte/100660503. Only the shape is checked; the
// API knows which records exist.
export function idFromPath(text: string) {
  return /^\d{1,12}$/.test(text) ? Number(text) : null
}
