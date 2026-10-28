import { Flex, Heading, Table, Text } from '@radix-ui/themes'

import { useI18n } from '#/i18n/context'
import type { Dataset } from '#/features/sources/api'

// What the site is built on: one row per source, with the days held, how many records,
// and when the source was last read. A source that publishes late says so.
export function DatasetTable({ datasets }: { datasets: Array<Dataset> }) {
  const { t, f } = useI18n()
  if (datasets.length === 0) return null

  return (
    <Flex direction="column" gap="3">
      <Heading size="4">{t.datasets.title}</Heading>
      <Table.Root variant="surface" size="1">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>{t.datasets.source}</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>{t.datasets.period}</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell justify="end">
              {t.datasets.records}
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>
              {t.datasets.fetched}
            </Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {datasets.map((dataset) => {
            const days = f.span(dataset.first_day, dataset.last_day)
            return (
              <Table.Row key={dataset.key}>
                <Table.RowHeaderCell>
                  {t.datasets.name(
                    dataset.publisher,
                    t.datasets.names[dataset.key] ?? dataset.key,
                  )}
                </Table.RowHeaderCell>
                <Table.Cell>
                  {days ? t.period.range(days.from, days.to) : null}
                </Table.Cell>
                <Table.Cell justify="end">
                  <Text as="div">{f.count(dataset.records)}</Text>
                  <Text as="div" size="1" color="gray">
                    {[
                      t.datasets.counts[dataset.key],
                      dataset.complete
                        ? t.datasets.complete
                        : t.datasets.incomplete,
                    ]
                      .filter((part) => part !== undefined)
                      .join(' · ')}
                  </Text>
                </Table.Cell>
                <Table.Cell>
                  <Text color="gray">
                    {dataset.fetched_at ? f.day(dataset.fetched_at) : null}
                  </Text>
                </Table.Cell>
              </Table.Row>
            )
          })}
        </Table.Body>
      </Table.Root>
    </Flex>
  )
}
