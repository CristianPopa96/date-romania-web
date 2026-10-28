import { Link as RouterLink } from '@tanstack/react-router'
import { ExternalLinkIcon } from '@radix-ui/react-icons'
import {
  Badge,
  Box,
  Card,
  Code,
  Flex,
  Link,
  Table,
  Text,
} from '@radix-ui/themes'

import { DataState } from '#/components/DataState'
import { EntityLink } from '#/components/EntityLink'
import { SortHeader } from '#/components/list/SortHeader'
import { useI18n } from '#/i18n/context'
import { rich } from '#/i18n/rich'
import { ACCEPTED } from '#/lib/api'
import type { Purchase } from '#/features/purchases/api'
import type { Role } from '#/lib/api'
import { marks } from '#/lib/list'
import type { Sort } from '#/lib/list'

// The rows of a list of direct purchases: a table with sortable headers, and on a phone a
// card per purchase with its value on the right. `total` is the row under the table, given
// only when every row is one kind of money.
export function PurchaseRows({
  role,
  items,
  q,
  sort,
  onSort,
  total,
}: {
  role: Role
  items: Array<Purchase>
  q: string | undefined
  sort: Sort
  onSort: (sort: Sort | null) => void
  total: { label: string; value: string } | null
}) {
  const { t } = useI18n()
  const other: Role = role === 'institutions' ? 'suppliers' : 'institutions'
  return (
    <>
      <Box display={{ initial: 'none', sm: 'block' }}>
        <Table.Root variant="surface" size="1">
          <Table.Header>
            <Table.Row>
              <SortHeader column="data" sort={sort} onSort={onSort}>
                {t.purchases.date}
              </SortHeader>
              <Table.ColumnHeaderCell>
                {t.purchases.purchase}
              </Table.ColumnHeaderCell>
              <SortHeader
                column={role === 'institutions' ? 'furnizor' : 'institutie'}
                sort={sort}
                text
                onSort={onSort}
              >
                {role === 'institutions'
                  ? t.common.supplier
                  : t.common.institution}
              </SortHeader>
              <Table.ColumnHeaderCell>
                {t.purchases.state}
              </Table.ColumnHeaderCell>
              <SortHeader
                column="valoare"
                sort={sort}
                justify="end"
                onSort={onSort}
              >
                {t.purchases.value}
              </SortHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {items.map((purchase) => (
              <Table.Row key={purchase.id}>
                <Table.Cell style={{ whiteSpace: 'nowrap' }}>
                  <Day purchase={purchase} />
                </Table.Cell>
                <Table.Cell>
                  <Box style={{ maxWidth: 360 }}>
                    <Title purchase={purchase} q={q} />
                  </Box>
                </Table.Cell>
                <Table.Cell>
                  <Party purchase={purchase} other={other} />
                </Table.Cell>
                <Table.Cell>
                  <State purchase={purchase} />
                </Table.Cell>
                <Table.Cell justify="end" style={{ whiteSpace: 'nowrap' }}>
                  <Value purchase={purchase} />
                </Table.Cell>
              </Table.Row>
            ))}
            {total ? (
              <Table.Row>
                <Table.Cell colSpan={4}>
                  <Text weight="medium">{total.label}</Text>
                </Table.Cell>
                <Table.Cell justify="end" style={{ whiteSpace: 'nowrap' }}>
                  <Text weight="bold">{total.value}</Text>
                </Table.Cell>
              </Table.Row>
            ) : null}
          </Table.Body>
        </Table.Root>
      </Box>
      <Flex
        direction="column"
        gap="2"
        display={{ initial: 'flex', sm: 'none' }}
      >
        {items.map((purchase) => (
          <Card key={purchase.id} size="1">
            <Flex justify="between" gap="3">
              <Box minWidth="0">
                <Title purchase={purchase} q={q} />
                <Text as="div" size="1" color="gray" mt="1">
                  <Day purchase={purchase} /> ·{' '}
                  <Party purchase={purchase} other={other} />
                </Text>
                <Box mt="1">
                  <State purchase={purchase} />
                </Box>
              </Box>
              <Box style={{ whiteSpace: 'nowrap', textAlign: 'right' }}>
                <Value purchase={purchase} />
              </Box>
            </Flex>
          </Card>
        ))}
        {total ? (
          <Flex justify="between" gap="3" px="2">
            <Text size="2" weight="medium">
              {total.label}
            </Text>
            <Text size="2" weight="bold">
              {total.value}
            </Text>
          </Flex>
        ) : null}
      </Flex>
    </>
  )
}

