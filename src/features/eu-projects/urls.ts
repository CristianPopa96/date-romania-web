import type { EuStatus } from '#/features/eu-projects/api'

// A project's status in the address, and back. `program` (list.ts) is a programme's code
// in lower case and its period's first year (eu.ts).
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
