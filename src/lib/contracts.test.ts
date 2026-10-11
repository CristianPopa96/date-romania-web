import { describe, expect, it } from 'vitest'

import type { Contract, Notice, Winner } from '#/lib/api-contracts'
import {
  contractCount,
  financing,
  foldWinners,
  isAssociation,
  listSource,
  publication,
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

describe('contractCount', () => {
  const frame = {
    period: { first_day: '2026-09-01', last_day: '2026-10-10' },
    source: {
      publisher: 'SEAP',
      record: null,
      url: null,
      fetched_at: null,
      document_id: null,
    },
  }

  it('is what an institution awarded', () => {
    expect(
      contractCount({
        ...frame,
        role: 'institutions',
        awarded: { contracts: 2, value: 6_330_000 },
      }),
    ).toBe(2)
  })

  it('adds the contracts a company won alone and with others', () => {
    expect(
      contractCount({
        ...frame,
        role: 'suppliers',
        alone: { contracts: 1, value: 210_000 },
        association: { contracts: 3, value: 6_120_000 },
      }),
    ).toBe(4)
  })
})

describe('listSource', () => {
  const from = (fetched_at: string | null) =>
    ({
      source: {
        publisher: 'SEAP',
        record: 'CAN1',
        url: 'https://example.test',
        fetched_at,
        document_id: 1,
      },
    }) as Contract

  it('is nothing for an empty list', () => {
    expect(listSource([])).toBeNull()
  })

  it('names the publisher and the last time any row was fetched', () => {
    const source = listSource([
      from('2026-10-05T04:30:00Z'),
      from('2026-10-07T04:30:00Z'),
      from(null),
    ])
    expect(source).toEqual({
      publisher: 'SEAP',
      record: null,
      url: null,
      fetched_at: '2026-10-07T04:30:00Z',
      document_id: null,
    })
  })
})
