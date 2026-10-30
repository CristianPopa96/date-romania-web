import { describe, expect, it } from 'vitest'

import {
  pnrrFilter,
  progressBand,
  validatePnrrListSearch,
  validatePnrrMeasureSearch,
} from '#/features/pnrr/list'

describe('the address of a list of PNRR contracts', () => {
  it('keeps the measures, statuses and progress it understands', () => {
    expect(
      validatePnrrListSearch({
        masura: 'C10.I3,c15.i9',
        stare: 'sub-30,finalizat',
        progres_min: '50',
        progres_max: 120,
        ordine: 'progres-cresc',
      }),
    ).toMatchObject({
      masura: 'c10.i3,c15.i9',
      stare: 'sub-30,finalizat',
      progres_min: 50,
      progres_max: undefined,
      ordine: 'progres-cresc',
    })
    // A state of another list is not one of a contract's.
    expect(validatePnrrListSearch({ stare: '7' }).stare).toBeUndefined()
    expect(validatePnrrListSearch({ stare: 'reziliat' }).stare).toBeUndefined()
  })

  const measure = { measure: 'C10.I3', counties: ['GORJ'] }

  it('asks the API in fractions and its own measure codes', () => {
    expect(
      pnrrFilter(measure, {
        stare: 'finalizat',
        progres_min: 50,
        progres_max: 75,
      }),
    ).toMatchObject({
      measure: ['C10.I3'],
      status: ['finished'],
      progress_min: 0.5,
      progress_max: 0.75,
    })
  })

  it('never sends a one-letter search, which other lists keep in the address', () => {
    expect(pnrrFilter(measure, { q: 'a' }).q).toBeUndefined()
    expect(pnrrFilter(measure, { q: 'ab' }).q).toBe('ab')
  })

  it('knows the band of a progress range, or none', () => {
    expect(progressBand({ progres_min: 50, progres_max: 75 })).toBe(2)
    expect(progressBand({ progres_min: 100 })).toBe(4)
    expect(progressBand({ progres_min: 50 })).toBe(-1)
  })
})

describe("the address of a measure's list of PNRR contracts", () => {
  const measure = { measure: 'C10.I3', counties: ['GORJ', 'MUREȘ'] }

  it('reads a county and a beneficiary, never measures', () => {
    expect(
      validatePnrrMeasureSearch({
        judet: 'mures',
        beneficiar: '4981310',
        masura: 'c15.i9',
        stare: 'finalizat',
      }),
    ).toMatchObject({
      judet: 'mures',
      beneficiar: 4981310,
      masura: undefined,
      stare: 'finalizat',
    })
    expect(validatePnrrMeasureSearch({ judet: '../x' }).judet).toBeUndefined()
  })

  it("asks for the measure, and a county in the dashboard's spelling", () => {
    expect(
      pnrrFilter(measure, { judet: 'mures', beneficiar: 4981310 }),
    ).toMatchObject({
      measure: ['C10.I3'],
      county: 'MUREȘ',
      beneficiary: 4981310,
    })
    // A county the measure has no contract in is not asked for.
    expect(pnrrFilter(measure, { judet: 'vaslui' }).county).toBeUndefined()
  })
})
