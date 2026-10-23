import { Fragment } from 'react'
import { Link as RouterLink } from '@tanstack/react-router'
import { Badge, Code, Flex, Link, Table, Text } from '@radix-ui/themes'

import { DataState } from '#/components/DataState'
import { EntityLink, roleOfKind } from '#/components/EntityLink'
import { useI18n } from '#/i18n/context'
import type {
  PnrrMeasureRow,
  PnrrStatus,
  PnrrTopRecipient,
} from '#/lib/api-pnrr'
import { byComponent, measureShort, measureSlug, paidShare } from '#/lib/pnrr'

// The status of a contract as the ministry reports it: amber while it runs, green once
// finished. A state of the work, never a judgement.
export function PnrrStatusBadge({ status }: { status: PnrrStatus }) {
  const { t } = useI18n()
  return (
    <Badge color={status === 'finished' ? 'green' : 'amber'}>
      {t.pnrr.status[status]}
    </Badge>
  )
}

// The 143 measures, grouped by component. Allocated and paid in euro, contracted in lei,
// as MIPE publishes them.
export function PnrrMeasuresTable({
  measures,
}: {
  measures: ReadonlyArray<PnrrMeasureRow>
}) {
  const { t, f } = useI18n()
  const p = t.pnrr
  // A sum MIPE leaves out is said to be missing, never shown as blank or zero.
  const euros = (value: number | null) =>
    value === null ? <DataState kind="notPublished" /> : f.euroShort(value)

  return (
    <Flex direction="column" gap="2">
      <Text size="2" color="gray">
        {p.measuresNote}
      </Text>
      <Table.Root variant="surface" size="1">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>{p.measure}</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>{p.ministry}</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell justify="end">
              {p.allocatedEur}
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell justify="end">
              {p.contractedRon}
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell justify="end">
              {p.paidEur}
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell justify="end">
              {p.paidOfAllocated}
            </Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {byComponent(measures).map((group) => (
            <Fragment key={group.component}>
              <Table.Row>
                <Table.RowHeaderCell colSpan={6}>
                  <Text weight="bold">{group.component}</Text>
                </Table.RowHeaderCell>
              </Table.Row>
              {group.measures.map((measure) => {
                const share = paidShare(measure.paid_eur, measure.allocated_eur)
                return (
                  <Table.Row key={measure.code}>
                    <Table.RowHeaderCell>
                      <Link asChild>
                        <RouterLink
                          to="/programe/pnrr/$masura"
                          params={{ masura: measureSlug(measure.code) }}
                        >
                          {measureShort(measure.code, measure.name)}
                        </RouterLink>
                      </Link>{' '}
                      <Code variant="ghost" color="gray">
                        {measure.code}
                      </Code>
                      {measure.name ? (
                        <Text as="div" size="1" color="gray">
                          {measure.name}
                        </Text>
                      ) : null}
                    </Table.RowHeaderCell>
                    <Table.Cell>{measure.ministry}</Table.Cell>
                    <Table.Cell justify="end">
                      {euros(measure.allocated_eur)}
                    </Table.Cell>
                    <Table.Cell justify="end">
                      {measure.contracted_ron === null ? (
                        <DataState kind="notPublished" />
                      ) : (
                        f.leiShort(measure.contracted_ron)
                      )}
                    </Table.Cell>
                    <Table.Cell justify="end">
                      {euros(measure.paid_eur)}
                    </Table.Cell>
                    <Table.Cell justify="end">
                      {share === null ? (
                        <DataState kind="notPublished" />
                      ) : (
                        f.percent(share)
                      )}
                    </Table.Cell>
                  </Table.Row>
                )
              })}
            </Fragment>
          ))}
        </Table.Body>
      </Table.Root>
    </Flex>
  )
}

// The largest final recipients, as the EU rule asks them published.
export function PnrrTopTable({
  top,
  edition,
}: {
  top: ReadonlyArray<PnrrTopRecipient>
  edition: string
}) {
  const { t, f } = useI18n()
  const p = t.pnrr

  return (
    <Flex direction="column" gap="2">
      <Text size="2" color="gray">
        {p.topNote(f.day(edition))}
      </Text>
      <Table.Root variant="surface" size="1">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>{p.recipient}</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell justify="end">
              {p.received}
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell justify="end">
              {p.lastReceived}
            </Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {top.map((each) => (
            <Table.Row key={each.cui}>
              <Table.RowHeaderCell>
                {each.entity ? (
                  <EntityLink
                    role={roleOfKind(each.entity.kind)}
                    cui={each.cui}
                  >
                    {each.entity.name}
                  </EntityLink>
                ) : (
                  (each.name ?? String(each.cui))
                )}
              </Table.RowHeaderCell>
              <Table.Cell justify="end">
                {each.received === null ? (
                  <DataState kind="notPublished" />
                ) : (
                  f.leiShort(each.received)
                )}
              </Table.Cell>
              <Table.Cell justify="end">
                {each.last_received_on ? (
                  f.day(each.last_received_on)
                ) : (
                  <DataState kind="notPublished" />
                )}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Flex>
  )
}
