import { describe, expect, it } from 'vitest'

import { euStatusOfParam } from '#/features/eu-projects/urls'

describe('euStatusOfParam', () => {
  it('gives the API its word for a status', () => {
    expect(euStatusOfParam('in-implementare')).toBe('in_progress')
    expect(euStatusOfParam(undefined)).toBeUndefined()
  })
})
