import { describe, expect, it } from 'vitest'

import {
  amountFromText,
  choiceFromParam,
  choiceToParam,
  dayFromParam,
  fillSteps,
  isOpen,
  marks,
  monthOf,
  nextSort,
  pageItems,
  pageRange,
  pageSizeFromParam,
  periodPresets,
  periodYear,
  sortFromParam,
  sortToParam,
  ticks,
} from '#/lib/list'

const COLUMNS = { data: {}, valoare: {}, furnizor: { text: true } }

describe('nextSort', () => {
  it('goes descending, ascending, then back to the list order', () => {
    const first = nextSort(null, 'valoare')
    expect(first).toEqual({ column: 'valoare', dir: 'desc' })
    const second = nextSort(first, 'valoare')
    expect(second).toEqual({ column: 'valoare', dir: 'asc' })
    expect(nextSort(second, 'valoare')).toBeNull()
  })

  it('sorts text A to Z first, and starts over on another column', () => {
    expect(nextSort(null, 'furnizor', true)).toEqual({
      column: 'furnizor',
      dir: 'asc',
    })
    expect(nextSort({ column: 'valoare', dir: 'asc' }, 'data')).toEqual({
      column: 'data',
      dir: 'desc',
    })
  })
})

describe('the sort in an address', () => {
  it('names the column and its direction', () => {
    expect(sortToParam({ column: 'valoare', dir: 'desc' }, COLUMNS)).toBe(
      'valoare-desc',
    )
    expect(sortToParam({ column: 'valoare', dir: 'asc' }, COLUMNS)).toBe(
      'valoare-cresc',
    )
    expect(sortToParam({ column: 'furnizor', dir: 'asc' }, COLUMNS)).toBe(
      'furnizor-cresc',
    )
    expect(
      sortToParam({ column: 'nimic', dir: 'asc' }, COLUMNS),
    ).toBeUndefined()
    expect(sortToParam({ column: 'furnizor', dir: 'desc' }, COLUMNS)).toBe(
      'furnizor-desc',
    )
  })

  it('reads back what it wrote, and nothing else', () => {
    expect(sortFromParam('valoare', COLUMNS)).toEqual({
      column: 'valoare',
      dir: 'desc',
    })
    expect(sortFromParam('valoare-cresc', COLUMNS)).toEqual({
      column: 'valoare',
      dir: 'asc',
    })
    expect(sortFromParam('furnizor', COLUMNS)).toEqual({
      column: 'furnizor',
      dir: 'asc',
    })
    expect(sortFromParam('pret', COLUMNS)).toBeNull()
    expect(sortFromParam('valoare-sus', COLUMNS)).toBeNull()
    expect(sortFromParam(7, COLUMNS)).toBeNull()
  })
})

describe('the pager', () => {
  it('shows the first, the last and two pages around the current one', () => {
    expect(pageItems(6, 20)).toEqual([1, null, 4, 5, 6, 7, 8, null, 20])
    expect(pageItems(1, 3)).toEqual([1, 2, 3])
    expect(pageItems(2, 9)).toEqual([1, 2, 3, 4, null, 9])
    expect(pageItems(1, 1)).toEqual([1])
  })

  it('says which rows a page shows', () => {
    expect(pageRange(1, 25, 46)).toEqual({ first: 1, last: 25 })
    expect(pageRange(2, 25, 46)).toEqual({ first: 26, last: 46 })
    expect(pageRange(1, 25, 0)).toEqual({ first: 0, last: 0 })
  })

  it('keeps 25 rows out of the address, and only the sizes offered', () => {
    expect(pageSizeFromParam(50)).toBe(50)
    expect(pageSizeFromParam('100')).toBe(100)
    expect(pageSizeFromParam(25)).toBeUndefined()
    expect(pageSizeFromParam(30)).toBeUndefined()
  })
})

