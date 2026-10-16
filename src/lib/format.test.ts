import { describe, expect, it } from 'vitest'

import { formatFor } from '#/lib/format'

const { count, day, lei, leiExact, leiShort, period, span } = formatFor('ro')

describe('count and lei', () => {
  it('groups thousands with a dot', () => {
    expect(count(293601)).toBe('293.601')
    expect(count(1000)).toBe('1.000')
    expect(count(0)).toBe('0')
  })

  it('writes whole lei, rounding the bani', () => {
    expect(lei(6120000)).toBe('6.120.000 lei')
    expect(lei(1234.56)).toBe('1.235 lei')
    expect(lei(0)).toBe('0 lei')
  })

  it('keeps the bani where asked, and only when there are some', () => {
    expect(leiExact(270119.6)).toBe('270.119,60 lei')
    expect(leiExact(265000)).toBe('265.000 lei')
  })
})

describe('leiShort', () => {
  it('writes billions as "mld." with one decimal and a comma', () => {
    expect(leiShort(1_500_000_000)).toBe('1,5 mld. lei')
    expect(leiShort(2_503_646_282.84)).toBe('2,5 mld. lei')
  })

  it('writes millions as "mil." with one decimal', () => {
    expect(leiShort(48_200_000)).toBe('48,2 mil. lei')
    expect(leiShort(1_000_000)).toBe('1,0 mil. lei')
  })

  it('keeps amounts under a million whole', () => {
    expect(leiShort(999_999)).toBe('999.999 lei')
    expect(leiShort(900_400)).toBe('900.400 lei')
  })
})

describe('day', () => {
  it('writes a day as dd.mm.yyyy', () => {
    expect(day('2026-10-06')).toBe('06.10.2026')
    expect(day('2026-01-01')).toBe('01.01.2026')
  })

  it('shows the Romanian day of a timestamp, not the UTC one', () => {
    // 22:30 UTC is already half past one the next day in Bucharest (summer time).
    expect(day('2026-10-05T22:30:00Z')).toBe('06.10.2026')
    expect(day('2026-10-06T08:15:00+03:00')).toBe('06.10.2026')
    // In winter Bucharest is two hours ahead: 21:30 UTC is still the same day.
    expect(day('2026-12-31T21:30:00Z')).toBe('31.12.2026')
    expect(day('2026-12-31T22:30:00Z')).toBe('01.01.2027')
  })
})

describe('period', () => {
  it('joins the first and last day', () => {
    expect(period('2026-09-01', '2026-10-09')).toBe('01.09.2026 – 09.10.2026')
  })

  it('writes a single day once', () => {
    expect(period('2026-10-06', '2026-10-06')).toBe('06.10.2026')
  })

  it('is null when a day is missing, so the page can say "Nepublicat"', () => {
    expect(period(null, '2026-10-06')).toBeNull()
    expect(period('2026-10-06', null)).toBeNull()
  })
})

describe('span', () => {
  it('drops the year of the first day when it is the year of the last', () => {
    expect(span('2026-09-01', '2026-10-10')).toEqual({
      from: '01.09',
      to: '10.10.2026',
    })
  })

  it('keeps both years when the period crosses a new year', () => {
    expect(span('2025-12-20', '2026-01-05')).toEqual({
      from: '20.12.2025',
      to: '05.01.2026',
    })
  })

  it('is nothing until both ends are known', () => {
    expect(span(null, '2026-10-10')).toBeNull()
    expect(span('2026-09-01', null)).toBeNull()
  })
})
