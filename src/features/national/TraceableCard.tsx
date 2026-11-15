import { Callout, Card, Flex, Grid, Heading, Text } from '@radix-ui/themes'

import { DataState } from '#/components/DataState'
import { SourceLine } from '#/components/SourceLine'
import type { NationalBudget, Ours } from '#/features/national/api'
import { periodText } from '#/features/national/national'
import { SpendingBand } from '#/features/national/SpendingBand'
import { useI18n } from '#/i18n/context'

// Block 2, "Ce parte din acești bani putem urmări": the execution split by whether it can
// go through procurement, and beside it what we hold, each figure with its own source
// and period. Nothing is subtracted, and no share "covered" is ever computed.
export function TraceableCard({ budget }: { budget: NationalBudget | null }) {
  const { t, f } = useI18n()
  const words = t.national.traceable
  if (!budget?.executed) {
    return (
      <Card size="3">
        <Flex direction="column" gap="3">
          <Heading as="h2" size="5">
            {words.title}
          </Heading>
          <Flex direction="column" gap="1" align="start">
            <DataState kind="notCollected" />
            <Text size="1" color="gray">
              {t.national.fills.execution}
            </Text>
          </Flex>
        </Flex>
      </Card>
    )
  }
  const { executed, band } = budget
  const period =
    periodText(
      f,
      executed.period_start,
      executed.period_end,
      t.national.span,
    ) ?? ''
  const part = (key: string) => band.find((segment) => segment.key === key)
  const can = part('procurement')
  // A part as a screen reader hears it: its amount and its share, "360,81 mld. lei, 60 %".
  const amount = (key: string) =>
    words.said(
      f.leiBillions(part(key)?.amount ?? 0),
      f.percent((part(key)?.share ?? 0) / 100),
    )

  return (
    <Card size="3">
      <Flex direction="column" gap="5">
        <Flex direction="column" gap="1">
          <Heading as="h2" size="5">
            {words.title}
          </Heading>
          <Text size="2" color="gray" style={{ maxWidth: '70ch' }}>
            {words.lead}
          </Text>
        </Flex>
        <SpendingBand
          segments={band}
          label={words.aria(
            f.leiBillions(executed.spending),
            period,
            amount('not_procurement'),
            amount('procurement'),
            amount('rest'),
          )}
        />
        <Grid columns={{ initial: '1', sm: '2' }} gap="5">
          <Flex direction="column" gap="3">
            <Heading as="h3" size="3">
              {words.canTitle}
            </Heading>
            {can ? (
              <Text size="2">
                {words.canText(f.leiBillions(can.amount), period)}
              </Text>
            ) : null}
            <Callout.Root color="gray" variant="surface" size="1">
              <Callout.Text>
                {words.callout(t.national.months(executed.months))}
              </Callout.Text>
            </Callout.Root>
          </Flex>
          <Flex direction="column" gap="3">
            <Heading as="h3" size="3">
              {words.oursTitle}
            </Heading>
            {budget.ours.map((figure) => (
              <OursFigure
                key={figure.key}
                figure={figure}
                year={String(budget.year)}
              />
            ))}
          </Flex>
        </Grid>
      </Flex>
    </Card>
  )
}

function OursFigure({ figure, year }: { figure: Ours; year: string }) {
  const { t, f } = useI18n()
  const words = t.national.traceable
  const label = words.ours[figure.key]?.(year) ?? figure.key
  const period = periodText(
    f,
    figure.period_start,
    figure.period_end,
    t.national.span,
  )
  const line = period ? words.oursLine[figure.key]?.(period) : null

  return (
    <Flex direction="column" gap="1">
      <Text size="2" color="gray">
        {label}
      </Text>
      {figure.collected && figure.amount != null ? (
        <>
          <Text size="5" weight="bold">
            {f.leiShort(figure.amount)}
          </Text>
          {line ? (
            <Text size="1" color="gray">
              {line}
            </Text>
          ) : null}
          {figure.source ? <SourceLine source={figure.source} /> : null}
        </>
      ) : (
        <Flex direction="column" gap="1" align="start">
          <DataState kind="notCollected" />
          {figure.key === 'institution_payments' ? (
            <Text size="1" color="gray">
              {words.institutionPayments}
            </Text>
          ) : null}
        </Flex>
      )}
    </Flex>
  )
}
