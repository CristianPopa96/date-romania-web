import { describe, expect, it } from 'vitest'

import type { Check, CheckFigure } from '#/features/national/api'
import {
  checkPeriod,
  differenceCell,
  localWidth,
  monthOf,
  oursCell,
  periodText,
} from '#/features/national/national'
import { formatFor } from '#/lib/format'

const f = formatFor('ro')
const span = (from: string, to: string) => `${from}–${to}`

const figure = (more: Partial<CheckFigure> = {}): CheckFigure => ({
  amount: 100,
  count: null,
  unit: 'lei',
  period_start: '2024-01-01',
  period_end: '2024-12-31',
  collected: true,
  source: null,
  ...more,
})

const check = (more: Partial<Check> = {}): Check => ({
  key: 'local_budgets',
  official: figure(),
  ours: figure({ amount: 90 }),
  state: 'comparable',
  difference: -10,
  difference_share: -0.1,
  paid_share: null,
  reason: 'local_scope',
  parts: [],
  ...more,
})

describe('periods', () => {
  it('writes a whole calendar year as the year alone', () => {
    expect(periodText(f, '2024-01-01', '2024-12-31', span)).toBe('2024')
  })

  it('writes part of a year from its first day to its last', () => {
    expect(periodText(f, '2026-01-01', '2026-09-30', span)).toBe(
      '01.01–30.09.2026',
    )
  })

  it('has no period without both ends', () => {
    expect(periodText(f, null, '2026-09-30', span)).toBeNull()
  })

  it('names the month an execution reaches', () => {
    expect(monthOf(f, '2024-12-31')).toBe('decembrie 2024')
  })

  it('takes the official period for the column', () => {
    expect(checkPeriod(f, check(), span)).toBe('2024')
  })
})

describe('the difference cell', () => {
  it('gives ours minus official and its share only when they compare', () => {
    expect(differenceCell(check())).toEqual({
      kind: 'difference',
      amount: -10,
      share: -0.1,
    })
  })

  it('gives a plan against its payments as a share', () => {
    const plan = check({
      difference: null,
      difference_share: null,
      paid_share: 0.47,
    })
    expect(differenceCell(plan)).toEqual({
      kind: 'paid',
      share: 0.47,
      over: false,
    })
  })

  it('marks payments that pass the credits, and keeps the share as it is', () => {
    const plan = check({ difference: null, paid_share: 1.04 })
    expect(differenceCell(plan)).toEqual({
      kind: 'paid',
      share: 1.04,
      over: true,
    })
  })

  it('never compares two different measures, whatever figures they hold', () => {
    expect(differenceCell(check({ state: 'different_measures' }))).toEqual({
      kind: 'differentMeasures',
    })
  })

  it('says a check does not compare yet, whatever figures it holds', () => {
    expect(differenceCell(check({ state: 'not_yet' }))).toEqual({
      kind: 'notYet',
    })
  })
})

describe('our side of a check', () => {
  it('writes a count in its own unit', () => {
    expect(
      oursCell(figure({ amount: null, count: 21710, unit: 'contracts' })),
    ).toEqual({
      kind: 'count',
      count: 21710,
    })
  })

  it('shows the state of a figure not collected, never a zero', () => {
    expect(oursCell(figure({ amount: null, collected: false }))).toEqual({
      kind: 'notCollected',
    })
  })

  it('writes an amount', () => {
    expect(oursCell(figure())).toEqual({ kind: 'amount', amount: 100 })
  })
})

describe('the local share of a division', () => {
  it('is a width between none and the whole bar', () => {
    expect(localWidth(0.3)).toBe('30%')
    expect(localWidth(1.2)).toBe('100%')
    expect(localWidth(-0.1)).toBe('0%')
  })
})
