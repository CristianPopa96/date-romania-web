import { describe, expect, it } from 'vitest'

import type { TraceBuilder, TraceContract } from '#/lib/api-programme'
import {
  chainEnd,
  countyKey,
  countySlug,
  isAssociation,
  matchParam,
  progressShare,
  tiedShare,
} from '#/lib/programme'

function contract(more: Partial<TraceContract> = {}): TraceContract {
  return {
    notice_no: 'CAN0000001',
    notice_id: null,
    notice_date: '2023-09-14',
    contract_no: '4521',
    contract_date: '2023-09-14',
    title: null,
    lot: '1',
    value_ron: 6_120_000,
    procedure_type: 'Procedura simplificata',
    contract_type: 'Lucrari',
    is_framework: false,
    buyer: null,
    buyer_text: 'COMUNA TANTARENI',
    partners: [],
    ratio: 0.72,
    ...more,
  }
}

function builder(more: Partial<TraceBuilder> = {}): TraceBuilder {
  return {
    cui: 17886786,
    name: 'ALFA CONSTRUCT S.R.L.',
    entity: null,
    payments: 3,
    amount: 5_400_000,
    match: 'one',
    contracts: [contract()],
    ...more,
  }
}

describe('counties in an address', () => {
  it('writes a county without capitals and spaces, and reads it back', () => {
    expect(countySlug('BISTRITA NASAUD')).toBe('bistrita-nasaud')
    expect(countyKey('bistrita-nasaud')).toBe('BISTRITA NASAUD')
    expect(countyKey(countySlug('GORJ'))).toBe('GORJ')
  })
})

describe('matchParam', () => {
  it('names every match state the way the address does', () => {
    expect(matchParam('one')).toBe('un-contract')
    expect(matchParam('several')).toBe('mai-multe')
    expect(matchParam('none')).toBe('niciunul')
    expect(matchParam('unnamed')).toBe('fara-cui')
  })
})

describe('tiedShare', () => {
  const counts = {
    one: { count: 647, amount: 892.9 },
    several: { count: 324, amount: 469.3 },
    none: { count: 93, amount: 178.8 },
    unnamed: { count: 2757, amount: 4387.3 },
  }

  it('is the share of the payments that name the builder by tax ID', () => {
    const share = tiedShare(counts)
    expect(share?.tied.count).toBe(971)
    expect(share?.named.count).toBe(1064)
    expect(share?.ofCount).toBeCloseTo(0.913, 3)
    expect(share?.ofAmount).toBeCloseTo(0.884, 3)
  })

  it('says nothing when no payment names its builder by tax ID', () => {
    const empty = { count: 0, amount: 0 }
    expect(
      tiedShare({ ...counts, one: empty, several: empty, none: empty }),
    ).toBeNull()
  })
})

describe('progressShare', () => {
  it('reads a share however the town hall typed it', () => {
    expect(progressShare('83,34')).toBeCloseTo(0.8334)
    expect(progressShare('64%')).toBeCloseTo(0.64)
    expect(progressShare('69,57 %')).toBeCloseTo(0.6957)
    expect(progressShare('84,12 % ')).toBeCloseTo(0.8412)
    expect(progressShare('30.77')).toBeCloseTo(0.3077)
    expect(progressShare('100')).toBe(1)
  })

  it('leaves alone what is not a share', () => {
    expect(progressShare('PT RECEPTIONAT SI APROBAT')).toBeNull()
    expect(progressShare('250')).toBeNull()
    expect(progressShare('')).toBeNull()
    expect(progressShare(null)).toBeNull()
  })
})

describe('chainEnd', () => {
  it('ends with the contract when the notice has one', () => {
    expect(chainEnd(builder())).toMatchObject({
      kind: 'contract',
      contract: { contract_no: '4521' },
    })
  })

  it('ends with the notice when it holds several contracts of the builder', () => {
    const lots = [contract(), contract({ contract_no: '4522', lot: '2' })]
    expect(chainEnd(builder({ contracts: lots })).kind).toBe('notice')
  })

  it('does not pick a contract among several notices', () => {
    const two = [contract(), contract({ notice_no: 'CAN0000002' })]
    expect(chainEnd(builder({ match: 'several', contracts: two }))).toEqual({
      kind: 'several',
    })
  })

  it('stops at the builder with no contract or no tax ID', () => {
    expect(chainEnd(builder({ match: 'none', contracts: [] }))).toEqual({
      kind: 'none',
    })
    expect(
      chainEnd(builder({ cui: null, match: 'unnamed', contracts: [] })),
    ).toEqual({ kind: 'unnamed' })
  })
})

describe('isAssociation', () => {
  it('is a contract with other winners beside the builder', () => {
    expect(isAssociation(contract())).toBe(false)
    const partner = { cui: 30000011, name: 'GAMA ASFALT', entity: null }
    expect(isAssociation(contract({ partners: [partner] }))).toBe(true)
  })
})
