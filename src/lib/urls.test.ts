import { describe, expect, it } from 'vitest'

import {
  cuiFromPath,
  idFromPath,
  validateEntitySearch,
  validatePageSearch,
} from '#/lib/urls'

describe('validateEntitySearch', () => {
  it('keeps a page number and the value order', () => {
    expect(validateEntitySearch({ pagina: 3, ordine: 'valoare' })).toEqual({
      pagina: 3,
      ordine: 'valoare',
    })
  })

  it('reads a page number written as text', () => {
    expect(validateEntitySearch({ pagina: '12' }).pagina).toBe(12)
  })

  it('drops the first page, so the plain address stays the canonical one', () => {
    expect(validateEntitySearch({ pagina: 1 }).pagina).toBeUndefined()
    expect(validateEntitySearch({}).pagina).toBeUndefined()
  })

  it('drops a page that is not a whole number above one', () => {
    for (const pagina of [0, -2, 2.5, 'abc', '', null, NaN, Infinity]) {
      expect(validateEntitySearch({ pagina }).pagina).toBeUndefined()
    }
  })

  it('accepts only the one known order', () => {
    expect(validateEntitySearch({ ordine: 'recente' }).ordine).toBeUndefined()
    expect(validateEntitySearch({ ordine: 7 }).ordine).toBeUndefined()
  })

  it('ignores params it does not know', () => {
    expect(validateEntitySearch({ pagina: 2, altceva: 'x' })).toEqual({
      pagina: 2,
      ordine: undefined,
    })
  })
})

describe('cuiFromPath', () => {
  it('reads a CUI of one to ten digits', () => {
    expect(cuiFromPath('4305857')).toBe(4305857)
    expect(cuiFromPath('7')).toBe(7)
    expect(cuiFromPath('1234567890')).toBe(1234567890)
  })

  it('rejects anything else, so the page is "not found" without asking the API', () => {
    for (const text of [
      '',
      'abc',
      'RO4305857',
      '43 05',
      '-5',
      '1.5',
      '12345678901',
    ]) {
      expect(cuiFromPath(text)).toBeNull()
    }
  })
})

describe('validatePageSearch', () => {
  it('keeps a page above one and nothing else', () => {
    expect(validatePageSearch({ pagina: '3', ordine: 'valoare' })).toEqual({
      pagina: 3,
    })
    expect(validatePageSearch({ pagina: 1 })).toEqual({ pagina: undefined })
  })
})

describe('idFromPath', () => {
  it("reads SEAP's id from an address", () => {
    expect(idFromPath('100660503')).toBe(100660503)
  })

  it('rejects anything that is not a plain number', () => {
    for (const text of ['', 'abc', '12a', '-5', '1.5', '1234567890123']) {
      expect(idFromPath(text)).toBeNull()
    }
  })
})
