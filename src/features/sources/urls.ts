import { sitePath } from '#/lib/reports'

// /surse?fila=metodologie; the sources themselves are the page's plain address.
// `despre` is the page a reader came from to report an error: /surse?despre=/contracte/9001.
export type SourcesSearch = {
  fila?: 'metodologie' | 'corecturi'
  despre?: string
}

export function validateSourcesSearch(
  search: Record<string, unknown>,
): SourcesSearch {
  return {
    fila:
      search.fila === 'metodologie' || search.fila === 'corecturi'
        ? search.fila
        : undefined,
    despre: sitePath(search.despre),
  }
}
