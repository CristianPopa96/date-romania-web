import { describe, expect, it } from 'vitest'

import type { Contract, Notice, Winner } from '#/lib/api-contracts'
import {
  financing,
  foldWinners,
  isAssociation,
  pageCount,
  publication,
  shownValue,
} from '#/lib/contracts'

const winner = (name: string): Winner => ({
  supplier: null,
  text: name,
  country: null,
})
const five = ['A', 'B', 'C', 'D', 'E'].map(winner)

const notice = (over: Partial<Notice>) =>
  ({ versions: null, detail: null, ...over }) as Notice

const detail = {
  call_notice_no: null,
  call_published_at: null,
  ted_notice_no: null,
  lots: 1,
  eu_funded: null,
  financing_types: [],
  eu_funds: [],
  eu_project: null,
}

describe('foldWinners', () => {
  it('names up to three members and counts the rest', () => {
    expect(foldWinners(five, false)).toEqual({
      shown: five.slice(0, 3),
      hidden: 2,
    })
  })

  it('names everyone when there are three or fewer, or when opened', () => {
    expect(foldWinners(five.slice(0, 3), false).hidden).toBe(0)
    expect(foldWinners(five, true)).toEqual({ shown: five, hidden: 0 })
  })
})

describe('isAssociation', () => {
  it('is a contract with more than one winner', () => {
    expect(isAssociation({ winners: five } as Contract)).toBe(true)
    expect(isAssociation({ winners: five.slice(0, 1) } as Contract)).toBe(false)
    expect(isAssociation({ winners: [] as Array<Winner> } as Contract)).toBe(
      false,
    )
  })
})

describe('publication', () => {
  it('does not guess before the versions are collected', () => {
    expect(publication(notice({ versions: null }))).toBe('unknown')
  })

  it('tells one publication from a republished notice', () => {
    expect(publication(notice({ versions: 1 }))).toBe('once')
    expect(publication(notice({ versions: 15 }))).toBe('again')
  })
})

describe('shownValue', () => {
  const contract = (over: Partial<Contract>) =>
    ({ value: null, original_value: null, currency: null, ...over }) as Contract

  it('shows the value in lei when SEAP gives one', () => {
    expect(
      shownValue(
        contract({ value: 500, original_value: 100, currency: 'EUR' }),
      ),
    ).toEqual({ amount: 500, currency: null })
  })

  it('falls back to the value the contract states, in its currency', () => {
    expect(
      shownValue(contract({ original_value: 100, currency: 'EUR' })),
    ).toEqual({ amount: 100, currency: 'EUR' })
    expect(
      shownValue(contract({ original_value: 100, currency: 'RON' })),
    ).toEqual({ amount: 100, currency: null })
  })

  it('says nothing when no value is published', () => {
    expect(shownValue(contract({}))).toBeNull()
    expect(shownValue(contract({ original_value: 100 }))).toBeNull()
  })
})

describe('pageCount', () => {
  it('counts whole pages, and one for an empty list', () => {
    expect(pageCount(0, 50)).toBe(1)
    expect(pageCount(50, 50)).toBe(1)
    expect(pageCount(51, 50)).toBe(2)
  })
})

describe('financing', () => {
  it('keeps "not collected" apart from "SEAP does not say"', () => {
    expect(financing(notice({ detail: null }))).toBe('notCollected')
    expect(financing(notice({ detail }))).toBe('notPublished')
  })

  it("gives SEAP's own words, types first", () => {
    expect(
      financing(
        notice({
          detail: {
            ...detail,
            financing_types: ['Program / Proiect'],
            eu_funds: ['Programul Regional'],
          },
        }),
      ),
    ).toEqual(['Program / Proiect', 'Programul Regional'])
  })
})
