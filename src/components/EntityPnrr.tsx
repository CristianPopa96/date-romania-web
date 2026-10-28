import { useSuspenseQuery } from '@tanstack/react-query'
import { Link as RouterLink } from '@tanstack/react-router'
import {
  Card,
  Code,
  Flex,
  Grid,
  Heading,
  Link,
  Table,
  Text,
} from '@radix-ui/themes'

import { DataState } from '#/components/DataState'
import { Pager } from '#/components/Pager'
import { PnrrStatusBadge } from '#/components/PnrrTables'
import { SourceLine } from '#/components/SourceLine'
import { useI18n } from '#/i18n/context'
import { PAGE_SIZE } from '#/lib/api'
import type { EuBeneficiaryPnrr } from '#/lib/api-eu'
import { pageCount } from '#/lib/contracts'
import { pnrrContractsQuery } from '#/lib/queries'

// The PNRR contracts of the entity a page is about, with every payment it received from
// one dashboard edition. A payment names the beneficiary and a measure, never the
// contract, so the sum is the beneficiary's and is never shared out among its contracts.
export function EntityPnrr({
  cui,
  pnrr,
  page,
  onPage,
}: {
  cui: number
  pnrr: EuBeneficiaryPnrr
  page: number
  onPage: (page: number) => void
}) {
  const { t, f } = useI18n()
  const e = t.eu.held
  const p = t.pnrr
  const { data: contracts } = useSuspenseQuery(
    pnrrContractsQuery({ beneficiary: cui, page }),
  )
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

      <Table.Root variant="surface" size="1">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>{p.contract}</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell justify="end">
              {p.value}
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>{p.state}</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell justify="end">
              {p.physical}
            </Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {contracts.items.map((row) => (
            <Table.Row key={row.id}>
              <Table.RowHeaderCell>
                <Link asChild>
                  <RouterLink
                    to="/programe/pnrr/contracte/$id"
                    params={{ id: String(row.id) }}
                  >
                    {row.title ?? p.fallbackTitle}
                  </RouterLink>
                </Link>
                {row.number ? (
                  <Text as="div" size="1" color="gray">
                    <Code variant="ghost">{row.number}</Code>
                    {row.county ? ` · ${row.county}` : ''}
                  </Text>
                ) : null}
              </Table.RowHeaderCell>
              <Table.Cell justify="end" style={{ whiteSpace: 'nowrap' }}>
                {row.total === null ? (
                  <DataState kind="notPublished" />
                ) : (
                  f.lei(row.total)
                )}
              </Table.Cell>
              <Table.Cell>
                {row.measures_differ ? (
                  <Text size="1" color="gray">
                    {p.byMeasure}
                  </Text>
                ) : row.status ? (
                  <PnrrStatusBadge status={row.status} />
                ) : (
                  <DataState kind="notPublished" />
                )}
              </Table.Cell>
              <Table.Cell justify="end">
                {row.physical_progress !== null ? (
                  f.percent(row.physical_progress)
                ) : row.measures_differ ? (
                  <Text size="1" color="gray">
                    {p.byMeasure}
                  </Text>
                ) : (
                  <DataState kind="notPublished" />
                )}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
      <Pager
        page={page}
        pages={pageCount(contracts.total, PAGE_SIZE)}
        onPage={onPage}
      />
    </Flex>
  )
}
