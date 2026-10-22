import {
  Badge,
  Flex,
  Heading,
  Table,
  Text,
  VisuallyHidden,
} from '@radix-ui/themes'

import { DataState } from '#/components/DataState'
import { SourceLine } from '#/components/SourceLine'
import { useI18n } from '#/i18n/context'
import { DETAIL_MIN_VALUE } from '#/lib/api'
import type { PurchaseDetail } from '#/lib/api'

// What a direct purchase bought, line by line, from its own page in SEAP. Collected for
// some purchases only: the others say so.
export function PurchaseItems({ detail }: { detail: PurchaseDetail | null }) {
  const { t, f } = useI18n()

  return (
    <Flex direction="column" gap="3">
      <Heading size="5">{t.purchase.bought}</Heading>
      {detail === null ? (
        <Flex direction="column" gap="2" align="start">
          <DataState kind="notCollected" />
          <Text size="2" color="gray">
            {t.purchase.boughtNotCollected(f.lei(DETAIL_MIN_VALUE))}
          </Text>
        </Flex>
      ) : (
        <>
          {detail.items.length === 0 ? (
            // The page was read, and SEAP lists no line on it.
            <Flex align="start">
              <DataState kind="notPublished" />
            </Flex>
          ) : (
            <Table.Root variant="surface" size="1">
              {/* Radix puts props on its wrapper, not the table: a caption names it. */}
              <VisuallyHidden asChild>
                <caption>{t.purchase.bought}</caption>
              </VisuallyHidden>
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeaderCell>
                    {t.purchase.item}
                  </Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell justify="end">
                    {t.purchase.quantity}
                  </Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell justify="end">
                    {t.purchase.itemValue}
                  </Table.ColumnHeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {detail.items.map((item, index) => {
                  // A line the supplier turned down is shown muted, and left out of the total.
                  const color = item.rejected ? 'gray' : undefined
                  return (
                    <Table.Row key={index}>
                      <Table.RowHeaderCell>
                        <Flex gap="2" align="center" wrap="wrap">
                          <Text color={color}>
                            {item.name ?? <DataState kind="notPublished" />}
                          </Text>
                          {item.rejected ? (
                            <Badge color="gray">
                              {t.purchase.itemRejected}
                            </Badge>
                          ) : null}
                        </Flex>
                      </Table.RowHeaderCell>
                      <Table.Cell justify="end">
                        {item.quantity === null ? (
                          <DataState kind="notPublished" />
                        ) : (
                          <Text color={color}>
                            {t.purchase.quantityOf(
                              f.quantity(item.quantity),
                              item.unit,
                            )}
                          </Text>
                        )}
                      </Table.Cell>
                      <Table.Cell justify="end">
                        {item.value === null ? (
                          <DataState kind="notPublished" />
                        ) : (
                          <Text color={color}>{f.leiExact(item.value)}</Text>
                        )}
                      </Table.Cell>
                    </Table.Row>
                  )
                })}
                {detail.items_value === null ? null : (
                  <Table.Row>
                    <Table.RowHeaderCell>
                      <Text weight="bold">{t.purchase.itemsTotal}</Text>
                    </Table.RowHeaderCell>
                    <Table.Cell />
                    <Table.Cell justify="end">
                      <Text weight="bold">
                        {f.leiExact(detail.items_value)}
                      </Text>
                    </Table.Cell>
                  </Table.Row>
                )}
              </Table.Body>
            </Table.Root>
          )}
          <SourceLine source={detail.source} />
        </>
      )}
    </Flex>
  )
}
