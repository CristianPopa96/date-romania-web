import { Link as RouterLink } from '@tanstack/react-router'
import { ExternalLinkIcon } from '@radix-ui/react-icons'
import { Badge, Box, Code, Flex, Link, Text } from '@radix-ui/themes'

import { DataState } from '#/components/DataState'
import { EntityLink } from '#/components/EntityLink'
import { ListRows } from '#/components/list/ListRows'
import type { Column } from '#/components/list/ListRows'
import { useI18n } from '#/i18n/context'
import { rich } from '#/i18n/rich'
import { ACCEPTED } from '#/lib/api'
import type { Purchase } from '#/features/purchases/api'
import type { Role } from '#/lib/api'
import { marks } from '#/lib/list'
import type { Sort } from '#/lib/list'

// The rows of a list of direct purchases, declared to ListRows: the columns of the table
// (day, purchase, the other party, state, value) and on a phone a card per purchase with
// its value on the right. `total` is the row under the table, given only when every row is
// one kind of money. The list of every accepted purchase (`every`) shows both parties and
// no state: every row is accepted.
export function PurchaseRows({
  role,
  every = false,
  items,
  q,
  sort,
  onSort,
  total,
}: {
  role: Role
  every?: boolean
  items: Array<Purchase>
  q: string | undefined
  sort: Sort
  onSort: (sort: Sort | null) => void
  total: { label: string; value: string } | null
}) {
  const { t } = useI18n()
  const other: Role = role === 'institutions' ? 'suppliers' : 'institutions'
  const columns: Array<Column<Purchase>> = [
    {
      key: 'data',
      header: t.purchases.date,
      sort: { column: 'data' },
      nowrap: true,
      cell: (purchase) => <Day purchase={purchase} />,
    },
    {
      key: 'achizitie',
      header: t.purchases.purchase,
      maxWidth: 360,
      cell: (purchase) => <Title purchase={purchase} q={q} />,
    },
    {
      key: 'parte',
      header:
        role === 'institutions' ? t.common.supplier : t.common.institution,
      sort: {
        column: role === 'institutions' ? 'furnizor' : 'institutie',
        text: true,
      },
      cell: (purchase) => <Party purchase={purchase} other={other} />,
    },
    every
      ? {
          key: 'institutie',
          header: t.common.institution,
          sort: { column: 'institutie', text: true },
          cell: (purchase) => (
            <Party purchase={purchase} other="institutions" />
          ),
        }
      : {
          key: 'stare',
          header: t.purchases.state,
          cell: (purchase) => <State purchase={purchase} />,
        },
    {
      key: 'valoare',
      header: t.purchases.value,
      sort: { column: 'valoare' },
      align: 'end',
      nowrap: true,
      cell: (purchase) => <Value purchase={purchase} />,
    },
  ]
  return (
    <ListRows
      columns={columns}
      rows={items}
      rowKey={(purchase) => purchase.id}
      sort={sort}
      onSort={onSort}
      total={total}
      card={(purchase) => (
        <Flex justify="between" gap="3">
          <Box minWidth="0">
            <Title purchase={purchase} q={q} />
            <Text as="div" size="1" color="gray" mt="1">
              <Day purchase={purchase} /> ·{' '}
              <Party purchase={purchase} other={other} />
            </Text>
            <Box mt="1">
              {every ? (
                <Text size="1" color="gray">
                  <Party purchase={purchase} other="institutions" />
                </Text>
              ) : (
                <State purchase={purchase} />
              )}
            </Box>
          </Box>
          <Box style={{ whiteSpace: 'nowrap', textAlign: 'right' }}>
            <Value purchase={purchase} />
          </Box>
        </Flex>
      )}
    />
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
