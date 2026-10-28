import { describe, expect, it } from 'vitest'

import {
  pnrrFilter,
  progressBand,
  validatePnrrListSearch,
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

  it('asks the API in fractions and its own measure codes', () => {
    expect(
      pnrrFilter(4981310, {
        masura: 'c10.i3',
        stare: 'finalizat',
        progres_min: 50,
        progres_max: 75,
      }),
    ).toMatchObject({
      beneficiary: 4981310,
      measure: ['C10.I3'],
      status: ['finished'],
      progress_min: 0.5,
      progress_max: 0.75,
    })
  })

  it('knows the band of a progress range, or none', () => {
    expect(progressBand({ progres_min: 50, progres_max: 75 })).toBe(2)
    expect(progressBand({ progres_min: 100 })).toBe(4)
    expect(progressBand({ progres_min: 50 })).toBe(-1)
  })
})
