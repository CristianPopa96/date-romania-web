import { describe, expect, it } from 'vitest'

import {
  contractsCsvName,
  contractsCsvPath,
  contractsCsvQuery,
} from '#/features/contracts/urls'

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

  it("keeps a company's way of winning when an institution is chosen too", () => {
    // From a company's list filtered by one institution: never alone and associations
    // added, and named after the company.
    const company = 'furnizor=17886786&castig=singur&institutie=4981310'
    expect(read(company)).toEqual(
      expect.objectContaining({
        supplier: 17886786,
        buyer: 4981310,
        won: 'alone',
      }),
    )
    expect(contractsCsvName(new URLSearchParams(company))).toBe(
      'contracte-17886786',
    )
    // From an institution's list filtered by one winner: both ways, the institution's.
    const buyer = 'institutie=4981310&furnizor=17886786'
    expect(read(buyer)).toEqual(
      expect.objectContaining({ buyer: 4981310, won: undefined }),
    )
    expect(contractsCsvName(new URLSearchParams(buyer))).toBe(
      'contracte-4981310',
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
