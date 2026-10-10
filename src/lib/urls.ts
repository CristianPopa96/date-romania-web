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
