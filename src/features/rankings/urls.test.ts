import { describe, expect, it } from 'vitest'

import { rankingFilter, validateRankingSearch } from '#/features/rankings/urls'

describe('validateRankingSearch', () => {
  it('keeps the plain address for the largest contracts', () => {
    expect(validateRankingSearch({})).toEqual({})
    expect(validateRankingSearch({ clasament: 'contracte' })).toEqual({})
    expect(validateRankingSearch({ clasament: 'nimic' })).toEqual({})
  })

  it('keeps a CPV code everywhere and EU funds only on contract rankings', () => {
    // A number in the address, or it would be written back in quotes; "03" keeps its zero.
    expect(validateRankingSearch({ cpv: '45', ue: 'da' })).toEqual({
      cpv: 45,
      ue: 'da',
    })
    expect(validateRankingSearch({ cpv: '03' }).cpv).toBe('03')
    expect(
      validateRankingSearch({ clasament: 'tipare', cpv: 4523, ue: 'nu' }),
    ).toEqual({ clasament: 'tipare', cpv: 4523 })
    expect(validateRankingSearch({ cpv: '4', ue: 'poate' })).toEqual({})
    expect(validateRankingSearch({ cpv: '45-1' })).toEqual({})
  })

  it('turns the address into what the API filters by', () => {
    expect(rankingFilter({ cpv: 45, ue: 'nu' })).toEqual({
      cpv: '45',
      eu: false,
    })
    expect(rankingFilter({})).toEqual({ cpv: undefined, eu: undefined })
  })

  it('keeps a ranking that exists', () => {
    expect(validateRankingSearch({ clasament: 'achizitii' }).clasament).toBe(
      'achizitii',
    )
  })

  it('reads how contracts were won only for the ranking of winners', () => {
    expect(
      validateRankingSearch({ clasament: 'furnizori', castigate: 'asociere' }),
    ).toEqual({ clasament: 'furnizori', castigate: 'asociere' })
    expect(
      validateRankingSearch({ clasament: 'institutii', castigate: 'asociere' })
        .castigate,
    ).toBeUndefined()
    expect(
      validateRankingSearch({ clasament: 'furnizori', castigate: 'singur' })
        .castigate,
    ).toBeUndefined()
  })
})
