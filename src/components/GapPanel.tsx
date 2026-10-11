import { ArrowRightIcon, InfoCircledIcon } from '@radix-ui/react-icons'
import { Box, Callout, Flex, Grid, Heading, Text } from '@radix-ui/themes'

import { DataState, NOT_COLLECTED_OUTLINE } from '#/components/DataState'
import { useI18n } from '#/i18n/context'
import type { ContractTotals, Period } from '#/lib/api-contracts'

// The two ends of an institution's money side by side: what it spent, what it awarded,
// and the payments that can be named. Only the contracts are held today; the other two
// are published at the source and not collected yet, so their cells are dotted and carry
// no figure.
export function GapPanel({
  awarded,
  period,
}: {
  awarded: ContractTotals
  period: Period
}) {
  const { t, f } = useI18n()
  const days = f.span(period.first_day, period.last_day)
  const count = t.contracts.count(awarded.contracts, f.count(awarded.contracts))

  return (
    <Flex direction="column" gap="3">
      <Heading size="5">{t.gap.title}</Heading>
      <Grid
        columns={{ initial: '1', md: '1fr auto 1fr auto 1fr' }}
        gap="3"
        align="stretch"
      >
        <Cell label={t.gap.spent} />
        <Arrow />
        <Cell
          label={t.gap.awarded}
          value={f.leiShort(awarded.value)}
          notes={[
            t.gap.awardedNote,
            days
              ? t.period.signed(count, t.period.range(days.from, days.to))
              : count,
          ]}
        />
        <Arrow />
        <Cell label={t.gap.paid} />
      </Grid>
      <Callout.Root color="gray" variant="surface" size="1">
        <Callout.Icon>
          <InfoCircledIcon />
        </Callout.Icon>
        <Callout.Text>
          <Text weight="bold">{t.gap.whyTitle}</Text> {t.gap.why}
        </Callout.Text>
      </Callout.Root>
    </Flex>
  )
}

function Cell({
  label,
  value,
  notes = [],
}: {
  label: string
  value?: string
  notes?: Array<string>
}) {
  return (
    <Box
      p="3"
      style={{
        borderRadius: 'var(--radius-3)',
        border:
          value === undefined
            ? NOT_COLLECTED_OUTLINE
            : '1px solid var(--gray-a6)',
      }}
    >
      <Flex direction="column" gap="1" align="start">
        <Text size="2" color="gray">
          {label}
        </Text>
        {value === undefined ? (
          <DataState kind="notCollected" />
        ) : (
          <Text size="5" weight="bold">
            {value}
          </Text>
        )}
        {notes.map((note) => (
          <Text key={note} size="1" color="gray">
            {note}
          </Text>
        ))}
      </Flex>
    </Box>
  )
}

// Decoration between the cells; the order of the cells already says the direction.
function Arrow() {
  return (
    <Flex
      align="center"
      justify="center"
      display={{ initial: 'none', md: 'flex' }}
      aria-hidden
    >
      <Text color="gray">
        <ArrowRightIcon />
      </Text>
    </Flex>
  )
}
