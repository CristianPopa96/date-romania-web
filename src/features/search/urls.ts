// The search page: the words searched, and one kind of result when a tab narrows them.
export type SearchKind = 'institutii' | 'firme' | 'localitati'

// `q` is a number when the address carries one (a CUI): written back as text it would
// come out in quotes, `?q="4981310"`.
export type SearchSearch = { q: string | number; tip?: SearchKind }

export function validateSearchSearch(
  search: Record<string, unknown>,
): SearchSearch {
  return {
    q:
      typeof search.q === 'string' || typeof search.q === 'number'
        ? search.q
        : '',
    tip:
      search.tip === 'institutii' ||
      search.tip === 'firme' ||
      search.tip === 'localitati'
        ? search.tip
        : undefined,
  }
}
