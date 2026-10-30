import { describe, expect, it } from 'vitest'

import { rankingQuery } from '#/features/rankings/queries'
import {
  rankingFilter,
  validateClasamenteSearch,
  validateRankingSearch,
} from '#/features/rankings/urls'

// The address without the keys left undefined, as the router writes it.
function written(search: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(search).filter(([, value]) => value !== undefined),
  )
}

describe('validateClasamenteSearch', () => {
  const read = (search: Record<string, unknown>) =>
    written(validateClasamenteSearch(search))

  it('opens on the list of every contract, the largest first', () => {
    expect(read({})).toEqual({})
    expect(read({ clasament: 'contracte' })).toEqual({})
    expect(read({ clasament: 'nimic' })).toEqual({})
    // The largest first is the list's own order: left out of the address.
    expect(read({ ordine: 'valoare-desc' })).toEqual({})
    expect(read({ ordine: 'data-desc' })).toEqual({ ordine: 'data-desc' })
  })

  it('keeps the filters the list of every contract offers, and only those', () => {
    expect(
      read({
        furnizor: '17886786',
        institutie: '4981310',
        castig: 'asociere',
        judet: 'gorj',
        cpv: '45',
        ue: 'da',
        de_la: '2026-09-01',
        // Not offered on this tab: never a filter the reader cannot see.
        fel: '3',
        valoare_min: '1000',
      }),
    ).toEqual({
      furnizor: 17886786,
      institutie: 4981310,
      castig: 'asociere',
      judet: 'gorj',
      cpv: 45,
      ue: 'da',
      de_la: '2026-09-01',
    })
    expect(read({ judet: 'nicaieri' })).toEqual({})
  })

  it('keeps the list of every accepted purchase with its own filters', () => {
    expect(
      read({
        clasament: 'achizitii',
        furnizor: '18288250',
        judet: 'dolj',
        pagina: 2,
        stare: '7',
        tip: '1',
      }),
    ).toEqual({
      clasament: 'achizitii',
      furnizor: 18288250,
      judet: 'dolj',
      pagina: 2,
    })
  })
})

describe('validateRankingSearch', () => {
  it('keeps a CPV code everywhere and EU funds only on contract rankings', () => {
    // A number in the address, or it would be written back in quotes; "03" keeps its zero.
    expect(
      written(
        validateRankingSearch({ clasament: 'furnizori', cpv: '45', ue: 'da' }),
      ),
    ).toEqual({ clasament: 'furnizori', cpv: 45, ue: 'da' })
    expect(
      validateRankingSearch({ clasament: 'furnizori', cpv: '03' }).cpv,
    ).toBe('03')
    expect(
      written(
        validateRankingSearch({ clasament: 'tipare', cpv: 4523, ue: 'nu' }),
      ),
    ).toEqual({ clasament: 'tipare', cpv: 4523 })
    // Direct purchases do not say how they are paid for.
    expect(
      validateRankingSearch({
        clasament: 'institutii',
        bani: 'achizitii',
        ue: 'da',
      }).ue,
    ).toBeUndefined()
  })

  it('turns the address into what the API filters by', () => {
    expect(rankingFilter({ cpv: 45, ue: 'nu' })).toEqual({
      cpv: '45',
      eu: false,
    })
    expect(rankingFilter({})).toEqual({ cpv: undefined, eu: undefined })
  })

  it('reads how contracts were won only for the ranking of winners', () => {
    expect(
      written(
        validateRankingSearch({
          clasament: 'furnizori',
          castigate: 'asociere',
        }),
      ),
    ).toEqual({ clasament: 'furnizori', castigate: 'asociere' })
    expect(
      validateRankingSearch({ clasament: 'institutii', castigate: 'asociere' })
        .castigate,
    ).toBeUndefined()
    expect(
      validateRankingSearch({
        clasament: 'furnizori',
        bani: 'achizitii',
        castigate: 'asociere',
      }).castigate,
    ).toBeUndefined()
  })

  it("keeps a ranking's words, county, order and page", () => {
    expect(
      written(
        validateRankingSearch({
          clasament: 'institutii',
          q: 'spital',
          judet: 'gorj',
          ordine: 'numar-desc',
          pe_pagina: 50,
          pagina: 2,
        }),
      ),
    ).toEqual({
      clasament: 'institutii',
      q: 'spital',
      judet: 'gorj',
      ordine: 'numar-desc',
      pe_pagina: 50,
      pagina: 2,
    })
    // The ranking's own order stays out of the address.
    expect(
      validateRankingSearch({ clasament: 'furnizori', ordine: 'valoare-desc' })
        .ordine,
    ).toBeUndefined()
  })

  it('keeps a period only for a ranking by direct purchases', () => {
    expect(
      written(
        validateRankingSearch({
          clasament: 'furnizori',
          bani: 'achizitii',
          de_la: '2026-10-01',
        }),
      ),
    ).toEqual({
      clasament: 'furnizori',
      bani: 'achizitii',
      de_la: '2026-10-01',
    })
    expect(
      written(
        validateRankingSearch({ clasament: 'furnizori', de_la: '2026-10-01' }),
      ),
    ).toEqual({ clasament: 'furnizori' })
  })
})

describe('rankingQuery', () => {
  it('asks for the ranking of the tab and its money, its page and its order', () => {
    expect(
      rankingQuery({
        clasament: 'institutii',
        bani: 'achizitii',
        judet: 'gorj',
        pagina: 3,
      }),
    ).toMatchObject({
      kind: 'institutions',
      county: 'GJ',
      sort: 'value',
      order: 'desc',
      size: 25,
      page: 3,
    })
    expect(
      rankingQuery({ clasament: 'furnizori', ordine: 'numar-cresc' }),
    ).toMatchObject({ kind: 'contract-suppliers', sort: 'count', order: 'asc' })
    expect(
      rankingQuery({ clasament: 'furnizori', bani: 'achizitii' }).kind,
    ).toBe('suppliers')
  })
})
