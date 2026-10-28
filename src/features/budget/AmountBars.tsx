import { Box, Flex, Text } from '@radix-ui/themes'

import { useI18n } from '#/i18n/context'

// Labels with their amount, each over a bar scaled to the largest in the list (BarList
// in the design system, for lines that are not entities: budget lines, chapters).
export function AmountBars({
  rows,
}: {
  rows: Array<{ key: string; label: string; value: number }>
}) {
  const { f } = useI18n()
  const largest = Math.max(...rows.map((row) => row.value), 1)

  return (
    <Flex direction="column" gap="3" asChild>
      <ol style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {rows.map((row) => (
          <li key={row.key}>
            <Flex justify="between" align="baseline" gap="3">
              <Text size="2">{row.label}</Text>
              <Text size="2" weight="medium" style={{ whiteSpace: 'nowrap' }}>
                {f.lei(row.value)}
              </Text>
            </Flex>
            <Box
              mt="1"
              style={{
                height: 6,
                borderRadius: 'var(--radius-1)',
                background: 'var(--gray-a4)',
              }}
            >
              <Box
                style={{
                  height: '100%',
                  width: `${Math.max((row.value / largest) * 100, 1)}%`,
                  borderRadius: 'var(--radius-1)',
                  background: 'var(--accent-9)',
                }}
              />
            </Box>
          </li>
        ))}
      </ol>
    </Flex>
  )
}
