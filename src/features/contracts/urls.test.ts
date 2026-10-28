import { describe, expect, it } from 'vitest'

import {
  contractsCsvPath,
  csvFilterFromSearch,
} from '#/features/contracts/urls'

describe('the address of a CSV file', () => {
  const read = (query: string) =>
    csvFilterFromSearch(new URLSearchParams(query))

  it('names the institution or the company whose contracts it holds', () => {
    expect(contractsCsvPath({ buyer: 4981310 })).toBe(
      '/contracte.csv?institutie=4981310',
    )
    expect(contractsCsvPath({ supplier: 17886786 })).toBe(
      '/contracte.csv?furnizor=17886786',
    )
    expect(contractsCsvPath({})).toBe('/contracte.csv')
  })

  it('is read back into the same filter', () => {
    expect(read('institutie=4981310')).toEqual({ buyer: 4981310 })
    expect(read('furnizor=17886786')).toEqual({ supplier: 17886786 })
    expect(read('')).toEqual({})
  })

  it('refuses anything that is not one CUI', () => {
    expect(read('institutie=abc')).toBeNull()
    expect(read('furnizor=1;drop')).toBeNull()
    expect(read('institutie=4981310&furnizor=17886786')).toBeNull()
  })

  it('refuses a filter on the contracts of one CUI, which cannot apply it', () => {
    expect(read('institutie=4981310&cpv=45')).toBeNull()
    expect(read('furnizor=17886786&ue=da')).toBeNull()
  })

  it('carries the filters of the rankings for the whole period', () => {
    expect(contractsCsvPath({ cpv: '45', eu: true })).toBe(
      '/contracte.csv?cpv=45&ue=da',
    )
    expect(read('cpv=45&ue=da')).toEqual({ cpv: '45', eu: true })
    expect(read('ue=nu')).toEqual({ eu: false })
    expect(read('cpv=4x')).toBeNull()
    expect(read('ue=poate')).toBeNull()
  })
})
