import { describe, expect, it } from 'vitest'

import { checkReport, sitePath } from '#/lib/reports'

describe('checkReport', () => {
  it('trims the text and leaves out what was not filled in', () => {
    expect(
      checkReport({
        page: ' /contracte/9001 ',
        message: '  Valoarea include TVA.  ',
        evidence: ' ',
      }),
    ).toEqual({
      report: {
        page: '/contracte/9001',
        message: 'Valoarea include TVA.',
        evidence: undefined,
      },
    })
  })

  it('asks for more than a word or two', () => {
    expect(
      checkReport({ page: '', message: ' greșit ', evidence: '' }),
    ).toEqual({ problem: 'tooShort' })
  })

  it('refuses a text longer than the API takes', () => {
    expect(
      checkReport({ page: '', message: 'x'.repeat(4001), evidence: '' }),
    ).toEqual({ problem: 'tooLong' })
  })
})

describe('sitePath', () => {
  it('keeps an address inside the site', () => {
    expect(sitePath('/contracte/9001')).toBe('/contracte/9001')
    expect(sitePath('/institutii/4981310?lista=achizitii')).toBe(
      '/institutii/4981310?lista=achizitii',
    )
  })

  it('drops anything that could lead elsewhere', () => {
    expect(sitePath('https://example.test/')).toBeUndefined()
    expect(sitePath('//example.test/')).toBeUndefined()
    expect(sitePath('/\\example.test')).toBeUndefined()
    expect(sitePath('javascript:alert(1)')).toBeUndefined()
    expect(sitePath('/a b')).toBeUndefined()
    expect(sitePath(7)).toBeUndefined()
    expect(sitePath('/' + 'a'.repeat(300))).toBeUndefined()
  })
})
