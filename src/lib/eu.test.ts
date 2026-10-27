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
    for (const method of ['administration-name+place', 'name+place'] as const) {
      expect(
        beneficiaryTie(beneficiary({ entity, confidence: 'probable', method })),
      ).toEqual({ level: 'probable', label: 'namePlace' })
    }
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
  const programmes = [{ code: 'POR' }, { code: 'PoIDS' }] as Array<EuProgramme>

  it('are found back in any case', () => {
    expect(programmeSlug('PoIDS')).toBe('poids')
    expect(programmeBySlug(programmes, 'poids')?.code).toBe('PoIDS')
    expect(programmeBySlug(programmes, 'POR')?.code).toBe('POR')
    expect(programmeBySlug(programmes, 'pnrr')).toBeNull()
    expect(programmeBySlug(programmes, undefined)).toBeNull()
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
