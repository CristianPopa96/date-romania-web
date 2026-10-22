import { describe, expect, it } from 'vitest'

import { DEFAULT_LOCALE, LOCALES, messagesFor, resolveLocale } from '#/i18n'
import { rich } from '#/i18n/rich'

const t = messagesFor('ro')

describe('languages', () => {
  it('serves Romanian by default', () => {
    expect(DEFAULT_LOCALE).toBe('ro')
    expect(resolveLocale()).toBe('ro')
    expect(LOCALES.ro.tag).toBe('ro-RO')
  })
})

describe('rich', () => {
  it('puts a part where the message names it', () => {
    expect(rich('{code} în SEAP', { code: 1 })).toEqual([1, ' în SEAP'])
    expect(rich('CUI {cui}', { cui: 7 })).toEqual(['CUI ', 7])
  })

  it('fills several parts and keeps the text between them', () => {
    expect(rich(t.site.footerCode, { site: 'A', api: 'B' }).join('')).toBe(
      'Codul este public: A și B.',
    )
  })

  it('leaves a name it was not given as text', () => {
    expect(rich('{a} și {b}', { a: 1 })).toEqual([1, ' și ', '{b}'])
  })
})

describe('Romanian counts', () => {
  it('says "un rezultat" for one', () => {
    expect(t.search.found(1, '1', 'cluj')).toBe('Un rezultat pentru „cluj”')
  })

  it('counts plainly up to 19', () => {
    expect(t.search.found(2, '2', 'cluj')).toBe('2 rezultate pentru „cluj”')
    expect(t.search.found(19, '19', 'cluj')).toBe('19 rezultate pentru „cluj”')
  })

  it('adds "de" from 20 up, and drops it again after each hundred', () => {
    expect(t.search.found(20, '20', 'cluj')).toBe(
      '20 de rezultate pentru „cluj”',
    )
    expect(t.partners.accepted(1234, '1.234')).toBe(
      '1.234 de achiziții acceptate',
    )
    expect(t.partners.accepted(105, '105')).toBe('105 achiziții acceptate')
  })

  it('states purchases above the limit as a fact, in singular and plural', () => {
    expect(
      t.notes.aboveLimit(1, '1', '270.120 lei', '900.400 lei', '5.000.000 lei'),
    ).toBe(
      'O achiziție acceptată este publicată în SEAP cu o valoare peste plafonul legal al tipului ei: 270.120 lei pentru produse și servicii, 900.400 lei pentru lucrări. Nu este inclusă în total: 5.000.000 lei. Tipar observat, nu o acuzație.',
    )
    expect(
      t.notes.aboveLimit(
        12,
        '12',
        '270.120 lei',
        '900.400 lei',
        '524.063.649 lei',
      ),
    ).toContain(
      '12 achiziții acceptate sunt publicate în SEAP cu o valoare peste plafonul legal al tipului lor',
    )
    expect(
      t.notes.aboveLimit(
        12,
        '12',
        '270.120 lei',
        '900.400 lei',
        '524.063.649 lei',
      ),
    ).toContain('Nu sunt incluse în total: 524.063.649 lei.')
  })
})
