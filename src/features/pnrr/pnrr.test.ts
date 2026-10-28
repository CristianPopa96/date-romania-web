import { describe, expect, it } from 'vitest'

import type {
  PnrrContract,
  PnrrMeasureRow,
  PnrrPayments,
} from '#/features/pnrr/api'
import {
  byComponent,
  countyBySlug,
  countySlug,
  measureBySlug,
  measureLabel,
  measureShort,
  measureSlug,
  paidShare,
  paidSoFar,
  paymentsCase,
} from '#/features/pnrr/pnrr'

const measure = (code: string, component: string): PnrrMeasureRow => ({
  code,
  component,
  name: null,
  ministry: null,
  funding: null,
  allocated_eur: null,
  contracted_ron: null,
  paid_ron: null,
  paid_eur: null,
  contracts: 0,
})

const payments = (patch: Partial<PnrrPayments>): PnrrPayments => ({
  measure: 'C10.I3',
  contracts: 1,
  paid: 0,
  count: 0,
  first_day: null,
  last_day: null,
  items: [],
  others: [],
  ...patch,
})

describe('a measure', () => {
  it('is addressed by its code in lower case and found back with its own case', () => {
    expect(measureSlug('C5.I1.a')).toBe('c5.i1.a')
    const list = [measure('C10.I3', 'C10'), measure('C5.I1.a', 'C5')]
    expect(measureBySlug(list, 'c5.i1.a')?.code).toBe('C5.I1.a')
    expect(measureBySlug(list, 'c99.i1')).toBeNull()
  })

  it('is named by the start of its name, or by its code', () => {
    expect(measureShort('C10.I3', 'Investiția 3. Renovarea energetică')).toBe(
      'Investiția 3',
    )
    expect(measureShort('C8.R1', 'Reforma 1. Reforma sistemului fiscal')).toBe(
      'Reforma 1',
    )
    expect(measureShort('C10.I3', null)).toBe('I3')
    expect(measureLabel('C10.I3', 'Investiția 3. Renovare')).toBe(
      'C10 · Investiția 3',
    )
  })

  it('groups by component in the plan order', () => {
    const groups = byComponent([
      measure('C10.I3', 'C10'),
      measure('C2.I1', 'C2'),
      measure('C10.I1', 'C10'),
    ])
    expect(groups.map((g) => g.component)).toEqual(['C2', 'C10'])
    expect(groups[1].measures.map((m) => m.code)).toEqual(['C10.I3', 'C10.I1'])
  })

  it('has a paid share only when both sums are known', () => {
    expect(paidShare(180, 500)).toBeCloseTo(0.36)
    expect(paidShare(null, 500)).toBeNull()
    expect(paidShare(0, 500)).toBe(0)
    expect(paidShare(10, 0)).toBeNull()
  })
})

describe("a contract's payments", () => {
  it('are its own, belong to several contracts, or are none', () => {
    expect(paymentsCase(payments({ count: 3, paid: 100 }))).toBe('own')
    expect(paymentsCase(payments({ contracts: 2, count: 3, paid: 100 }))).toBe(
      'several',
    )
    expect(paymentsCase(payments({}))).toBe('none')
  })

  it('are added up over its measures only when none is shared', () => {
    const contract = {
      payments: [
        payments({
          measure: 'C15.I11',
          count: 1,
          paid: 612245,
          last_day: '2026-05-05',
        }),
        payments({ measure: 'C15.I9' }),
      ],
    } as PnrrContract
    expect(paidSoFar(contract)).toEqual({
      amount: 612245,
      count: 1,
      lastDay: '2026-05-05',
    })
    const shared = {
      payments: [payments({ contracts: 2, count: 2, paid: 1800000 })],
    } as PnrrContract
    expect(paidSoFar(shared)).toBeNull()
  })
})

describe('a county in the address', () => {
  it('is the dashboard spelling without its marks', () => {
    expect(countySlug('MUREȘ')).toBe('mures')
    expect(countySlug('MUNICIPIUL BUCUREŞTI')).toBe('municipiul-bucuresti')
    expect(countyBySlug(['GORJ', 'MUREȘ'], 'mures')).toBe('MUREȘ')
    expect(countyBySlug(['GORJ'], 'cluj')).toBeUndefined()
  })
})
