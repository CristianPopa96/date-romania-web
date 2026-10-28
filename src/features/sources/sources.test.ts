import { describe, expect, it } from 'vitest'

import { coverage } from '#/features/sources/sources'

const dataset = (full: number, partial = 0) => ({
  first_day: '2026-09-01',
  last_day: '2026-10-10',
  days_collected: full,
  days_partial: partial,
})

describe('coverage', () => {
  it('counts the days of the period, both ends included', () => {
    expect(coverage(dataset(40))).toEqual({
      expected: 40,
      full: 40,
      partial: 0,
      missing: 0,
    })
  })

  it('never says more days were read than the period has', () => {
    expect(coverage(dataset(41, 2))).toEqual({
      expected: 40,
      full: 40,
      partial: 0,
      missing: 0,
    })
  })

  it('tells days read in part from days never read', () => {
    expect(coverage(dataset(36, 3))).toEqual({
      expected: 40,
      full: 36,
      partial: 3,
      missing: 1,
    })
  })

  it('never counts fewer than no days missing', () => {
    // A day outside the latest run of days is collected, and not in the period.
    expect(coverage(dataset(41))?.missing).toBe(0)
  })

  it('says nothing for a source with no day read', () => {
    expect(
      coverage({
        first_day: null,
        last_day: null,
        days_collected: 0,
        days_partial: 0,
      }),
    ).toBeNull()
  })
})
