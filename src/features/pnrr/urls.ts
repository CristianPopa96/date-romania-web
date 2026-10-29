import type { PnrrStatus } from '#/features/pnrr/api'

// A contract's status in the address, and back; list.ts reads the rest of a list's address.
export type PnrrStatusParam = 'in-implementare' | 'sub-30' | 'finalizat'

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

// The PNRR programme page: /programe/pnrr?tab=beneficiari.
export type PnrrProgrammeSearch = { tab?: 'masuri' | 'beneficiari' }

export function validatePnrrProgrammeSearch(
  search: Record<string, unknown>,
): PnrrProgrammeSearch {
  return { tab: search.tab === 'beneficiari' ? 'beneficiari' : undefined }
}
