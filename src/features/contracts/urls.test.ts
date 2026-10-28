import { describe, expect, it } from 'vitest'

import { contractsCsvPath, contractsCsvQuery } from '#/features/contracts/urls'

describe('the address of a CSV file', () => {
  const read = (query: string) => contractsCsvQuery(new URLSearchParams(query))

  it('asks for one CUI with the filters and the order of its list', () => {
    expect(read('institutie=4981310&fel=3&ordine=valoare-cresc')).toEqual(
      expect.objectContaining({
        buyer: 4981310,
        kind: [3],
        sort: 'value',
        order: 'asc',
      }),
    )
    // A buyer's list filtered by one winner.
    expect(read('institutie=4981310&furnizor=17886786')).toEqual(
      expect.objectContaining({ buyer: 4981310, supplier: 17886786 }),
    )
  })

  it('asks for a company one way of winning at a time', () => {
    expect(read('furnizor=17886786')).toEqual(
      expect.objectContaining({ supplier: 17886786, won: 'alone' }),
    )
    expect(read('furnizor=17886786&castig=asociere')).toEqual(
      expect.objectContaining({ won: 'association' }),
    )
  })

  it('refuses a CUI that is not one', () => {
    expect(read('institutie=abc')).toBeNull()
    expect(read('furnizor=1;drop')).toBeNull()
  })

  it('carries the filters of the rankings for the whole period', () => {
    expect(contractsCsvPath({})).toBe('/contracte.csv')
    expect(contractsCsvPath({ cpv: '45', eu: true })).toBe(
      '/contracte.csv?cpv=45&ue=da',
    )
    expect(read('cpv=45&ue=da')).toEqual({
      cpv: '45',
      eu_funded: 'true',
      sort: 'value',
      order: 'desc',
    })
    expect(read('cpv=4x')).toBeNull()
    expect(read('ue=poate')).toBeNull()
  })
})
