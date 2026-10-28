import { describe, expect, it } from 'vitest'

import { messagesFor } from '#/i18n'
import { formatFor } from '#/lib/format'
import { periodChip, rangeChip } from '#/features/purchases/filters'
import {
  PURCHASE_BY_API_PARAM,
  PURCHASE_FILTER_PARAMS,
  purchaseApiSort,
  purchaseFileSearch,
  purchaseFilter,
  validatePurchaseListSearch,
} from '#/features/purchases/list'
import { chosenFilters, emptyHint, withoutFilters } from '#/lib/list'

const t = messagesFor('ro')
const f = formatFor('ro')

describe('the address of a list of direct purchases', () => {
  it('keeps every filter it understands, and only those', () => {
    expect(
      validatePurchaseListSearch({
        q: '  hartie  ',
        de_la: '2026-01-01',
        pana_la: '2026-13',
        stare: '7,3',
        tip: 'x',
        valoare_min: 50000,
        valoare_max: '270120',
        furnizor: 17886786,
        cpv: 4523,
        ordine: 'valoare-cresc',
        pe_pagina: 50,
        vedere: 'tabel',
      }),
    ).toEqual({
      q: 'hartie',
      de_la: '2026-01-01',
      stare: '7,3',
      valoare_min: 50000,
      valoare_max: 270120,
      furnizor: 17886786,
      cpv: '4523',
      ordine: 'valoare-cresc',
      pe_pagina: 50,
      vedere: 'tabel',
    })
  })

  it('leaves out the order the list has anyway, and reads the old "valoare"', () => {
    expect(
      validatePurchaseListSearch({ ordine: 'data' }).ordine,
    ).toBeUndefined()
    expect(validatePurchaseListSearch({ ordine: 'valoare' }).ordine).toBe(
      'valoare',
    )
    expect(
      validatePurchaseListSearch({ ordine: 'recente' }).ordine,
    ).toBeUndefined()
  })

  it('asks the API in its own words, for the party of the page', () => {
    const search = validatePurchaseListSearch({
      stare: '7',
      furnizor: 5,
      institutie: 9,
    })
    expect(purchaseFilter('institutions', 4305857, search)).toMatchObject({
      buyer: 4305857,
      supplier: 5,
      state: [7],
    })
    // The other side's filter does not belong to this page.
    expect(purchaseFilter('suppliers', 5, search)).toMatchObject({
      supplier: 5,
      buyer: 9,
    })
    expect(purchaseApiSort({ ordine: 'furnizor-desc' })).toEqual({
      sort: 'supplier',
      order: 'desc',
    })
    expect(purchaseApiSort({})).toEqual({ sort: 'date', order: 'desc' })
  })

  it('removes one filter, or all, and names a filter from an API parameter', () => {
    const search = {
      q: 'a',
      de_la: '2026-01-01',
      pana_la: '2026-02-01',
      stare: '7',
    }
    const params = PURCHASE_FILTER_PARAMS
    expect(chosenFilters(params, search)).toEqual(['q', 'perioada', 'stare'])
    expect(withoutFilters(params, search, ['perioada'])).toEqual({
      q: 'a',
      stare: '7',
      pagina: undefined,
    })
    expect(
      withoutFilters(params, { ...search, ordine: 'valoare', pagina: 3 }),
    ).toEqual({ ordine: 'valoare', pagina: undefined })
    // The first filter that alone keeps rows out; parameters it does not know are skipped.
    expect(
      emptyHint(
        [
          { param: 'scope', count: 9 },
          { param: 'state', count: 0 },
          { param: 'value_min', count: 12 },
        ],
        PURCHASE_BY_API_PARAM,
      ),
    ).toEqual({ key: 'valoare', count: 12 })
    expect(emptyHint([{ param: 'q', count: 0 }], PURCHASE_BY_API_PARAM)).toBe(
      null,
    )
  })

  it('gives the file the filters and the order, never the page size or the view', () => {
    expect(
      purchaseFileSearch('suppliers', 5, {
        stare: '7',
        ordine: 'valoare',
        pe_pagina: 50,
        vedere: 'tabel',
      }),
    ).toEqual({ vanzator: '5', stare: '7', ordine: 'valoare' })
  })
})

describe('the chips of a chosen filter', () => {
  it('say a period as a year, as two days, or as one end', () => {
    expect(periodChip({ from: '2026-01-01', to: '2026-12-31' }, t, f)).toBe(
      '2026',
    )
    expect(periodChip({ from: '2026-03-01', to: '2026-06-30' }, t, f)).toBe(
      '01.03–30.06.2026',
    )
    expect(periodChip({ from: '2026-03-01' }, t, f)).toBe('de la 01.03.2026')
    expect(periodChip({}, t, f)).toBeNull()
  })

  it('say a value range in lei', () => {
    expect(rangeChip(50000, 270120, t, f)).toBe('50.000–270.120 lei')
    expect(rangeChip(100000, undefined, t, f)).toBe('de la 100.000 lei')
    expect(rangeChip(undefined, 10000, t, f)).toBe('sub 10.000 lei')
    expect(rangeChip(undefined, undefined, t, f)).toBeNull()
  })
})
