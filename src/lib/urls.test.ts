import { describe, expect, it } from 'vitest'

import {
  contractsCsvPath,
  csvFilterFromSearch,
  patternCsvFilterFromSearch,
  patternCsvPath,
  cuiFromPath,
  entityList,
  entityListSearch,
  idFromPath,
  rankingFilter,
  searchParam,
  validateEntitySearch,
  validatePageSearch,
  validateRankingSearch,
  validateSourcesSearch,
  validateProgrammeSearch,
  validateSearchSearch,
} from '#/lib/urls'

describe('validateSourcesSearch', () => {
  it('keeps a tab it knows and drops anything else', () => {
    expect(validateSourcesSearch({ fila: 'metodologie' }).fila).toBe(
      'metodologie',
    )
    expect(validateSourcesSearch({ fila: 'corecturi' }).fila).toBe('corecturi')
    expect(validateSourcesSearch({ fila: 'surse' }).fila).toBeUndefined()
    expect(validateSourcesSearch({ fila: 7 }).fila).toBeUndefined()
  })

  it('keeps the page a report is about only when it is a page of the site', () => {
    expect(validateSourcesSearch({ despre: '/contracte/9001' })).toEqual({
      fila: undefined,
      despre: '/contracte/9001',
    })
    expect(
      validateSourcesSearch({ despre: 'https://example.test' }).despre,
    ).toBeUndefined()
  })
})

describe('validateEntitySearch', () => {
  it('keeps a page number and the value order', () => {
    expect(validateEntitySearch({ pagina: 3, ordine: 'valoare' })).toEqual({
      lista: undefined,
      pagina: 3,
      ordine: 'valoare',
    })
  })

  it('reads a page number written as text', () => {
    expect(validateEntitySearch({ pagina: '12' }).pagina).toBe(12)
  })

  it('drops the first page, so the plain address stays the canonical one', () => {
    expect(validateEntitySearch({ pagina: 1 }).pagina).toBeUndefined()
    expect(validateEntitySearch({}).pagina).toBeUndefined()
  })

  it('drops a page that is not a whole number above one', () => {
    for (const pagina of [0, -2, 2.5, 'abc', '', null, NaN, Infinity]) {
      expect(validateEntitySearch({ pagina }).pagina).toBeUndefined()
    }
  })

  it('accepts only the one known order', () => {
    expect(validateEntitySearch({ ordine: 'recente' }).ordine).toBeUndefined()
    expect(validateEntitySearch({ ordine: 7 }).ordine).toBeUndefined()
  })

  it('ignores params it does not know', () => {
    expect(validateEntitySearch({ pagina: 2, altceva: 'x' })).toEqual({
      pagina: 2,
      ordine: undefined,
    })
  })
})

describe('cuiFromPath', () => {
  it('reads a CUI of one to ten digits', () => {
    expect(cuiFromPath('4305857')).toBe(4305857)
    expect(cuiFromPath('7')).toBe(7)
    expect(cuiFromPath('1234567890')).toBe(1234567890)
  })

  it('rejects anything else, so the page is "not found" without asking the API', () => {
    for (const text of [
      '',
      'abc',
      'RO4305857',
      '43 05',
      '-5',
      '1.5',
      '12345678901',
    ]) {
      expect(cuiFromPath(text)).toBeNull()
    }
  })
})

describe('validatePageSearch', () => {
  it('keeps a page above one and nothing else', () => {
    expect(validatePageSearch({ pagina: '3', ordine: 'valoare' })).toEqual({
      pagina: 3,
    })
    expect(validatePageSearch({ pagina: 1 })).toEqual({ pagina: undefined })
  })
})

describe('idFromPath', () => {
  it("reads SEAP's id from an address", () => {
    expect(idFromPath('100660503')).toBe(100660503)
  })

  it('rejects anything that is not a plain number', () => {
    for (const text of ['', 'abc', '12a', '-5', '1.5', '1234567890123']) {
      expect(idFromPath(text)).toBeNull()
    }
  })
})

