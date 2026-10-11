import { describe, expect, it } from 'vitest'

import { cuiFromQuery, searchTerm } from '#/lib/cui'

describe('cuiFromQuery', () => {
  it('reads a valid CUI, with or without the RO prefix', () => {
    expect(cuiFromQuery('4981310')).toBe(4981310)
    expect(cuiFromQuery(' 17886786 ')).toBe(17886786)
    expect(cuiFromQuery('RO 4981310')).toBe(4981310)
    expect(cuiFromQuery('ro4981310')).toBe(4981310)
  })

  it('refuses a number that fails the checksum', () => {
    expect(cuiFromQuery('4981311')).toBeNull()
    expect(cuiFromQuery('12345678')).toBeNull()
  })

  it('refuses names, zeros and numbers of the wrong length', () => {
    expect(cuiFromQuery('tantareni')).toBeNull()
    expect(cuiFromQuery('Strada 12')).toBeNull()
    expect(cuiFromQuery('0000')).toBeNull()
    expect(cuiFromQuery('5')).toBeNull()
    expect(cuiFromQuery('12345678901')).toBeNull()
    expect(cuiFromQuery('')).toBeNull()
  })
})

describe('searchTerm', () => {
  it('looks a CUI up by its digits, and leaves everything else alone', () => {
    expect(searchTerm('RO 17886786')).toBe('17886786')
    expect(searchTerm('tantareni')).toBe('tantareni')
    expect(searchTerm('4981311')).toBe('4981311')
  })
})
