import { describe, expect, it } from 'vitest'

import { validateSourcesSearch } from '#/features/sources/urls'

describe('validateSourcesSearch', () => {
  it('keeps a tab it knows and drops anything else', () => {
    expect(validateSourcesSearch({ fila: 'metodologie' }).fila).toBe(
      'metodologie',
    )
    expect(validateSourcesSearch({ fila: 'corecturi' }).fila).toBe('corecturi')
    expect(validateSourcesSearch({ fila: 'surse' }).fila).toBeUndefined()
    expect(validateSourcesSearch({ fila: 7 }).fila).toBeUndefined()
  })

  it('keeps the page a report is about only when it is a page of the site', () => {
    expect(validateSourcesSearch({ despre: '/contracte/9001' })).toEqual({
      fila: undefined,
      despre: '/contracte/9001',
    })
    expect(
      validateSourcesSearch({ despre: 'https://example.test' }).despre,
    ).toBeUndefined()
  })
})
