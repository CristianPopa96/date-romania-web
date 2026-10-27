import { describe, expect, it } from 'vitest'

import type { EuBeneficiary, EuProgramme } from '#/lib/api-eu'
import {
  beneficiaryTie,
  euShare,
  periodLabel,
  programmeBySlug,
  programmeSlug,
} from '#/lib/eu'

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

  it('are found back in any case', () => {
    expect(programmeSlug(programmes[2])).toBe('poids-2021')
    expect(programmeBySlug(programmes, 'poids-2021')?.code).toBe('PoIDS')
    expect(programmeBySlug(programmes, 'POR-2014')?.code).toBe('POR')
    expect(programmeBySlug(programmes, 'por')).toBeNull()
    expect(programmeBySlug(programmes, 'pnrr')).toBeNull()
    expect(programmeBySlug(programmes, undefined)).toBeNull()
  })

  it('tell apart two programmes whose codes differ only in case', () => {
    const slugs = programmes.map(programmeSlug)
    expect(new Set(slugs).size).toBe(programmes.length)
    expect(programmeBySlug(programmes, 'poat-2014')?.period).toBe('2014-2020')
    expect(programmeBySlug(programmes, 'poat-2021')?.code).toBe('PoAT')
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
