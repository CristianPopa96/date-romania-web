import { describe, expect, it } from 'vitest'

import type {
  EuBeneficiary,
  EuBeneficiaryFunds,
  EuProgramme,
} from '#/features/eu-projects/api'
import {
  beneficiaryTie,
  euCounts,
  euShare,
  periodLabel,
  programmeCodes,
  programmeSlug,
} from '#/features/eu-projects/eu'

const entity = { cui: 4981310, name: 'Comuna Țânțăreni', kind: 'authority' }

function beneficiary(patch: Partial<EuBeneficiary>): EuBeneficiary {
  return {
    name: 'UAT Comuna Țânțăreni',
    entity: null,
    confidence: null,
    method: null,
    ...patch,
  }
}

describe('beneficiaryTie', () => {
  it('is sure only when the list gives the CUI', () => {
    expect(
      beneficiaryTie(
        beneficiary({ entity, confidence: 'sure', method: 'cui-in-list' }),
      ),
    ).toEqual({ level: 'sure', label: 'cui' })
  })

  it('names the evidence of a tie made by us', () => {
    expect(
      beneficiaryTie(
        beneficiary({
          entity,
          confidence: 'probable',
          method: 'administration-name+place',
        }),
      ),
    ).toEqual({ level: 'probable', label: 'administration' })
    expect(
      beneficiaryTie(
        beneficiary({ entity, confidence: 'probable', method: 'name+place' }),
      ),
    ).toEqual({ level: 'probable', label: 'namePlace' })
    expect(
      beneficiaryTie(
        beneficiary({
          entity,
          confidence: 'probable',
          method: 'company-name',
        }),
      ),
    ).toEqual({ level: 'probable', label: 'companyName' })
  })

  it('marks no tie when no entity was found', () => {
    expect(beneficiaryTie(beneficiary({}))).toEqual({
      level: 'none',
      label: 'none',
    })
  })
})

describe('programmes in the address', () => {
  const programmes = [
    { code: 'POR', period: '2014-2020' },
    { code: 'POAT', period: '2014-2020' },
    { code: 'PoIDS', period: '2021-2027' },
    { code: 'PoAT', period: '2021-2027' },
  ] as Array<EuProgramme>

  it('are written in lower case with their period', () => {
    expect(programmeSlug(programmes[2])).toBe('poids-2021')
  })

  it('tell apart two programmes whose codes differ only in case', () => {
    const slugs = programmes.map(programmeSlug)
    expect(new Set(slugs).size).toBe(programmes.length)
  })

  it('give back the codes of the programmes held, by code and period', () => {
    expect(programmeCodes(programmes, 'poat-2021')).toEqual(['PoAT'])
    expect(programmeCodes(programmes, 'poat-2014,por-2014')).toEqual([
      // In the order the programmes are held.
      'POR',
      'POAT',
    ])
    expect(programmeCodes(programmes, 'peo-2021')).toBeUndefined()
    expect(programmeCodes(programmes, undefined)).toBeUndefined()
  })
})

describe('euShare', () => {
  it('is the EU money over the whole value, never made up', () => {
    expect(euShare(1_785_000, 2_100_000)).toBeCloseTo(0.85)
    expect(euShare(850_000, null)).toBeNull()
    expect(euShare(null, 2_100_000)).toBeNull()
    expect(euShare(10, 0)).toBeNull()
  })
})

it('writes a programming period with an en dash', () => {
  expect(periodLabel('2014-2020')).toBe('2014–2020')
})

describe('euCounts', () => {
  const programme = (code: string, projects: number, byName = 0) => ({
    code,
    name: code,
    period: '2014-2020',
    projects,
    total: null,
    paid: null,
    cut_off: null,
    by_name: byName,
  })
  const source = {
    publisher: 'MIPE',
    record: 'x',
    url: 'https://mfe.gov.ro',
    fetched_at: null,
    document_id: null,
    sha256: null,
    parser_version: null,
    documents: null,
  }
  const funds = (patch: Partial<EuBeneficiaryFunds>): EuBeneficiaryFunds => ({
    entity,
    cohesion: [],
    cohesion_source: null,
    pnrr: null,
    ...patch,
  })

  it('counts the projects of every programme, and the PNRR contracts', () => {
    const held = funds({
      cohesion: [programme('POR', 3, 1), programme('POIM', 2, 2)],
      pnrr: {
        contracts: 4,
        total: 10,
        paid: 5,
        payments: 2,
        first_day: null,
        last_day: null,
        edition: '2026-10-15',
        source,
      },
    })
    expect(euCounts(held)).toEqual({
      cohesion: 5,
      byName: 3,
      pnrr: 4,
      pnrrPaid: true,
    })
  })

  it('counts nothing without an answer or without projects', () => {
    expect(euCounts('failed')).toEqual({
      cohesion: 0,
      byName: 0,
      pnrr: 0,
      pnrrPaid: false,
    })
    expect(euCounts(funds({}))).toEqual({
      cohesion: 0,
      byName: 0,
      pnrr: 0,
      pnrrPaid: false,
    })
  })
})
