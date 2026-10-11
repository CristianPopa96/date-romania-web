import { Flex, Grid, Text } from '@radix-ui/themes'

import { Figure } from '#/components/Figure'
import { AboveLimitNote, IncompleteContracts } from '#/components/Notes'
import { SourceLine } from '#/components/SourceLine'
import { useI18n } from '#/i18n/context'
import type { Source, Summary } from '#/lib/api'
import type { ContractTotals, EntityContracts } from '#/lib/api-contracts'

// The money figures of an institution or a supplier, side by side and never added:
// contracts on one hand, direct purchases on the other, each with the period it covers
// and whether the list behind it is complete.
export function EntityFigures({
  contracts,
  purchases,
  held,
  purchasesSource,
}: {
  contracts: EntityContracts
  purchases: Summary
  // The days of direct purchases the site holds, for every entity alike.
  held: Summary | null
  purchasesSource: Source
}) {
  const { t, f } = useI18n()
  const signed = f.span(contracts.period.first_day, contracts.period.last_day)
  const bought = held && f.span(held.first_day, held.last_day)

  function contractLine(totals: ContractTotals) {
    const count = t.contracts.count(totals.contracts, f.count(totals.contracts))
    return signed
      ? t.period.signed(count, t.period.range(signed.from, signed.to))
      : count
  }

  const purchaseCount = t.entity.purchasesCount(
    purchases.accepted,
    f.count(purchases.accepted),
  )

  return (
    <Flex direction="column" gap="3">
      <Grid
        columns={{
          initial: '1',
          sm: contracts.role === 'suppliers' ? '3' : '2',
        }}
        gap="3"
      >
        {contracts.role === 'institutions' ? (
          <Figure
            label={t.entity.awarded}
            value={f.leiShort(contracts.awarded.value)}
            detail={contractLine(contracts.awarded)}
          />
        ) : (
          <>
            <Figure
              label={t.entity.wonAlone}
              value={f.leiShort(contracts.alone.value)}
              detail={contractLine(contracts.alone)}
            />
            <Figure
              label={t.entity.wonTogether}
              value={f.leiShort(contracts.association.value)}
              detail={[
                contractLine(contracts.association),
                // SEAP gives one value for the whole contract: it is not this member's share.
                t.entity.undivided,
              ]}
            />
          </>
        )}
        <Figure
          label={t.entity.directAccepted}
          value={f.leiShort(purchases.value)}
          detail={
            bought
              ? t.period.complete(
                  purchaseCount,
                  t.period.range(bought.from, bought.to),
                )
              : purchaseCount
          }
        />
      </Grid>
      <IncompleteContracts period={contracts.period} />
      <AboveLimitNote summary={purchases} />
      <Flex direction="column" gap="1">
        <Text size="1" color="gray">
          {t.entity.withoutVat}
        </Text>
        <SourceLine source={contracts.source} of="contracts" />
        <SourceLine source={purchasesSource} of="purchases" />
      </Flex>
    </Flex>
  )
}
