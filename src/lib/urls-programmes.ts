// What a programme page's address means: the Anghel Saligny finder and the PNRR measure
// pages. Kept apart from urls.ts, which holds every other page's.
import type { PnrrStatus } from '#/lib/api-pnrr'
import { isMatchParam } from '#/lib/programme'
import type { MatchParam } from '#/lib/programme'
import { cuiFromPath, validateEntitySearch } from '#/lib/urls'

// A PNRR measure's page: /programe/pnrr/c10.i3?judet=gorj&stare=finalizat&q=scoala.
// `judet` is the dashboard's county without its marks (see lib/pnrr.ts).
export type PnrrStatusParam = 'in-implementare' | 'sub-30' | 'finalizat'

// A contract's status in the address, and back.
export const PNRR_STATUS_PARAMS: Record<PnrrStatus, PnrrStatusParam> = {
  in_progress: 'in-implementare',
  under_30: 'sub-30',
  finished: 'finalizat',
}

export function statusOfParam(
  param: PnrrStatusParam | undefined,
): PnrrStatus | undefined {
  const found = Object.entries(PNRR_STATUS_PARAMS).find(
    ([, value]) => value === param,
  )
  return found ? (found[0] as PnrrStatus) : undefined
}
export type PnrrSearch = {
  judet?: string
  stare?: PnrrStatusParam
  q?: string
  pagina?: number
}

export function validatePnrrSearch(
  search: Record<string, unknown>,
): PnrrSearch {
  const q = typeof search.q === 'string' ? search.q.trim().slice(0, 100) : ''
  return {
    judet:
      typeof search.judet === 'string' && /^[a-z0-9-]{2,40}$/.test(search.judet)
        ? search.judet
        : undefined,
    stare:
      typeof search.stare === 'string' &&
      Object.values<string>(PNRR_STATUS_PARAMS).includes(search.stare)
        ? (search.stare as PnrrStatusParam)
        : undefined,
    q: q.length >= 2 ? q : undefined,
    pagina: validateEntitySearch(search).pagina,
  }
}

// The PNRR programme page: /programe/pnrr?tab=beneficiari.
export type PnrrProgrammeSearch = { tab?: 'masuri' | 'beneficiari' }

export function validatePnrrProgrammeSearch(
  search: Record<string, unknown>,
): PnrrProgrammeSearch {
  return { tab: search.tab === 'beneficiari' ? 'beneficiari' : undefined }
}

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
    pagina: validateEntitySearch(search).pagina,
  }
}
