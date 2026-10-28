import { Box, Flex, Text } from '@radix-ui/themes'

export type Part = {
  key: string
  label: string
  count: number
  // A status keeps its status colour (amber in progress, green finished), never decoration.
  color: 'amber' | 'green' | 'gray' | 'indigo'
  // Left out for a part that is not a filter ("Altele").
  pick?: () => void
  on?: boolean
}

// Parts of a whole (ChartCard "Părți dintr-un întreg"): one bar split by count, and a
// legend whose entries add a part as a filter. A part with nothing in it stays in the
// legend, muted, never hidden.
export function StatusBars({
  parts,
  format,
}: {
  parts: Array<Part>
  format: (count: number) => string
}) {
  const whole = parts.reduce((n, part) => n + part.count, 0)
  return (
    <Flex direction="column" gap="3">
      <Flex
        aria-hidden
        style={{
          height: 14,
          borderRadius: 'var(--radius-2)',
          overflow: 'hidden',
          background: 'var(--slate-4)',
        }}
      >
        {parts
          .filter((part) => part.count > 0)
          .map((part) => (
            <Box
              key={part.key}
              style={{
                width: `${(part.count / Math.max(whole, 1)) * 100}%`,
                background: `var(--${part.color}-${part.on ? 9 : 7})`,
              }}
            />
          ))}
      </Flex>
      <Flex direction="column" gap="1">
        {parts.map((part) => {
          const row = (
            <Flex justify="between" gap="3" align="center" width="100%">
              <Flex gap="2" align="center">
                <Box
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 2,
                    background: `var(--${part.color}-${part.count ? 8 : 5})`,
                  }}
                />
                <Text
                  size="2"
                  color={part.count ? undefined : 'gray'}
                  weight={part.on ? 'bold' : undefined}
                >
                  {part.label}
                </Text>
              </Flex>
              <Text size="2" color="gray">
                {format(part.count)}
              </Text>
            </Flex>
          )
          return part.pick && part.count > 0 ? (
            <button
              key={part.key}
              type="button"
              className="dr-rank"
              aria-pressed={part.on ?? false}
              onClick={part.pick}
            >
              {row}
            </button>
          ) : (
            <Box key={part.key}>{row}</Box>
          )
        })}
      </Flex>
    </Flex>
  )
}
