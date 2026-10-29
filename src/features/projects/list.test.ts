import { describe, expect, it } from 'vitest'

import {
  kindParam,
  projectFilter,
  projectsCsvPath,
  validateProjectListSearch,
} from '#/features/projects/list'
import { countyCodeOfSlug, countySlugOfCode, plainSlug } from '#/lib/counties'

describe('validateProjectListSearch', () => {
  it('keeps the words it knows, in their own order', () => {
    expect(
      validateProjectListSearch({
        program: 'fonduri-europene,anghel-saligny',
        judet: 'bistrita-nasaud',
        stare: 'finalizat,in-implementare',
        drum: 'firme,plati',
        beneficiar: '4981310',
        valoare_min: '1000000',
        pagina: '2',
      }),
    ).toEqual({
      program: 'anghel-saligny,fonduri-europene',
      judet: 'bistrita-nasaud',
      stare: 'in-implementare,finalizat',
      drum: 'plati,firme',
      beneficiar: 4981310,
      valoare_min: 1000000,
      pagina: 2,
    })
  })

  it('drops a word it does not know, and words an object happens to have', () => {
    const search = validateProjectListSearch({
      program: 'pnrr,altceva',
      judet: 'atlantida',
      stare: 'toString',
      drum: 'constructor',
      beneficiar: 'abc',
    })
    expect(search.program).toBeUndefined()
    expect(search.judet).toBeUndefined()
    expect(search.stare).toBeUndefined()
    expect(search.drum).toBeUndefined()
    expect(search.beneficiar).toBeUndefined()
  })

  it('keeps the default order out of the address, and reads one letter as no words', () => {
    expect(
      validateProjectListSearch({ ordine: 'valoare-desc', q: 'a' }),
    ).toEqual({})
    expect(validateProjectListSearch({ ordine: 'valoare-cresc' }).ordine).toBe(
      'valoare-cresc',
    )
  })
})

describe('projectFilter', () => {
  it('asks the API in its own words', () => {
    expect(
      projectFilter({
        program: 'pnrr',
        judet: 'gorj',
        stare: 'reziliat',
        drum: 'firme',
        q: 'scoala',
      }),
    ).toEqual({
      kind: ['pnrr'],
      county: 'GJ',
      beneficiary: undefined,
      status: ['terminated'],
      reach: ['companies'],
      q: 'scoala',
      value_min: undefined,
      value_max: undefined,
    })
  })

  it('keeps a programme page to its programme whatever the address says', () => {
    expect(projectFilter({ program: 'pnrr' }, 'anghel_saligny').kind).toEqual([
      'anghel_saligny',
    ])
  })
})

describe('projectsCsvPath', () => {
  it('carries the filters and the order, never the page', () => {
    expect(
      projectsCsvPath({ judet: 'gorj', pagina: 3, vedere: 'tabel' }, 'pnrr'),
    ).toBe('/proiecte.csv?judet=gorj&program=pnrr')
    expect(projectsCsvPath({})).toBe('/proiecte.csv')
  })
})

describe('kindParam', () => {
  it('names a programme the way a project address does', () => {
    expect(kindParam('cohesion')).toBe('fonduri-europene')
    expect(kindParam('anghel_saligny')).toBe('anghel-saligny')
  })
})

describe('counties', () => {
  it('goes from a code to the address and back', () => {
    expect(countySlugOfCode('BN')).toBe('bistrita-nasaud')
    expect(countySlugOfCode('B')).toBe('bucuresti')
    expect(countyCodeOfSlug('bistrita-nasaud')).toBe('BN')
    expect(countyCodeOfSlug('toString')).toBeUndefined()
    expect(countySlugOfCode('toString')).toBeUndefined()
    expect(plainSlug('Caraș-Severin')).toBe('caras-severin')
  })
})
