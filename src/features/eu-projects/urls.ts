import type { EuStatus } from '#/features/eu-projects/api'
import { pageFromParam } from '#/lib/urls'

// The EU funds page: /programe/fonduri-europene?program=por-2014&stare=reziliat&q=drum.
// `program` is a programme's code in lower case and its period's first year (eu.ts).
export type EuStatusParam = 'in-implementare' | 'finalizat' | 'reziliat'

export const EU_STATUS_PARAMS: Record<EuStatus, EuStatusParam> = {
  in_progress: 'in-implementare',
  finished: 'finalizat',
  terminated: 'reziliat',
}

export function euStatusOfParam(
  param: EuStatusParam | undefined,
): EuStatus | undefined {
  const found = Object.entries(EU_STATUS_PARAMS).find(
    ([, value]) => value === param,
  )
  return found ? (found[0] as EuStatus) : undefined
}

export type EuSearch = {
  program?: string
  stare?: EuStatusParam
  q?: string
  pagina?: number
}

export function validateEuSearch(search: Record<string, unknown>): EuSearch {
  // A SMIS code typed in the field arrives as a number.
  const q =
    typeof search.q === 'string' || typeof search.q === 'number'
      ? String(search.q).trim().slice(0, 100)
      : ''
  return {
    program:
      typeof search.program === 'string' &&
      /^[a-z]{2,10}-\d{4}$/i.test(search.program)
        ? search.program.toLowerCase()
        : undefined,
    stare:
      typeof search.stare === 'string' &&
      Object.values<string>(EU_STATUS_PARAMS).includes(search.stare)
        ? (search.stare as EuStatusParam)
        : undefined,
    q: q.length >= 2 ? q : undefined,
    pagina: pageFromParam(search.pagina),
  }
}
