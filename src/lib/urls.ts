// What a shared address means: the parts of a URL that decide which page is shown.

// The CUI in an address like /institutii/4305857. Only the shape is checked here (a CUI
// has at most ten digits); the API knows which numbers exist and answers "not found".
export function cuiFromPath(text: string) {
  return /^\d{1,10}$/.test(text) ? Number(text) : null
}

// The page of a paged list in the address: ?pagina=3. The first page is left out.
export function pageFromParam(value: unknown) {
  const page = Number(value)
  return Number.isInteger(page) && page > 1 ? page : undefined
}

// Search params of a page whose list is paged and nothing else.
export type PageSearch = { pagina?: number }

export function validatePageSearch(
  search: Record<string, unknown>,
): PageSearch {
  return { pagina: pageFromParam(search.pagina) }
}

// SEAP's own id in an address like /contracte/100660503. Only the shape is checked; the
// API knows which records exist.
export function idFromPath(text: string) {
  return /^\d{1,12}$/.test(text) ? Number(text) : null
}

// What the search box puts in the address for the words typed.
export function searchParam(text: string): string | number {
  return /^[1-9]\d{0,14}$/.test(text) ? Number(text) : text
}