describe('the list of an entity page', () => {
  it('keeps a list named in the address and drops anything else', () => {
    expect(validateEntitySearch({ lista: 'achizitii' }).lista).toBe('achizitii')
    expect(validateEntitySearch({ lista: 'contracte' }).lista).toBe('contracte')
    expect(validateEntitySearch({ lista: 'plati' }).lista).toBeUndefined()
  })

  it('opens on contracts when there are any, else on direct purchases', () => {
    expect(entityList({}, true)).toBe('contracte')
    expect(entityList({}, false)).toBe('achizitii')
  })

  it('shows the list the address names, whatever the entity has', () => {
    expect(entityList({ lista: 'achizitii' }, true)).toBe('achizitii')
    expect(entityList({ lista: 'contracte' }, false)).toBe('contracte')
  })

  it('leaves the default list out of the address', () => {
    expect(entityListSearch('contracte', true)).toEqual({ lista: undefined })
    expect(entityListSearch('achizitii', true)).toEqual({ lista: 'achizitii' })
    expect(entityListSearch('achizitii', false)).toEqual({ lista: undefined })
    expect(entityListSearch('contracte', false)).toEqual({ lista: 'contracte' })
  })
})

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

describe('the address of the pattern file', () => {
  const read = (query: string) =>
    patternCsvFilterFromSearch(new URLSearchParams(query))

  it('carries the CPV filter of the tab, and reads it back', () => {
    expect(patternCsvPath()).toBe('/tipare.csv')
    expect(patternCsvPath('45')).toBe('/tipare.csv?cpv=45')
    expect(read('')).toEqual({ cpv: undefined })
    expect(read('cpv=45')).toEqual({ cpv: '45' })
  })

  it('refuses a filter it cannot apply or a CPV that is not one', () => {
    expect(read('cpv=4x')).toBeNull()
    expect(read('ue=da')).toBeNull()
  })
})

describe('validateSearchSearch', () => {
  it('keeps the words searched', () => {
    expect(validateSearchSearch({ q: 'tantareni' })).toEqual({
      q: 'tantareni',
      tip: undefined,
    })
    expect(validateSearchSearch({}).q).toBe('')
  })

  it('keeps a CUI as the number the address carries, so it is not quoted', () => {
    expect(validateSearchSearch({ q: 4981310 }).q).toBe(4981310)
    expect(searchParam('4981310')).toBe(4981310)
    expect(searchParam('RO4981310')).toBe('RO4981310')
    expect(searchParam('0123')).toBe('0123')
    expect(searchParam('primăria')).toBe('primăria')
  })

  it('keeps a kind of result that has a tab', () => {
    expect(validateSearchSearch({ q: 'a', tip: 'firme' }).tip).toBe('firme')
    expect(validateSearchSearch({ q: 'a', tip: 'contracte' }).tip).toBe(
      undefined,
    )
  })
})

describe('validateProgrammeSearch', () => {
  it('keeps what the programme page understands', () => {
    expect(
      validateProgrammeSearch({
        judet: 'bistrita-nasaud',
        q: ' drum ',
        legatura: 'mai-multe',
        firma: 17886786,
        pagina: 3,
      }),
    ).toEqual({
      judet: 'bistrita-nasaud',
      q: 'drum',
      legatura: 'mai-multe',
      firma: 17886786,
      pagina: 3,
    })
  })

  it('drops what it does not', () => {
    expect(
      validateProgrammeSearch({
        judet: 'GORJ; drop',
        q: 'a',
        legatura: 'toString',
        firma: 0,
        pagina: 1,
      }),
    ).toEqual({
      judet: undefined,
      q: undefined,
      legatura: undefined,
      firma: undefined,
      pagina: undefined,
    })
    expect(validateProgrammeSearch({ legatura: 'constructor' }).legatura).toBe(
      undefined,
    )
  })

  it('reads a number typed in the search field as words', () => {
    expect(validateProgrammeSearch({ q: 12519 }).q).toBe('12519')
  })
})
