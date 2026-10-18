import { Card, Flex, Grid, Text } from '@radix-ui/themes'

import { DataState } from '#/components/DataState'
import { SourceLine } from '#/components/SourceLine'
import { useI18n } from '#/i18n/context'
import type { PlaceFigures } from '#/lib/api-places'
import { countyShares } from '#/lib/places'

// The four figures of a locality or a county (ScreenLocality): payments from the Anghel
// Saligny programme, capital spending, the contracts of every buyer here, and how much
// of them went to suppliers of the county. Each names its own period under it; none is
// added to another or drawn on one scale with it. `sectors`: Bucharest, whose payments
// are its town hall's and its sectors'.
export function PlaceOverview({
  figures,
  county = false,
  sectors = false,
}: {
  figures: PlaceFigures
  county?: boolean
  sectors?: boolean
}) {
  const { t, f } = useI18n()
  const p = t.places.figures
  const paid = figures.programme_payments
  const paidDays = paid && f.span(paid.first_published, paid.last_published)
  const contracts = figures.contracts
  const days = f.span(contracts.period.first_day, contracts.period.last_day)
  const range = days ? t.period.range(days.from, days.to) : null
  const shares = countyShares(figures)

  return (
    <Grid columns={{ initial: '1', sm: '2', md: '4' }} gap="3">
      <Cell
        label={
          county ? p.paymentsCounty : sectors ? p.paymentsSectors : p.payments
        }
      >
        <Text size="6" weight="bold">
          {f.leiShort(paid?.amount ?? 0)}
        </Text>
        <Text size="1" color="gray">
          {paidDays
            ? `${t.period.range(paidDays.from, paidDays.to)} · ${p.paymentsMissing}`
            : `${p.noPayments} · ${p.paymentsMissing}`}
        </Text>
      </Cell>
      <Cell label={county ? p.capitalCounty : p.capital}>
        {figures.capital ? (
          <>
            <Text size="6" weight="bold">
              {f.leiShort(figures.capital.amount)}
            </Text>
            <Text size="1" color="gray">
              {p.capitalDetail(String(figures.capital.year))}
            </Text>
          </>
        ) : (
          <DataState kind="notCollected" />
        )}
      </Cell>
      <Cell label={p.contracts}>
        <Text size="6" weight="bold">
          {f.leiShort(contracts.value)}
        </Text>
        <Text size="1" color="gray">
          {range
            ? t.period.signed(
                t.contracts.count(
                  contracts.contracts,
                  f.count(contracts.contracts),
                ),
                range,
              )
            : t.contracts.count(
                contracts.contracts,
                f.count(contracts.contracts),
              )}
        </Text>
        <Text size="1" color="gray">
          {p.contractsBuyers(contracts.buyers, f.count(contracts.buyers))}
        </Text>
      </Cell>
      <Cell label={p.local}>
        {shares ? (
          <>
            <Text size="6" weight="bold">
              {f.percent(shares.local)}
            </Text>
            <Text size="1" color="gray">
              {p.localDetail}
            </Text>
            {shares.mixed > 0 ? (
              <Text size="1" color="gray">
                {p.mixed(f.percent(shares.mixed))}
              </Text>
            ) : null}
          </>
        ) : (
          <Text size="2" color="gray">
            {p.noContracts}
          </Text>
        )}
      </Cell>
      <Flex direction="column" gap="1" gridColumn={{ md: '1 / -1' }}>
        {paid ? <SourceLine source={paid.source} of="payments" /> : null}
        {figures.capital ? (
          <SourceLine source={figures.capital.source} />
        ) : null}
        <SourceLine source={contracts.source} of="contracts" />
      </Flex>
    </Grid>
  )
}

function Cell({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <Card>
      <Flex direction="column" gap="1" align="start">
        <Text size="2" color="gray">
          {label}
        </Text>
        {children}
      </Flex>
    </Card>
  )
}
