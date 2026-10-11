import { afterEach, describe, expect, it, vi } from 'vitest'

import { getFile } from '#/lib/api'

afterEach(() => vi.unstubAllGlobals())

describe('getFile', () => {
  it('passes a file on with the mark at its start', async () => {
    const sent = new TextEncoder().encode('﻿title\nȘoseaua Țânțăreni\n')
    const fetched = vi.fn(async (_url: URL) => new Response(sent))
    vi.stubGlobal('fetch', fetched)

    const file = new Uint8Array(
      await getFile('/v1/award-contracts', { format: 'csv', buyer: undefined }),
    )

    expect([...file.slice(0, 3)]).toEqual([0xef, 0xbb, 0xbf])
    expect(file).toEqual(sent)
    expect(fetched.mock.calls[0][0].search).toBe('?format=csv')
  })
})
