import { describe, expect, it } from 'vitest'

import {
  matchesFromParam,
  projectFilter,
  validateProjectListSearch,
  worksSlug,
} from '#/features/programme/list'

describe('the address of the list of projects', () => {
  it('keeps what the programme page understands', () => {
    expect(
      validateProjectListSearch({
        judet: 'bistrita-nasaud',
        q: ' drum ',
        legatura: 'mai-multe',
        firma: 17886786,
        pagina: 3,
      }),
    ).toMatchObject({
      judet: 'bistrita-nasaud',
      q: 'drum',
      legatura: 'mai-multe',
      firma: 17886786,
      pagina: 3,
    })
  })

  it('drops what it does not', () => {
    expect(
      validateProjectListSearch({
        judet: 'GORJ; drop',
        q: 'a',
        legatura: 'toString',
        firma: 0,
        pagina: 1,
        ordine: 'platit',
      }),
    ).toMatchObject({
      judet: undefined,
      q: undefined,
      legatura: undefined,
      firma: undefined,
      pagina: undefined,
      // The list's own order stays out of the address.
      ordine: undefined,
    })
    expect(matchesFromParam('mai-multe,constructor')).toBeUndefined()
  })

  it('keeps several match states, in the order of the states', () => {
    expect(
      validateProjectListSearch({ legatura: 'fara-cui,mai-multe' }).legatura,
    ).toBe('mai-multe,fara-cui')
  })

  it('reads a number typed in the search field as words', () => {
    expect(String(validateProjectListSearch({ q: 12519 }).q)).toBe('12519')
  })
})

describe('what the list asks the API', () => {
  const categories = [
    'Drumurile publice',
    'Drumurile publice + Poduri, podețe, pasaje sau punți pietonale',
  ]

  it('names a kind of works by its slug, and a county by its key', () => {
    expect(worksSlug(categories[1])).toBe(
      'drumurile-publice-poduri-podete-pasaje-sau-punti-pietonale',
    )
    expect(
      projectFilter(
        { judet: 'bistrita-nasaud', lucrari: 'drumurile-publice' },
        categories,
      ),
    ).toMatchObject({
      county: 'BISTRITA NASAUD',
      category: ['Drumurile publice'],
    })
    // A slug the programme does not have filters nothing.
    expect(projectFilter({ lucrari: 'altceva' }, categories).category).toBe(
      undefined,
    )
  })
})
