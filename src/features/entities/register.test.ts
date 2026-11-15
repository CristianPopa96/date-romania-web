import { describe, expect, it } from 'vitest'

import { plainState } from '#/features/entities/register'

describe('a register state', () => {
  it('is plain text only when the company is in business', () => {
    expect(plainState('funcțiune')).toBe(true)
    expect(plainState('Funcțiune ')).toBe(true)
  })

  it('is marked for every other state, in the register words', () => {
    expect(plainState('radiată')).toBe(false)
    expect(plainState('dizolvare')).toBe(false)
    expect(plainState('întrerupere temporară de activitate')).toBe(false)
  })
})
