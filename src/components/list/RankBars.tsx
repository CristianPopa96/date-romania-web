import { Box, Flex, Text } from '@radix-ui/themes'

export type RankRow = {
  key: string
  label: string
  value: number
  detail?: string
  // Left out for a row that is not a filter ("Alți 9").
  pick?: () => void
  on?: boolean
}

// The largest counterparts as bars (ChartCard "Clasament"); clicking one asks for it as a
// filter of the list. Bars are scaled to the largest named row: the rest, added up, can be
// far larger and would leave the others as slivers, so its bar stops at the full width.
export function RankBars({
  rows,
  format,
}: {
  rows: Array<RankRow>
  format: (value: number) => string
}) {
  const named = rows.filter((row) => row.pick)
  const largest = Math.max(
    ...(named.length ? named : rows).map((row) => row.value),
    1,
  )
  return (
    <Flex direction="column" gap="2">
      {rows.map((row) => {
        const body = (
          <>
            <Flex justify="between" gap="3" align="baseline">
              <Text size="2" truncate>
                {row.label}
              </Text>
              <Text size="2" weight="medium" style={{ whiteSpace: 'nowrap' }}>
                {format(row.value)}
              </Text>
            </Flex>
            <Box
              className="dr-rank-bar"
              mt="1"
              style={{
                width: `${Math.min(Math.max((row.value / largest) * 100, 1), 100)}%`,
              }}
            />
            {row.detail ? (
              <Text size="1" color="gray">
                {row.detail}
              </Text>
            ) : null}
          </>
        )
        return row.pick ? (
          <button
            key={row.key}
            type="button"
            className="dr-rank"
            aria-pressed={row.on ?? false}
            onClick={row.pick}
          >
            {body}
          </button>
        ) : (
          <Box key={row.key} style={{ opacity: 0.8 }}>
            {body}
          </Box>
        )
      })}
    </Flex>
  )
}