function Day({ purchase }: { purchase: Purchase }) {
  const { f } = useI18n()
  return purchase.finalized_at ? (
    <>{f.day(purchase.finalized_at)}</>
  ) : (
    <DataState kind="notPublished" />
  )
}

// The name with the words searched marked, then its code in SEAP and its CPV code.
function Title({ purchase, q }: { purchase: Purchase; q: string | undefined }) {
  const { t } = useI18n()
  return (
    <>
      <Text as="div" size="2">
        <Link asChild>
          <RouterLink
            to="/achizitii-directe/$id"
            params={{ id: String(purchase.id) }}
          >
            {purchase.name
              ? marks(purchase.name, q).map((part, index) =>
                  part.mark ? (
                    <mark key={index} className="dr-mark">
                      {part.text}
                    </mark>
                  ) : (
                    part.text
                  ),
                )
              : t.common.notPublished}
          </RouterLink>
        </Link>
      </Text>
      <Flex gap="2" align="center" wrap="wrap">
        {purchase.source.url ? (
          <Link
            href={purchase.source.url}
            target="_blank"
            rel="noreferrer"
            size="1"
          >
            <Flex align="center" gap="1">
              <ExternalLinkIcon />
              {rich(t.purchases.seapLink, {
                code: (
                  <Code key="code" variant="ghost">
                    {purchase.code}
                  </Code>
                ),
              })}
            </Flex>
          </Link>
        ) : null}
        {purchase.cpv_code ? (
          <Text size="1" color="gray">
            {rich(t.common.cpv, {
              code: (
                <Code key="code" variant="ghost">
                  {purchase.cpv_code}
                </Code>
              ),
            })}
          </Text>
        ) : null}
      </Flex>
    </>
  )
}

function Party({ purchase, other }: { purchase: Purchase; other: Role }) {
  const { t } = useI18n()
  const party = other === 'suppliers' ? purchase.supplier : purchase.buyer
  const text =
    other === 'suppliers' ? purchase.supplier_text : purchase.buyer_text
  return party ? (
    <EntityLink role={other} cui={party.cui}>
      {party.name}
    </EntityLink>
  ) : (
    <>{text ?? t.common.notPublished}</>
  )
}

function State({ purchase }: { purchase: Purchase }) {
  const { t } = useI18n()
  // Green marks a finished deal, not a verdict.
  return (
    <Badge color={purchase.state_id === ACCEPTED ? 'green' : 'gray'}>
      {(purchase.state_id && t.purchases.states[purchase.state_id]) ||
        purchase.state ||
        t.common.notPublished}
    </Badge>
  )
}

function Value({ purchase }: { purchase: Purchase }) {
  const { t, f } = useI18n()
  const accepted = purchase.state_id === ACCEPTED
  if (purchase.value === null) return <>{t.common.notPublished}</>
  return (
    <>
      {accepted ? (
        f.lei(purchase.value)
      ) : (
        // An offer that was refused or never answered is not money spent.
        <Text color="gray">{f.lei(purchase.value)}</Text>
      )}
      {!accepted ? (
        <Text as="div" size="1" color="gray">
          {t.purchases.notAccepted}
        </Text>
      ) : null}
      {accepted && purchase.above_limit ? (
        <Text as="div" size="1" color="amber">
          {t.purchases.aboveLimit}
        </Text>
      ) : null}
    </>
  )
}
