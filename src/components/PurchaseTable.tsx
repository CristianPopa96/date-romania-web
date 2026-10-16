import { useSuspenseQuery } from '@tanstack/react-query'
import { Link as RouterLink } from '@tanstack/react-router'
import { ExternalLinkIcon } from '@radix-ui/react-icons'
import {
  Badge,
  Box,
  Code,
  Flex,
  Heading,
  Link,
  SegmentedControl,
  Table,
  Text,
} from '@radix-ui/themes'

import { DataState } from '#/components/DataState'
import { EntityLink } from '#/components/EntityLink'
import { Pager } from '#/components/Pager'
import { useI18n } from '#/i18n/context'
import { rich } from '#/i18n/rich'
import { ACCEPTED, PAGE_SIZE } from '#/lib/api'
import type { Purchase, Role } from '#/lib/api'
import { purchasesQuery } from '#/lib/queries'
import type { EntitySearch } from '#/lib/urls'

// The direct purchases of one institution or supplier, a page at a time.
export function PurchaseTable({
  role,
  cui,
  search,
  onSearch,
}: {
  role: Role
  cui: number
  search: EntitySearch
  onSearch: (search: EntitySearch) => void
}) {
  const { t, f } = useI18n()
  const page = search.pagina ?? 1
  const byValue = search.ordine === 'valoare'
  const { data: purchases } = useSuspenseQuery(
    purchasesQuery(role, cui, page, byValue),
  )
  const other: Role = role === 'institutions' ? 'suppliers' : 'institutions'
  const pages = Math.max(Math.ceil(purchases.total / PAGE_SIZE), 1)

  return (
    <Flex direction="column" gap="3">
      <Flex justify="between" align="center" gap="3" wrap="wrap">
        <Heading size="4">
          {t.purchases.heading(
            byValue ? t.purchases.titleAccepted : t.purchases.title,
            f.count(purchases.total),
          )}
        </Heading>
        <SegmentedControl.Root
          size="1"
          value={byValue ? 'valoare' : 'recente'}
          onValueChange={(value) =>
            onSearch({
              lista: search.lista,
              ordine: value === 'valoare' ? 'valoare' : undefined,
            })
          }
        >
          <SegmentedControl.Item value="recente">
            {t.purchases.newest}
          </SegmentedControl.Item>
          <SegmentedControl.Item value="valoare">
            {t.purchases.largest}
          </SegmentedControl.Item>
        </SegmentedControl.Root>
      </Flex>

      <Table.Root variant="surface" size="1">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>{t.purchases.date}</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>
              {t.purchases.purchase}
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>
              {/* The column that names the other side of each purchase. */}
              {role === 'institutions'
                ? t.common.supplier
                : t.common.institution}
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>{t.purchases.state}</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell justify="end">
              {t.purchases.value}
            </Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {purchases.items.map((purchase) => (
            <PurchaseRow key={purchase.id} purchase={purchase} other={other} />
          ))}
        </Table.Body>
      </Table.Root>

      <Pager
        page={page}
        pages={pages}
        onPage={(next) =>
          onSearch({ ...search, pagina: next > 1 ? next : undefined })
        }
      />
    </Flex>
  )
}

function PurchaseRow({ purchase, other }: { purchase: Purchase; other: Role }) {
  const party = other === 'suppliers' ? purchase.supplier : purchase.buyer
  const partyText =
    other === 'suppliers' ? purchase.supplier_text : purchase.buyer_text
  const accepted = purchase.state_id === ACCEPTED
  const { t, f } = useI18n()

  return (
    <Table.Row>
      <Table.Cell style={{ whiteSpace: 'nowrap' }}>
        {purchase.finalized_at ? (
          f.day(purchase.finalized_at)
        ) : (
          <DataState kind="notPublished" />
        )}
      </Table.Cell>
      <Table.Cell>
        <Box style={{ maxWidth: 360 }}>
          <Text as="div" size="2">
            <Link asChild>
              <RouterLink
                to="/achizitii-directe/$id"
                params={{ id: String(purchase.id) }}
              >
                {purchase.name ?? t.common.notPublished}
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
        </Box>
      </Table.Cell>
      <Table.Cell>
        {party ? (
          <EntityLink role={other} cui={party.cui}>
            {party.name}
          </EntityLink>
        ) : (
          (partyText ?? t.common.notPublished)
        )}
      </Table.Cell>
      <Table.Cell>
        {/* Green marks a finished deal, not a verdict. */}
        <Badge color={accepted ? 'green' : 'gray'}>
          {(purchase.state_id && t.purchases.states[purchase.state_id]) ||
            purchase.state ||
            t.common.notPublished}
        </Badge>
      </Table.Cell>
      <Table.Cell justify="end" style={{ whiteSpace: 'nowrap' }}>
        {purchase.value === null ? (
          t.common.notPublished
        ) : accepted ? (
          f.lei(purchase.value)
        ) : (
          // An offer that was refused or never answered is not money spent.
          <Text color="gray">{f.lei(purchase.value)}</Text>
        )}
        {!accepted && purchase.value !== null ? (
          <Text as="div" size="1" color="gray">
            {t.purchases.notAccepted}
          </Text>
        ) : null}
        {accepted && purchase.above_limit ? (
          <Text as="div" size="1" color="amber">
            {t.purchases.aboveLimit}
          </Text>
        ) : null}
      </Table.Cell>
    </Table.Row>
  )
}
