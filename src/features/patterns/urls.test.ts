import { describe, expect, it } from 'vitest'

import {
  patternCsvFilterFromSearch,
  patternCsvPath,
} from '#/features/patterns/urls'

describe('the address of the pattern file', () => {
  const read = (query: string) =>
    patternCsvFilterFromSearch(new URLSearchParams(query))

  it('carries the CPV filter of the tab, and reads it back', () => {
    expect(patternCsvPath()).toBe('/tipare.csv')
    expect(patternCsvPath('45')).toBe('/tipare.csv?cpv=45')
    expect(read('')).toEqual({ cpv: undefined })
    expect(read('cpv=45')).toEqual({ cpv: '45' })
  })

  it('refuses a filter it cannot apply or a CPV that is not one', () => {
    expect(read('cpv=4x')).toBeNull()
    expect(read('ue=da')).toBeNull()
  })
})
