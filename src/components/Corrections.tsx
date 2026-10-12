import { Flex, Heading, Link, Table, Text } from '@radix-ui/themes'

import { Unavailable } from '#/components/Notes'
import { useI18n } from '#/i18n/context'
import type { Correction } from '#/lib/api-reports'
import { sitePath } from '#/lib/reports'

// What was corrected after a reader's report. The text is ours; the reader's is never
// shown. `items` is null when the list could not be read.
export function Corrections({ items }: { items: Array<Correction> | null }) {
  const { t, f } = useI18n()

  return (
    <Flex direction="column" gap="3">
      <Flex direction="column" gap="2">
        <Heading size="5">{t.corrections.title}</Heading>
        <Text size="2" color="gray" style={{ maxWidth: '70ch' }}>
          {t.corrections.lead}
        </Text>
      </Flex>
      {items === null ? (
        <Unavailable />
      ) : items.length === 0 ? (
        <Text size="2" color="gray">
          {t.corrections.none}
        </Text>
      ) : (
        <Table.Root variant="surface" size="1">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>
                {t.corrections.day}
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>
                {t.corrections.page}
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>
                {t.corrections.what}
              </Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {items.map((item, index) => {
              const path = sitePath(item.page)
              return (
                <Table.Row key={index}>
                  <Table.Cell style={{ whiteSpace: 'nowrap' }}>
                    {f.day(item.corrected_on)}
                  </Table.Cell>
                  <Table.Cell>
                    {/* Any page of the site, so a plain link, not a typed route.
                        Anything else is not shown: it would be a reader's own text. */}
                    {path ? <Link href={path}>{path}</Link> : null}
                  </Table.Cell>
                  <Table.Cell>{item.correction}</Table.Cell>
                </Table.Row>
              )
            })}
          </Table.Body>
        </Table.Root>
      )}
    </Flex>
  )
}
