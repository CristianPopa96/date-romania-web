import { describe, expect, it } from 'vitest'

import {
  gigabytes,
  laneSources,
  onLane,
  ruleCounts,
} from '#/features/sources/road'
import type { Dataset } from '#/features/sources/api'

describe('the lanes of the road', () => {
  it('lights every item when no lane is chosen, and only its own when one is', () => {
    expect(onLane(null, 'tables', 'pnrr_payment')).toBe(true)
    expect(onLane('pnrr', 'tables', 'pnrr_payment')).toBe(true)
    expect(onLane('seap', 'tables', 'pnrr_payment')).toBe(false)
    // The register and the places feed the ties of companies and places.
    expect(onLane('register', 'rules', 'eu-beneficiary')).toBe(true)
    expect(onLane('anghelSaligny', 'pages', 'projects')).toBe(true)
  })

  it('orders the sources by lane, an unknown one last', () => {
    const dataset = (key: string) => ({ key }) as Dataset
    const sorted = laneSources(
      ['onrc', 'later', 'pnrr', 'seap-awards', 'seap-direct'].map(dataset),
    )
    expect(sorted.map((each) => each.key)).toEqual([
      'seap-direct',
      'seap-awards',
      'pnrr',
      'onrc',
      'later',
    ])
  })
})

describe('the links of each rule', () => {
  it('adds them by confidence, and counts the facts apart', () => {
    const rules = ruleCounts([
      {
        rule: 'eu-beneficiary',
        method: 'cui-in-list',
        confidence: 'sure',
        count: 10,
      },
      {
        rule: 'eu-beneficiary',
        method: 'cui-in-map',
        confidence: 'sure',
        count: 5,
      },
      {
        rule: 'eu-beneficiary',
        method: 'register-name',
        confidence: 'probable',
        count: 3,
      },
      {
        rule: 'entity-place',
        method: 'siruta',
        confidence: null,
        count: 7,
      },
    ])
    expect(rules.map((each) => each.rule)).toEqual([
      'eu-beneficiary',
      'entity-place',
    ])
    expect(rules[0].byConfidence).toEqual({ sure: 15, probable: 3 })
    expect(rules[0].methods).toHaveLength(3)
    expect(rules[1].byConfidence).toEqual({})
    expect(rules[1].facts).toBe(7)
  })

  it('writes bytes as gigabytes to one decimal', () => {
    expect(gigabytes(8_088_989_855)).toBe(8.1)
  })
})
