// The file of the "just under the limit" pattern: every purchase of every pair, with the
// CPV filter of the tab. Null for an address with anything else, or a CPV that is not one.
export function patternCsvPath(cpv?: string) {
  return cpv ? `/tipare.csv?cpv=${cpv}` : '/tipare.csv'
}

export function patternCsvFilterFromSearch(
  params: URLSearchParams,
): { cpv?: string } | null {
  if ([...params.keys()].some((key) => key !== 'cpv')) return null
  const cpv = params.get('cpv')
  if (cpv !== null && !/^\d{2,8}$/.test(cpv)) return null
  return { cpv: cpv ?? undefined }
}
