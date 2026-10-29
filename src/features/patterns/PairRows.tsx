import { Link as RouterLink } from '@tanstack/react-router'
import { Box, Code, Flex, Link, Text } from '@radix-ui/themes'

import { DataState } from '#/components/DataState'
import { EntityLink } from '#/components/EntityLink'
import { ListRows } from '#/components/list/ListRows'
import type { Column } from '#/components/list/ListRows'
import type { NearLimitPair, NearLimitPurchase } from '#/features/patterns/api'
import { shareOfLimit } from '#/features/patterns/near-limit'
import { useI18n } from '#/i18n/context'
import type { Sort } from '#/lib/list'

// The pairs of the "just under the limit" pattern, declared to ListRows: the buyer and the
// supplier (each opens its page), the fact with each purchase under it, and their value.
export function PairRows({
  items,
  sort,
  onSort,
}: {
  items: Array<NearLimitPair>
  sort: Sort
  onSort: (sort: Sort | null) => void
}) {
  const { t, f } = useI18n()
  const words = t.rankings.patterns.nearLimit
  const columns: Array<Column<NearLimitPair>> = [
    {
      key: 'cumparator',
      header: words.buyer,
      maxWidth: 260,
      cell: (pair) => (
        <EntityLink role="institutions" cui={pair.buyer.cui}>
          {pair.buyer.name}
        </EntityLink>
      ),
    },
    {
      key: 'furnizor',
      header: words.supplier,
      maxWidth: 260,
      cell: (pair) => (
        <EntityLink role="suppliers" cui={pair.supplier.cui}>
          {pair.supplier.name}
        </EntityLink>
      ),
    },
    {
      key: 'achizitii',
      header: words.purchases,
      sort: { column: 'achizitii' },
      cell: (pair) => <Fact pair={pair} />,
    },
    {
      key: 'valoare',
      header: words.value,
      sort: { column: 'valoare' },
      align: 'end',
      nowrap: true,
      cell: (pair) => <>{f.lei(pair.value)}</>,
    },
  ]
  return (
    <ListRows
      columns={columns}
      rows={items}
      rowKey={(pair) =>
        `${pair.buyer.cui}-${pair.supplier.cui}-${pair.contract_type}`
      }
      sort={sort}
      onSort={onSort}
      total={null}
      card={(pair) => (
        <Flex direction="column" gap="1">
          <Flex justify="between" gap="3">
            <Box minWidth="0">
              <EntityLink role="institutions" cui={pair.buyer.cui}>
                {pair.buyer.name}
              </EntityLink>
              <Text as="div" size="2">
                <EntityLink role="suppliers" cui={pair.supplier.cui}>
                  {pair.supplier.name}
                </EntityLink>
              </Text>
            </Box>
            <Box style={{ whiteSpace: 'nowrap', textAlign: 'right' }}>
              {f.lei(pair.value)}
            </Box>
          </Flex>
          <Fact pair={pair} />
        </Flex>
      )}
    />
  )
}

function Fact({ pair }: { pair: NearLimitPair }) {
  const { t, f } = useI18n()
  const words = t.rankings.patterns.nearLimit
  return (
    <>
      <Text as="div" size="2">
        {words.fact(
          pair.purchases,
          f.count(pair.purchases),
          words.types[pair.contract_type],
          f.lei(pair.limit),
        )}
      </Text>
      <Flex direction="column" gap="1" mt="1">
        {pair.items.map((purchase) => (
          <PurchaseLine
            key={purchase.id}
            purchase={purchase}
            limit={pair.limit}
          />
        ))}
      </Flex>
    </>
  )
}

function PurchaseLine({
  purchase,
  limit,
}: {
  purchase: NearLimitPurchase
  limit: number
}) {
  const { t, f } = useI18n()
  const words = t.rankings.patterns.nearLimit
  return (
    <Text size="1" color="gray" style={{ whiteSpace: 'nowrap' }}>
      <Link asChild>
        <RouterLink
          to="/achizitii-directe/$id"
          params={{ id: String(purchase.id) }}
        >
          <Code variant="ghost">{purchase.code ?? purchase.id}</Code>
        </RouterLink>
      </Link>
      {' · '}
      {purchase.finalized_at ? (
        f.day(purchase.finalized_at)
      ) : (
        <DataState kind="notPublished" />
      )}
      {' · '}
      {f.leiExact(purchase.value)}
      {' · '}
      {words.ofLimit(f.percent(shareOfLimit(purchase.value, limit), 1))}
    </Text>
  )
}
