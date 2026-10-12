import { Flex, Heading, Table, Text } from '@radix-ui/themes'

import { DataState } from '#/components/DataState'
import { useI18n } from '#/i18n/context'
import type { Dataset } from '#/lib/api'
import { coverage } from '#/lib/sources'

// The sources we hold, one row each: what it brings, the days read, when it was last
// read, what is held and what it cannot tell.
export function SourcesTable({ datasets }: { datasets: Array<Dataset> }) {
  const { t, f } = useI18n()

  return (
    <Flex direction="column" gap="3">
      <Heading size="5">{t.sources.heldTitle}</Heading>
      <Table.Root variant="surface" size="1">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>{t.sources.source}</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>{t.sources.period}</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>{t.sources.fetched}</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell justify="end">
              {t.sources.rows}
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>{t.sources.limits}</Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {datasets.map((dataset) => {
            const days = f.span(dataset.first_day, dataset.last_day)
            // A source that comes as files has no days to read or to miss.
            const files = dataset.counts.files ?? 0
            const read = files > 0 ? null : coverage(dataset)
            const limits = t.sources.limitsOf[dataset.key] ?? []
            return (
              <Table.Row key={dataset.key}>
                <Table.RowHeaderCell>
                  <Text as="div" weight="bold">
                    {t.datasets.name(
                      dataset.publisher,
                      t.datasets.names[dataset.key] ?? dataset.key,
                    )}
                  </Text>
                  <Text as="div" size="1" color="gray">
                    {t.sources.brings[dataset.key]}
                  </Text>
                </Table.RowHeaderCell>
                <Table.Cell>
                  <Text as="div" style={{ whiteSpace: 'nowrap' }}>
                    {days ? t.period.range(days.from, days.to) : null}
                  </Text>
                  {files > 0 ? (
                    <Text as="div" size="1" color="gray">
                      {t.sources.files(files, f.count(files))}
                    </Text>
                  ) : null}
                  {read ? (
                    <Text as="div" size="1" color="gray">
                      {t.sources.daysRead(
                        f.count(read.full),
                        read.expected,
                        f.count(read.expected),
                      )}
                    </Text>
                  ) : null}
                  {read && read.partial > 0 ? (
                    <Text as="div" size="1" color="gray">
                      {t.sources.daysPartial(
                        read.partial,
                        f.count(read.partial),
                      )}
                    </Text>
                  ) : null}
                  {read && read.missing > 0 ? (
                    <Text as="div" size="1" color="gray">
                      {t.sources.daysMissing(
                        read.missing,
                        f.count(read.missing),
                      )}
                    </Text>
                  ) : null}
                </Table.Cell>
                <Table.Cell>
                  <Text color="gray">
                    {dataset.fetched_at ? f.day(dataset.fetched_at) : null}
                  </Text>
                </Table.Cell>
                <Table.Cell justify="end">
                  <Held dataset={dataset} />
                </Table.Cell>
                <Table.Cell>
                  {limits.map((limit) => (
                    <Text key={limit} as="div" size="1" color="gray">
                      {limit}
                    </Text>
                  ))}
                </Table.Cell>
              </Table.Row>
            )
          })}
        </Table.Body>
      </Table.Root>
      <Text size="1" color="gray">
        {t.sources.frozen}
      </Text>
    </Flex>
  )
}

// What a source holds, in its own words: a notice is not a contract, and an accepted
// purchase is not every purchase.
function Held({ dataset }: { dataset: Dataset }) {
  const { t, f } = useI18n()
  const { counts } = dataset
  const n = (key: string) => counts[key] ?? 0

  if (dataset.key === 'seap-direct') {
    return (
      <>
        <Text as="div">
          {t.sources.purchases(n('purchases'), f.count(n('purchases')))}
        </Text>
        <Text as="div" size="1" color="gray">
          {t.sources.accepted(f.count(n('accepted')))}
        </Text>
        {n('above_limit') > 0 ? (
          <Text as="div" size="1" color="gray">
            {t.sources.aboveLimit(f.count(n('above_limit')))}
          </Text>
        ) : null}
      </>
    )
  }
  if (dataset.key === 'seap-awards') {
    return (
      <>
        <Text as="div">
          {t.sources.notices(n('notices'), f.count(n('notices')))}
        </Text>
        <Text as="div" size="1" color="gray">
          {t.sources.contractsHeld(
            t.contracts.count(n('contracts'), f.count(n('contracts'))),
            f.count(n('counted_contracts')),
          )}
        </Text>
      </>
    )
  }
  if (dataset.key === 'pnias-payments') {
    return (
      <>
        <Text as="div">
          {t.sources.paymentsHeld(dataset.records, f.count(dataset.records))}
        </Text>
        <Text as="div" size="1" color="gray">
          {t.sources.projectsHeld(n('projects'), f.count(n('projects')))}
        </Text>
      </>
    )
  }
  if (dataset.key === 'seap-exports') {
    return (
      <>
        <Text as="div">
          {t.sources.exportRows(dataset.records, f.count(dataset.records))}
        </Text>
        <Text as="div" size="1" color="gray">
          {t.sources.exportRowsNote}
        </Text>
      </>
    )
  }
  return <Text as="div">{f.count(dataset.records)}</Text>
}

// Sources that publish what the site needs next. Named so a reader knows what is
// missing; none carries a figure or a date.
export function SourcesToCome() {
  const { t } = useI18n()
  return (
    <Flex direction="column" gap="3">
      <Heading size="5">{t.sources.toComeTitle}</Heading>
      <Text size="2" color="gray" style={{ maxWidth: '70ch' }}>
        {t.sources.toComeLead}
      </Text>
      <Table.Root variant="surface" size="1">
        <Table.Body>
          {t.sources.toCome.map((source) => (
            <Table.Row key={source.name}>
              <Table.RowHeaderCell>
                <Text as="div" weight="bold">
                  {source.name}
                </Text>
                <Text as="div" size="1" color="gray">
                  {source.brings}
                </Text>
              </Table.RowHeaderCell>
              <Table.Cell justify="end">
                <DataState kind="notCollected" />
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Flex>
  )
}
