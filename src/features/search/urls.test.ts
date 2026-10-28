import { describe, expect, it } from 'vitest'

import { searchParam } from '#/lib/urls'
import { validateSearchSearch } from '#/features/search/urls'

describe('validateSearchSearch', () => {
  it('keeps the words searched', () => {
    expect(validateSearchSearch({ q: 'tantareni' })).toEqual({
      q: 'tantareni',
      tip: undefined,
    })
    expect(validateSearchSearch({}).q).toBe('')
  })

  it('keeps a CUI as the number the address carries, so it is not quoted', () => {
    expect(validateSearchSearch({ q: 4981310 }).q).toBe(4981310)
    expect(searchParam('4981310')).toBe(4981310)
    expect(searchParam('RO4981310')).toBe('RO4981310')
    expect(searchParam('0123')).toBe('0123')
    expect(searchParam('primăria')).toBe('primăria')
  })

  it('keeps a kind of result that has a tab', () => {
    expect(validateSearchSearch({ q: 'a', tip: 'firme' }).tip).toBe('firme')
    expect(validateSearchSearch({ q: 'a', tip: 'localitati' }).tip).toBe(
      'localitati',
    )
    expect(validateSearchSearch({ q: 'a', tip: 'contracte' }).tip).toBe(
      undefined,
    )
  })
})
