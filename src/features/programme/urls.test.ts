import { describe, expect, it } from 'vitest'

import { validateProgrammeSearch } from '#/features/programme/urls'

describe('validateProgrammeSearch', () => {
  it('keeps what the programme page understands', () => {
    expect(
      validateProgrammeSearch({
        judet: 'bistrita-nasaud',
        q: ' drum ',
        legatura: 'mai-multe',
        firma: 17886786,
        pagina: 3,
      }),
    ).toEqual({
      judet: 'bistrita-nasaud',
      q: 'drum',
      legatura: 'mai-multe',
      firma: 17886786,
      pagina: 3,
    })
  })

  it('drops what it does not', () => {
    expect(
      validateProgrammeSearch({
        judet: 'GORJ; drop',
        q: 'a',
        legatura: 'toString',
        firma: 0,
        pagina: 1,
      }),
    ).toEqual({
      judet: undefined,
      q: undefined,
      legatura: undefined,
      firma: undefined,
      pagina: undefined,
    })
    expect(validateProgrammeSearch({ legatura: 'constructor' }).legatura).toBe(
      undefined,
    )
  })

  it('reads a number typed in the search field as words', () => {
    expect(validateProgrammeSearch({ q: 12519 }).q).toBe('12519')
  })
})
