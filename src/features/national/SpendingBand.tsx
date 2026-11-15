import { Box, Flex, Grid, Text } from '@radix-ui/themes'

import type { Segment } from '#/features/national/api'
import { useI18n } from '#/i18n/context'

// SpendingBand (design round 18): one official total split into what never goes through
// procurement (hatched, muted), what can (indigo), and the rest. One source, one period;
// never our own figures in it. The shares are whole percents from the API, adding to 100.
const FILL: Record<Segment['key'], string> = {
  not_procurement:
    'repeating-linear-gradient(135deg, var(--gray-5) 0 6px, var(--gray-4) 6px 12px)',
  procurement: 'var(--indigo-9)',
  rest: 'var(--gray-7)',
}
const SWATCH: Record<Segment['key'], string> = {
  ...FILL,
  not_procurement:
    'repeating-linear-gradient(135deg, var(--gray-6) 0 3px, var(--gray-4) 3px 6px)',
}

export function SpendingBand({
  segments,
  label,
}: {
  segments: Array<Segment>
  label: string
}) {
  const { t, f } = useI18n()
  const words = t.national.traceable.segments
  const total = segments.reduce((sum, segment) => sum + segment.amount, 0)

  return (
    <Flex direction="column" gap="3">
      <Flex
        role="img"
        aria-label={label}
        gap="1"
        style={{
          height: 28,
          borderRadius: 'var(--radius-2)',
          overflow: 'hidden',
        }}
      >
        {segments.map((segment) => (
          <Box
            key={segment.key}
            style={{
              flexGrow: total > 0 ? segment.amount / total : 0,
              flexBasis: 0,
              minWidth: 4,
              background: FILL[segment.key],
            }}
          />
        ))}
      </Flex>
      <Grid columns={{ initial: '1', sm: '3' }} gap="4" aria-hidden>
        {segments.map((segment) => {
          const never = segment.key === 'not_procurement'
          return (
            <Flex key={segment.key} direction="column" gap="1" minWidth="0">
              <Flex align="center" gap="2">
                <Box
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 2,
                    flexShrink: 0,
                    background: SWATCH[segment.key],
                  }}
                />
                <Text size="1" color="gray">
                  {words[segment.key].label}
                </Text>
              </Flex>
              <Text
                size="4"
                weight={never ? 'medium' : 'bold'}
                color={never ? 'gray' : undefined}
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {t.national.traceable.value(
                  f.leiBillions(segment.amount),
                  f.percent(segment.share / 100),
                )}
              </Text>
              <Text size="1" color="gray">
                {words[segment.key].holds}
              </Text>
            </Flex>
          )
        })}
      </Grid>
    </Flex>
  )
}
