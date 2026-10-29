import { Box, Text } from '@radix-ui/themes'

import { squarify } from '#/lib/treemap'

export type TreeTile = {
  key: string
  label: string
  value: number
  detail?: string
  // Left out for a tile that opens nothing ("Alți 8.291").
  pick?: () => void
}

const HEIGHT = 300
// A tile too small for two lines shows no words: its name is in its label, its tooltip
// and the chart's table. Its height in pixels; its width as a share of the map's, which
// the server does not know in pixels.
const TWO_LINES = 40
const ONE_LINE = 22
const WORDS_WIDTH = 10

// Parts of a whole by value (ChartCard), largest first: the named parties as tiles that
// open their page, and the rest added up as one gray tile that opens nothing. Every tile
// keeps its area in proportion to its value, so the rest can dwarf the largest party.
export function TreeMap({
  tiles,
  format,
}: {
  tiles: Array<TreeTile>
  format: (value: number) => string
}) {
  const shown = tiles.filter((tile) => tile.value > 0)
  const rects = squarify(
    shown.map((tile) => tile.value),
    100,
    100,
  )
  return (
    <Box position="relative" style={{ height: HEIGHT }}>
      {shown.map((tile, index) => {
        const rect = rects[index]
        const tall = (rect.height / 100) * HEIGHT
        const wide = rect.width >= WORDS_WIDTH
        const lines = !wide
          ? 0
          : tall >= TWO_LINES
            ? 2
            : tall >= ONE_LINE
              ? 1
              : 0
        const label = `${tile.label}: ${format(tile.value)}${tile.detail ? `, ${tile.detail}` : ''}`
        const body = lines ? (
          <>
            <Text as="div" size="1" weight="medium" truncate>
              {tile.label}
            </Text>
            {lines === 2 ? (
              <Text as="div" size="1" truncate>
                {format(tile.value)}
              </Text>
            ) : null}
          </>
        ) : null
        const place = {
          position: 'absolute' as const,
          left: `${rect.x}%`,
          top: `${rect.y}%`,
          width: `${rect.width}%`,
          height: `${rect.height}%`,
          padding: 1,
        }
        return (
          <Box key={tile.key} style={place}>
            {tile.pick ? (
              <button
                type="button"
                className="dr-tile"
                aria-label={label}
                title={label}
                onClick={tile.pick}
              >
                {body}
              </button>
            ) : (
              <div className="dr-tile dr-tile-rest" title={label}>
                {body}
              </div>
            )}
          </Box>
        )
      })}
    </Box>
  )
}
