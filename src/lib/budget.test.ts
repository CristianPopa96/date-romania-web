import { describe, expect, it } from 'vitest'

import type { InstitutionBudget } from '#/lib/api-budget'
import { chapterRows, gapEnds, paidAs, revenueRows } from '#/lib/budget'

const source = {
  publisher: 'data.gov.ro',
  record: null,
  url: null,
  fetched_at: null,
  document_id: null,
  sha256: null,
  parser_version: null,
  documents: null,
}

const budget: InstitutionBudget['budget'] = {
  year: 2024,
  executed_on: '2024-12-31',
  revenue: 100,
  revenue_lines: [
    { line: 'state_subsidies', amount: 60 },
    { line: 'income_tax', amount: 30 },
    { line: 'other', amount: 0 },
    { line: 'own_revenue', amount: 10 },
  ],
  spending: 90,
  capital: 40,
  chapters: [
    { chapter: 'transport', amount: 50 },
    { chapter: 'education', amount: 40 },
  ],
  source,
}

const townHall: InstitutionBudget = {
  place: { siruta: 84914, name: 'ŢÂNŢĂRENI', kind: 'commune' },
  funder: null,
  budget,
  programme_payments: {
    county: 'GORJ',
    town_hall: 'ȚÂNȚĂRENI',
    amount: 5,
    payments: 3,
    projects: 1,
    first_published: '2026-05-18',
    last_published: '2026-08-27',
    source,
  },
}

describe('revenueRows and chapterRows', () => {
  it('keep the order given and leave out a line with nothing in it', () => {
    expect(revenueRows(budget).map((row) => row.key)).toEqual([
      'state_subsidies',
      'income_tax',
      'own_revenue',
    ])
    expect(chapterRows(budget)).toEqual([
      { key: 'transport', value: 50 },
      { key: 'education', value: 40 },
    ])
  })
})

describe('paidAs', () => {
  it('tells a county council from a town hall', () => {
    expect(paidAs(townHall)).toBe('townHall')
    expect(
      paidAs({
        ...townHall,
        place: { siruta: 79, name: 'JUDEŢUL GORJ', kind: 'county' },
      }),
    ).toBe('county')
  })
})

describe('gapEnds', () => {
  it('holds only the contracts for an institution without a budget', () => {
    expect(gapEnds(null)).toEqual({
      spent: null,
      paid: null,
      periodsDiffer: false,
    })
    expect(
      gapEnds({
        place: null,
        funder: null,
        budget: null,
        programme_payments: null,
      }),
    ).toEqual({ spent: null, paid: null, periodsDiffer: false })
  })

  it('names the periods as soon as a budget or a payment is held', () => {
    const ends = gapEnds(townHall)
    expect(ends.spent).toEqual({ value: 40, year: 2024 })
    expect(ends.paid?.amount).toBe(5)
    expect(ends.periodsDiffer).toBe(true)
  })
})
