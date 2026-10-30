import { describe, expect, it } from 'vitest'

import { squarify } from '#/lib/treemap'

const area = (tile: { width: number; height: number }) =>
  tile.width * tile.height

describe('squarify', () => {
  it('gives each value an area in proportion, filling the box', () => {
    const values = [6, 6, 4, 3, 2, 2, 1]
    const tiles = squarify(values, 600, 400)
    expect(tiles).toHaveLength(values.length)
    const scale = (600 * 400) / 24
    tiles.forEach((tile, index) => {
      expect(area(tile)).toBeCloseTo(values[index] * scale, 6)
    })
    expect(tiles.reduce((sum, tile) => sum + area(tile), 0)).toBeCloseTo(
      600 * 400,
      6,
    )
  })

  it('keeps every tile inside the box', () => {
    for (const tile of squarify([50, 20, 10, 9, 5, 3, 2, 1], 100, 60)) {
      expect(tile.x).toBeGreaterThanOrEqual(-1e-9)
      expect(tile.y).toBeGreaterThanOrEqual(-1e-9)
      expect(tile.x + tile.width).toBeLessThanOrEqual(100 + 1e-9)
      expect(tile.y + tile.height).toBeLessThanOrEqual(60 + 1e-9)
    }
  })

  it('draws nothing for no values', () => {
    expect(squarify([])).toEqual([])
    expect(squarify([0, 0])).toEqual([])
  })
})
