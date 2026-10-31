import { describe, expect, it } from 'vitest'

import type { EuBeneficiary, EuProgramme } from '#/features/eu-projects/api'
import {
  beneficiaryTie,
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
  it('is sure only when the list, or else the map, gives the CUI', () => {
    expect(
      beneficiaryTie(
        beneficiary({ entity, confidence: 'sure', method: 'cui-in-list' }),
      ),
    ).toEqual({ level: 'sure', label: 'cui' })
    expect(
      beneficiaryTie(
        beneficiary({ entity, confidence: 'sure', method: 'cui-in-map' }),
      ),
    ).toEqual({ level: 'sure', label: 'map' })
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
    expect(
      beneficiaryTie(
        beneficiary({
          entity,
          confidence: 'probable',
          method: 'register-name',
        }),
      ),
    ).toEqual({ level: 'probable', label: 'register' })
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
