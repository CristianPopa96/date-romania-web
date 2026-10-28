import { isMatchParam } from '#/features/programme/programme'
import type { MatchParam } from '#/features/programme/programme'
import { cuiFromPath, pageFromParam } from '#/lib/urls'

// The programme page: /programe/anghel-saligny?judet=gorj&q=drum&legatura=mai-multe.
// `firma` is a builder's CUI, for "every project this company builds".
export type ProgrammeSearch = {
  judet?: string
  q?: string
  legatura?: MatchParam
  firma?: number
  pagina?: number
}

export function validateProgrammeSearch(
  search: Record<string, unknown>,
): ProgrammeSearch {
  // A number typed in the field arrives as a number, like a CUI in the search page.
  const q =
    typeof search.q === 'string' || typeof search.q === 'number'
      ? String(search.q).trim().slice(0, 100)
      : ''
  const builder =
    typeof search.firma === 'number' || typeof search.firma === 'string'
      ? cuiFromPath(String(search.firma))
      : null
  return {
    judet:
      typeof search.judet === 'string' &&
      /^[a-z]{2,20}(-[a-z]{2,20})?$/.test(search.judet)
        ? search.judet
        : undefined,
    q: q.length >= 2 ? q : undefined,
    legatura: isMatchParam(search.legatura) ? search.legatura : undefined,
    // No company has the tax ID 0.
    firma: builder || undefined,
    pagina: pageFromParam(search.pagina),
  }
}
