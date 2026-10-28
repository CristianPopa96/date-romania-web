import { describe, expect, it } from 'vitest'

import {
  contractApiSort,
  contractFileSearch,
  contractFilter,
  validateContractListSearch,
  wonOf,
} from '#/features/contracts/list'

describe('the address of a list of contracts', () => {
  it('keeps every filter it understands, and only those', () => {
    expect(
      validateContractListSearch({
        q: '  drum  ',
        de_la: '2026-10-01',
        pana_la: '2026-02-31',
        valoare_min: '1000000',
        furnizor: 17886786,
        cpv: '45',
        fel: '3,2',
        ue: 'da',
        castig: 'asociere',
        ordine: 'valoare-cresc',
        stare: '7',
      }),
    ).toEqual({
      q: 'drum',
      de_la: '2026-10-01',
      valoare_min: 1000000,
      furnizor: 17886786,
      // Read back as a number, as the router writes it without quotes.
      cpv: 45,
      // A framework agreement is never in the list.
      fel: 3,
      ue: 'da',
      castig: 'asociere',
      ordine: 'valoare-cresc',
    })
    expect(validateContractListSearch({ ue: 'poate', castig: 'x' })).toEqual({})
  })

  it('asks the API in its own words, for the party of the page', () => {
    expect(
      contractFilter('institutions', 4981310, {
        furnizor: 17886786,
        fel: '1,3',
        ue: 'nu',
      }),
    ).toMatchObject({
      buyer: 4981310,
      supplier: 17886786,
      kind: [1, 3],
      eu_funded: 'false',
      won: undefined,
    })
    expect(
      contractFilter('suppliers', 17886786, { institutie: 4981310 }, 'alone'),
    ).toMatchObject({ supplier: 17886786, buyer: 4981310, won: 'alone' })
    expect(contractApiSort({ ordine: 'institutie-desc' })).toEqual({
      sort: 'buyer',
      order: 'desc',
    })
    expect(contractApiSort({})).toEqual({ sort: 'date', order: 'desc' })
  })

  it('opens a company on what it won alone, else on its associations', () => {
    expect(wonOf({}, 2)).toBe('alone')
    expect(wonOf({}, 0)).toBe('association')
    expect(wonOf({ castig: 'singur' }, 0)).toBe('alone')
    expect(wonOf({ castig: 'asociere' }, 2)).toBe('association')
  })

  it('gives the file the CUI, how it was won, the filters and the order', () => {
    expect(
      contractFileSearch(
        'suppliers',
        17886786,
        { fel: 3, ordine: 'valoare-desc', pe_pagina: 50, vedere: 'tabel' },
        'association',
      ),
    ).toEqual({
      furnizor: '17886786',
      castig: 'asociere',
      fel: '3',
      ordine: 'valoare-desc',
    })
  })
})
