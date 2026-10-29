import { Card, Flex, Grid, Heading, Text } from '@radix-ui/themes'

import { DataState } from '#/components/DataState'
import { SourceLine } from '#/components/SourceLine'
import type { EuBeneficiaryPnrr } from '#/features/eu-projects'
import { PnrrContractList } from '#/features/pnrr/PnrrContractList'
import type { PnrrListSearch } from '#/features/pnrr/list'
import { useI18n } from '#/i18n/context'

// The PNRR contracts of the entity a page is about, with every payment it received from
// one dashboard edition. A payment names the beneficiary and a measure, never the
// contract, so the sum is the beneficiary's and is never shared out among its contracts.
export function EntityPnrr<TSearch extends PnrrListSearch>({
  cui,
  pnrr,
  search,
  onSearch,
}: {
  cui: number
  pnrr: EuBeneficiaryPnrr
  search: TSearch & { pagina?: number }
  onSearch: (search: TSearch) => void
}) {
  const { t, f } = useI18n()
  const e = t.eu.held
  const days = f.span(pnrr.first_day, pnrr.last_day)

  return (
    <Flex direction="column" gap="3">
      <Heading as="h2" size="5">
        {e.pnrrTitle}
      </Heading>
      <Text size="2" color="gray" style={{ maxWidth: '70ch' }}>
        {e.pnrrLead(f.day(pnrr.edition))}
      </Text>
      <Grid columns={{ initial: '1', sm: '2' }} gap="3" maxWidth="640px">
        <Card>
          <Flex direction="column" gap="1">
            <Text size="2" color="gray">
              {e.contracted}
            </Text>
            <Text size="6" weight="bold">
              {pnrr.total === null ? (
                <DataState kind="notPublished" />
              ) : (
                f.leiShort(pnrr.total)
              )}
            </Text>
            <Text size="1" color="gray">
              {e.contracts(pnrr.contracts, f.count(pnrr.contracts))}
            </Text>
          </Flex>
        </Card>
        <Card>
          <Flex direction="column" gap="1">
            <Text size="2" color="gray">
              {e.received}
            </Text>
            <Text size="6" weight="bold">
              {f.leiShort(pnrr.paid)}
            </Text>
            <Text size="1" color="gray">
              {pnrr.payments > 0
                ? e.receivedDetail(
                    pnrr.payments,
                    f.count(pnrr.payments),
                    days ? t.period.range(days.from, days.to) : null,
                  )
                : e.noPayments}
            </Text>
            <Text size="1" color="gray">
              {e.receivedNote}
            </Text>
          </Flex>
        </Card>
      </Grid>
      <SourceLine source={pnrr.source} />

      {pnrr.contracts > 0 ? (
        <PnrrContractList
          cui={cui}
          edition={pnrr.edition}
          search={search}
          onSearch={onSearch}
        />
      ) : (
        <Text size="2" color="gray">
          {e.noContracts}
        </Text>
      )}
    </Flex>
  )
}
