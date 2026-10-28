import { describe, expect, it } from 'vitest'

import type { PlaceFigures } from '#/features/places/api'
import {
  countyShares,
  placeLink,
  topRevenue,
  validateLocalitySearch,
  villageOf,
} from '#/features/places/places'

const albac = {
  siruta: 2130,
  name: 'Comuna Albac',
  kind: 'commune' as const,
  slug: 'comuna-albac',
  county_slug: 'alba',
  county: 'Alba',
}

describe('placeLink', () => {
  it('addresses a county by its slug and a UAT under its county', () => {
    expect(placeLink(albac)).toEqual({
      to: '/localitati/$judet/$uat',
      params: { judet: 'alba', uat: 'comuna-albac' },
    })
    expect(
      placeLink({ ...albac, kind: 'county', slug: 'alba', name: 'Alba' }),
    ).toEqual({ to: '/localitati/$judet', params: { judet: 'alba' } })
  })
})

describe('countyShares', () => {
  const figures = (value: number, local: number, mixed: number) =>
    ({
      contracts: { value },
      supplier_counties: { county: 'Gorj', local, mixed, elsewhere: 0 },
    }) as PlaceFigures

  it('divides by the contract value of the same period', () => {
    expect(countyShares(figures(200, 50, 20))).toEqual({
      local: 0.25,
      mixed: 0.1,
    })
  })

  it('says nothing when there is no contract', () => {
    expect(countyShares(figures(0, 0, 0))).toBeNull()
  })
})

describe('topRevenue', () => {
  it('keeps the largest lines with money in them', () => {
    const budget = {
      revenue_lines: [
        { line: 'own_revenue', amount: 10 },
        { line: 'state_subsidies', amount: 60 },
        { line: 'other', amount: 0 },
        { line: 'vat', amount: 30 },
      ],
    } as Parameters<typeof topRevenue>[0]
    expect(topRevenue(budget, 2).map((row) => row.line)).toEqual([
      'state_subsidies',
      'vat',
    ])
  })
})

describe('validateLocalitySearch', () => {
  it('keeps a village name and drops anything else', () => {
    expect(validateLocalitySearch({ sat: ' Bărăști ' })).toEqual({
      sat: 'Bărăști',
    })
    expect(validateLocalitySearch({ sat: 'x' })).toEqual({ sat: undefined })
    expect(validateLocalitySearch({ sat: 3 })).toEqual({ sat: undefined })
  })
})

describe('villageOf', () => {
  const localities = ['Țânțăreni', 'Florești']

  it("gives the UAT's own spelling of a village searched for", () => {
    expect(villageOf('floresti', localities)).toBe('Florești')
    expect(villageOf('  FLOREȘTI ', localities)).toBe('Florești')
  })

  it('names nothing the UAT does not have', () => {
    expect(villageOf('Paris', localities)).toBeNull()
    expect(villageOf(undefined, localities)).toBeNull()
  })
})
