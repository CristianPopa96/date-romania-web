import { describe, expect, it } from 'vitest'

import {
  entityList,
  entityListSearch,
  validateEntitySearch,
} from '#/features/entities/urls'

describe('validateEntitySearch', () => {
  it('keeps a page number and the value order', () => {
    expect(validateEntitySearch({ pagina: 3, ordine: 'valoare' })).toEqual({
      lista: undefined,
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

describe('the list of an entity page', () => {
  it('keeps a list named in the address and drops anything else', () => {
    expect(validateEntitySearch({ lista: 'achizitii' }).lista).toBe('achizitii')
    expect(validateEntitySearch({ lista: 'contracte' }).lista).toBe('contracte')
    expect(validateEntitySearch({ lista: 'plati' }).lista).toBeUndefined()
  })

  it('opens on contracts when there are any, else on direct purchases', () => {
    expect(entityList({}, true)).toBe('contracte')
    expect(entityList({}, false)).toBe('achizitii')
  })

  it('shows the list the address names, whatever the entity has', () => {
    expect(entityList({ lista: 'achizitii' }, true)).toBe('achizitii')
    expect(entityList({ lista: 'contracte' }, false)).toBe('contracte')
  })

  it('shows an EU list only when the entity has that kind', () => {
    const both = { coeziune: true, pnrr: true }
    expect(validateEntitySearch({ lista: 'pnrr' }).lista).toBe('pnrr')
    expect(entityList({ lista: 'coeziune' }, true, both)).toBe('coeziune')
    expect(entityList({ lista: 'pnrr' }, false, both)).toBe('pnrr')
    const none = { coeziune: false, pnrr: false }
    expect(entityList({ lista: 'pnrr' }, true, none)).toBe('contracte')
    expect(entityList({ lista: 'coeziune' }, false)).toBe('achizitii')
  })

  it('leaves the default list out of the address', () => {
    expect(entityListSearch('contracte', true)).toEqual({ lista: undefined })
    expect(entityListSearch('achizitii', true)).toEqual({ lista: 'achizitii' })
    expect(entityListSearch('achizitii', false)).toEqual({ lista: undefined })
    expect(entityListSearch('contracte', false)).toEqual({ lista: 'contracte' })
  })
})
