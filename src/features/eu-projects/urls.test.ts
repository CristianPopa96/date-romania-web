import { describe, expect, it } from 'vitest'

import { euStatusOfParam, validateEuSearch } from '#/features/eu-projects/urls'

describe('validateEuSearch', () => {
  it('keeps a programme, a status and words', () => {
    expect(
      validateEuSearch({
        program: 'PoIDS-2021',
        stare: 'reziliat',
        q: ' drum ',
      }),
    ).toEqual({
      program: 'poids-2021',
      stare: 'reziliat',
      q: 'drum',
      pagina: undefined,
    })
  })

  it('drops what no page can mean', () => {
    expect(
      validateEuSearch({
        program: '../x',
        stare: 'etapizat',
        q: 'a',
        pagina: -1,
      }),
    ).toEqual({
      program: undefined,
      stare: undefined,
      q: undefined,
      pagina: undefined,
    })
  })

  it('reads a SMIS code typed as a number', () => {
    expect(validateEuSearch({ q: 312456 }).q).toBe('312456')
  })

  it('gives the API its word for a status', () => {
    expect(euStatusOfParam('in-implementare')).toBe('in_progress')
    expect(euStatusOfParam(undefined)).toBeUndefined()
  })
})
