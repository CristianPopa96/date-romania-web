import { ArrowRightIcon, InfoCircledIcon } from '@radix-ui/react-icons'
import { Box, Callout, Flex, Grid, Heading, Text } from '@radix-ui/themes'

import { DataState, NOT_COLLECTED_OUTLINE } from '#/components/DataState'
import { useI18n } from '#/i18n/context'
import type { ContractTotals } from '#/features/contracts'
import type { Period } from '#/lib/api'
import type { GapEnds } from '#/features/budget/budget'

// The two ends of an institution's money side by side: what it spent, what it awarded,
// and the payments that can be named (GapPanel in the design system). A cell we do not
// hold is dotted and carries no figure. The cells cover different periods (the budget's
// year, the contracts' days, the payment files), so each names its period, no bars are
// drawn and no difference between them is computed.
export function GapPanel({
  awarded,
  period,
  ends,
}: {
  awarded: ContractTotals
  period: Period
  ends: GapEnds
}) {
  const { t, f } = useI18n()
  const days = f.span(period.first_day, period.last_day)
  const count = t.contracts.count(awarded.contracts, f.count(awarded.contracts))
  const paidDays =
    ends.paid && f.span(ends.paid.first_published, ends.paid.last_published)
  const signed = days ? t.period.range(days.from, days.to) : null
  const paid = paidDays ? t.period.range(paidDays.from, paidDays.to) : null
  const periods = [
    ends.spent ? t.gap.spentPeriod(String(ends.spent.year)) : null,
    signed ? t.gap.awardedPeriod(signed) : null,
    paid ? t.gap.paidPeriod(paid) : null,
  ].filter((part): part is string => part !== null)

  return (
    <Flex direction="column" gap="3">
      <Heading size="5">{t.gap.title}</Heading>
      <Grid
        columns={{ initial: '1', md: '1fr auto 1fr auto 1fr' }}
        gap="3"
        align="stretch"
      >
        {ends.spent ? (
          <Cell
            label={t.gap.spent}
            value={f.leiShort(ends.spent.value)}
            notes={[t.gap.spentNote(String(ends.spent.year))]}
          />
        ) : (
          <Cell label={t.gap.spent} />
        )}
        <Arrow />
        <Cell
          label={t.gap.awarded}
          value={f.leiShort(awarded.value)}
          notes={[
            t.gap.awardedNote,
            signed ? t.period.signed(count, signed) : count,
          ]}
        />
        <Arrow />
        {ends.paid ? (
          <Cell
            label={t.gap.paid}
            value={f.leiShort(ends.paid.amount)}
            notes={paid ? [t.gap.paidNote(paid)] : []}
          />
        ) : (
          <Cell label={t.gap.paid} />
        )}
      </Grid>
      <Callout.Root color="gray" variant="surface" size="1">
        <Callout.Icon>
          <InfoCircledIcon />
        </Callout.Icon>
        <Callout.Text>
          {ends.periodsDiffer ? (
            <>
              <Text weight="bold">
                {t.gap.periodsTitle(periods.join(', '))}
              </Text>{' '}
              {ends.paid ? t.gap.periods : t.gap.periodsNoPayments}
            </>
          ) : (
            <>
              <Text weight="bold">{t.gap.whyTitle}</Text> {t.gap.why}
            </>
          )}
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
