import { describe, expect, it } from 'vitest'

import type { NearLimitPattern } from '#/features/patterns/api'
import {
  cpvDivisionLabel,
  ruleLimits,
  shareOfLimit,
} from '#/features/patterns/near-limit'

describe('cpvDivisionLabel', () => {
  it('puts SEAP name after the code, and the code alone without one', () => {
    expect(
      cpvDivisionLabel('45', { code: '45', name: 'Lucrari de constructii' }),
    ).toBe('45 · Lucrari de constructii')
    expect(cpvDivisionLabel('30', { code: '30', name: null })).toBe('30')
    expect(cpvDivisionLabel('4523')).toBe('4523')
  })
})

describe('shareOfLimit', () => {
  it('is the value over the limit', () => {
    expect(shareOfLimit(265000, 270120)).toBe(0.981)
    // 99.96 % stays under 100 %.
    expect(shareOfLimit(270000, 270120)).toBe(0.999)
    // Exactly 90.2 %, which dividing first floors to 90.1 %.
    expect(shareOfLimit(243648.24, 270120)).toBe(0.902)
    expect(shareOfLimit(1, 0)).toBe(0)
  })
})

describe('ruleLimits', () => {
  it('reads the limits of goods and works from the rule', () => {
    const pattern = {
      rule: {
        share: 0.9,
        repeats: 2,
        limits: { '1': 270120, '2': 270120, '3': 900400 },
      },
    } as unknown as NearLimitPattern
    expect(ruleLimits(pattern)).toEqual({ goods: 270120, works: 900400 })
  })
})
