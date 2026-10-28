import { Box, Button, Flex, Select, Text } from '@radix-ui/themes'

import { useI18n } from '#/i18n/context'
import type { Role } from '#/lib/api'
import type { PurchaseOverview } from '#/features/purchases/api'
import { sortToParam } from '#/lib/list'
import type { Sort } from '#/lib/list'
import {
  PURCHASE_COLUMNS,
  chosenFilters,
  filterOfApiParam,
  withoutFilters,
} from '#/features/purchases/list'
import type { EntitySearch } from '#/features/entities'

// The parts of the list of direct purchases that are not the list: the order as a select
// on a phone, and what the list says when its filters leave nothing.

// On a phone the headers are gone: the order is a select.
export function SortSelect({
  role,
  sort,
  onSort,
}: {
  role: Role
  sort: Sort
  onSort: (sort: Sort | null) => void
}) {
  const { t } = useI18n()
  const party = role === 'institutions' ? 'furnizor' : 'institutie'
  const columns = [
    ['data', t.purchases.date],
    ['valoare', t.purchases.value],
    [party, role === 'institutions' ? t.common.supplier : t.common.institution],
  ] as const
  const value =
    sortToParam(sort, PURCHASE_COLUMNS) === 'data'
      ? 'default'
      : `${sort.column}:${sort.dir}`
  return (
    <Box display={{ initial: 'block', sm: 'none' }}>
      <Select.Root
        size="1"
        value={value}
        onValueChange={(next) => {
          if (next === 'default') return onSort(null)
          const [column, dir] = next.split(':')
          onSort({ column, dir: dir === 'asc' ? 'asc' : 'desc' })
        }}
      >
        <Select.Trigger aria-label={t.list.sort.label} />
        <Select.Content>
          <Select.Item value="default">{t.list.sort.default}</Select.Item>
          {columns.flatMap(([column, label]) => [
            <Select.Item key={`${column}:desc`} value={`${column}:desc`}>
              {t.list.sort.desc(label)}
            </Select.Item>,
            <Select.Item key={`${column}:asc`} value={`${column}:asc`}>
              {t.list.sort.asc(label)}
            </Select.Item>,
          ])}
        </Select.Content>
      </Select.Root>
    </Box>
  )
}

// Nothing found: the one filter whose removal gives rows back, with how many, and a button
// that removes it.
export function PurchaseEmpty({
  search,
  overview,
  onSearch,
}: {
  search: EntitySearch
  overview: PurchaseOverview
  onSearch: (search: EntitySearch) => void
}) {
  const { t, f } = useI18n()
  const back = overview.without
    .map((each) => ({
      key: filterOfApiParam(each.param),
      purchases: each.purchases,
    }))
    .find((each) => each.key !== undefined && each.purchases > 0)
  const key = back?.key
  const label = key ? t.purchaseList.filters[key] : null
  return (
    <Flex direction="column" gap="2" align="start" py="4">
      <Text size="2">{t.list.empty}</Text>
      {back && key && label ? (
        <>
          <Text size="2" color="gray">
            {t.list.without(
              label,
              t.purchaseList.purchases(back.purchases, f.count(back.purchases)),
            )}
          </Text>
          <Button
            variant="soft"
            size="1"
            onClick={() =>
              onSearch({ ...withoutFilters(search, [key]), pagina: undefined })
            }
          >
            {t.list.remove(label)}
          </Button>
        </>
      ) : chosenFilters(search).length ? (
        <Button
          variant="soft"
          size="1"
          onClick={() =>
            onSearch({ ...withoutFilters(search), pagina: undefined })
          }
        >
          {t.list.clear}
        </Button>
      ) : null}
    </Flex>
  )
}
