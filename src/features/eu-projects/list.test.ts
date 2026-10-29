import { describe, expect, it } from 'vitest'

import {
  euProjectFilter,
  programmeCodes,
  validateEuProjectListSearch,
} from '#/features/eu-projects/list'

const HELD = [
  { code: 'POAT', period: '2014-2020' },
  { code: 'PoAT', period: '2021-2027' },
  { code: 'PEO', period: '2021-2027' },
]

describe('the address of a list of EU projects', () => {
  it('keeps programmes, statuses and the order it understands', () => {
    expect(
      validateEuProjectListSearch({
        program: 'PEO-2021,poat-2014',
        stare: 'finalizat,in-implementare',
        ordine: 'platit-desc',
        q: 'x',
      }),
    ).toMatchObject({
      program: 'peo-2021,poat-2014',
      // In the order of the statuses, each once.
      stare: 'in-implementare,finalizat',
      ordine: 'platit-desc',
      // One letter is no search.
      q: undefined,
    })
    expect(validateEuProjectListSearch({ stare: '7' }).stare).toBeUndefined()
  })

  it('finds a programme by code and period: POAT and PoAT differ only in case', () => {
    expect(programmeCodes(HELD, 'poat-2021')).toEqual(['PoAT'])
    expect(programmeCodes(HELD, 'poat-2014,peo-2021')).toEqual(['POAT', 'PEO'])
    expect(programmeCodes(HELD, 'por-2014')).toBeUndefined()
  })

  it('reads a SMIS code typed as a number, and keeps old finder addresses', () => {
    expect(String(validateEuProjectListSearch({ q: 312456 }).q)).toBe('312456')
    // The funds page took one programme and one status: still read the same.
    expect(
      validateEuProjectListSearch({ program: 'PoIDS-2021', stare: 'reziliat' }),
    ).toMatchObject({ program: 'poids-2021', stare: 'reziliat' })
  })

  it('asks for every beneficiary on the funds page', () => {
    expect(euProjectFilter(undefined, { q: 'drum' }, ['POR'])).toMatchObject({
      beneficiary: undefined,
      programme: ['POR'],
      q: 'drum',
    })
  })

  it('never sends a one-letter search, which other lists keep in the address', () => {
    expect(euProjectFilter(4491342, { q: 'a' }, undefined).q).toBeUndefined()
    expect(euProjectFilter(4491342, { q: 'ab' }, undefined).q).toBe('ab')
  })

  it('asks the API for the beneficiary, programmes and statuses', () => {
    expect(
      euProjectFilter(4491342, { stare: 'reziliat', valoare_min: 5 }, ['PEO']),
    ).toMatchObject({
      beneficiary: 4491342,
      programme: ['PEO'],
      status: ['terminated'],
      value_min: 5,
    })
  })
})
