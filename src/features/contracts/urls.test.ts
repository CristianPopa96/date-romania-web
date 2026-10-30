import { describe, expect, it } from 'vitest'

import { contractsCsvName, contractsCsvQuery } from '#/features/contracts/urls'

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

  it('asks for every contract with its filters, the largest first', () => {
    // From the "Contracte" tab of Clasamente: the company and the institution are filters.
    expect(
      read('toate=da&furnizor=17886786&castig=singur&judet=gorj&cpv=45&ue=da'),
    ).toEqual(
      expect.objectContaining({
        supplier: 17886786,
        buyer: undefined,
        won: 'alone',
        county: 'GJ',
        cpv: '45',
        eu_funded: 'true',
        sort: 'value',
        order: 'desc',
      }),
    )
    expect(read('toate=da&furnizor=17886786')).toEqual(
      expect.objectContaining({ won: undefined }),
    )
    expect(contractsCsvName(new URLSearchParams('toate=da&furnizor=1'))).toBe(
      'contracte',
    )
    // No party at all is the same list.
    expect(read('cpv=45')).toEqual(
      expect.objectContaining({ cpv: '45', sort: 'value' }),
    )
  })
})