describe('periods', () => {
  it('counts the presets back from the newest day held', () => {
    const presets = periodPresets('2025-03-01', '2026-10-27')
    expect(presets.map((p) => p.key + (p.year ?? ''))).toEqual([
      'last30',
      'lastMonth',
      'year2026',
      'year2025',
      'all',
    ])
    expect(presets[0].period).toEqual({ from: '2026-09-28', to: '2026-10-27' })
    expect(presets[1].period).toEqual({ from: '2026-09-01', to: '2026-09-30' })
    expect(presets.at(-1)?.period).toEqual({})
  })

  it('says a whole year as the year', () => {
    expect(periodYear({ from: '2026-01-01', to: '2026-12-31' })).toBe(2026)
    expect(periodYear({ from: '2026-01-02', to: '2026-12-31' })).toBeNull()
    expect(periodYear({ from: '2026-01-01' })).toBeNull()
  })

  it('knows the days of a month, February too', () => {
    expect(monthOf('2028-02-10')).toEqual({
      from: '2028-02-01',
      to: '2028-02-29',
    })
  })
})

describe('charts', () => {
  it('fills the months and days that have nothing', () => {
    const filled = fillSteps(
      [
        { start: '2026-01-01', value: 3 },
        { start: '2026-04-01', value: 5 },
      ],
      'month',
      (start) => ({ start, value: 0 }),
    )
    expect(filled.map((p) => [p.start, p.value])).toEqual([
      ['2026-01-01', 3],
      ['2026-02-01', 0],
      ['2026-03-01', 0],
      ['2026-04-01', 5],
    ])
    expect(fillSteps([], 'day', (start) => ({ start }))).toEqual([])
  })

  it('outlines a month not over on the newest day held', () => {
    expect(isOpen('2026-10-01', 'month', '2026-10-27')).toBe(true)
    expect(isOpen('2026-09-01', 'month', '2026-10-27')).toBe(false)
    expect(isOpen('2026-10-31', 'month', '2026-10-31')).toBe(false)
    expect(isOpen('2026-10-27', 'day', '2026-10-27')).toBe(false)
    expect(isOpen('2026-10-01', 'month', null)).toBe(false)
  })

  it('puts at most three round ticks on the axis', () => {
    expect(ticks(3_491_601)).toEqual([0, 2_000_000])
    expect(ticks(580_000)).toEqual([0, 500_000])
    expect(ticks(1_000)).toEqual([0, 500, 1_000])
    expect(ticks(0)).toEqual([0])
  })
})

describe('the search words', () => {
  it('are marked whatever their case and diacritics', () => {
    expect(
      marks('Lucrări reparații acoperiș școală', 'acoperis SCOALA'),
    ).toEqual([
      { text: 'Lucrări reparații ', mark: false },
      { text: 'acoperiș', mark: true },
      { text: ' ', mark: false },
      { text: 'școală', mark: true },
    ])
    expect(marks('Hârtie', undefined)).toEqual([
      { text: 'Hârtie', mark: false },
    ])
  })
})

describe('choices in an address', () => {
  it('reads numbers once each, as text or as a number', () => {
    expect(choiceFromParam('7,3,7')).toEqual([7, 3])
    expect(choiceFromParam(7)).toEqual([7])
    expect(choiceFromParam('7,a')).toBeUndefined()
    expect(choiceFromParam('')).toBeUndefined()
  })

  it('writes one value as a number, so the router never quotes it', () => {
    expect(choiceToParam([7])).toBe(7)
    expect(choiceToParam([7, 3])).toBe('7,3')
    expect(choiceToParam([])).toBeUndefined()
  })
})

describe('a day in an address', () => {
  it('keeps a real day only', () => {
    expect(dayFromParam('2026-02-28')).toBe('2026-02-28')
    expect(dayFromParam('2028-02-29')).toBe('2028-02-29')
    expect(dayFromParam('2026-02-31')).toBeUndefined()
    expect(dayFromParam('2026-13-01')).toBeUndefined()
    expect(dayFromParam('2026-2-1')).toBeUndefined()
  })
})

describe('an amount typed in lei', () => {
  it('reads whole lei, never decimals as more digits', () => {
    expect(amountFromText('1500')).toBe(1500)
    expect(amountFromText('1.500')).toBe(1500)
    expect(amountFromText(' 1 500 ')).toBe(1500)
    expect(amountFromText('1500,50')).toBe(1500)
    expect(amountFromText('1500.50')).toBe(1500)
    expect(amountFromText('1.500.000,9')).toBe(1500000)
    expect(amountFromText('abc')).toBeUndefined()
    expect(amountFromText('')).toBeUndefined()
  })
})
