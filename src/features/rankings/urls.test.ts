import { describe, expect, it } from 'vitest'

import { rankingQuery } from '#/features/rankings/queries'
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

  it("keeps a ranking's words, order and page, and only on a ranking", () => {
    expect(
      validateRankingSearch({
        clasament: 'institutii',
        q: 'spital',
        ordine: 'numar-desc',
        pe_pagina: 50,
        pagina: 2,
      }),
    ).toEqual({
      clasament: 'institutii',
      q: 'spital',
      ordine: 'numar-desc',
      pe_pagina: 50,
      pagina: 2,
    })
    // The ranking's own order stays out of the address.
    expect(
      validateRankingSearch({ clasament: 'furnizori', ordine: 'valoare-desc' })
        .ordine,
    ).toBeUndefined()
    expect(validateRankingSearch({ q: 'spital', pagina: 2 })).toEqual({})
  })

  it('keeps who bought and a period only for direct purchases', () => {
    expect(
      validateRankingSearch({
        clasament: 'achizitii',
        parte: 'institutii',
        de_la: '2026-10-01',
      }),
    ).toEqual({
      clasament: 'achizitii',
      parte: 'institutii',
      de_la: '2026-10-01',
    })
    expect(
      validateRankingSearch({ clasament: 'furnizori', parte: 'institutii' }),
    ).toEqual({ clasament: 'furnizori' })
  })
})

describe('rankingQuery', () => {
  it('asks for the ranking of the tab, its page and its order', () => {
    expect(
      rankingQuery({ clasament: 'achizitii', parte: 'institutii', pagina: 3 }),
    ).toMatchObject({
      kind: 'institutions',
      sort: 'value',
      order: 'desc',
      size: 25,
      page: 3,
    })
    expect(
      rankingQuery({ clasament: 'furnizori', ordine: 'numar-cresc' }),
    ).toMatchObject({ kind: 'contract-suppliers', sort: 'count', order: 'asc' })
  })
})
