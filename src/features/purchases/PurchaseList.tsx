import { useSuspenseQuery } from '@tanstack/react-query'
import { useRouterState } from '@tanstack/react-router'
import { DownloadIcon } from '@radix-ui/react-icons'
import { Box, Button, Flex, SegmentedControl, Text } from '@radix-ui/themes'

import { FilterBar } from '#/components/list/FilterBar'
import type { Patch } from '#/components/list/filter-types'
import { ListPager } from '#/components/list/ListPager'
import { PurchaseCharts } from '#/features/purchases/PurchaseCharts'
import {
  PurchaseEmpty,
  SortSelect,
} from '#/features/purchases/PurchaseListParts'
import { PurchaseRows } from '#/features/purchases/PurchaseRows'
import { useI18n } from '#/i18n/context'
import type { Role, Summary } from '#/lib/api'
import { ACCEPTED } from '#/lib/api'
import { sortToParam } from '#/lib/list'
import type { Sort } from '#/lib/list'
import { purchaseFilterDecls } from '#/features/purchases/filters'
import {
  PURCHASE_COLUMNS,
  purchaseFileSearch,
  purchaseSort,
} from '#/features/purchases/list'
import {
  purchaseListQuery,
  purchaseOverviewQuery,
} from '#/features/purchases/queries'
import type { EntitySearch } from '#/features/entities'

// The direct purchases of one institution or supplier, in the list pattern (DataTable in
// the design system): the filter bar, a summary line, two charts, the table with its
// sortable columns, the pager. Everything chosen lives in the address.
export function PurchaseList({
  role,
  cui,
  search,
  held,
  onSearch,
}: {
  role: Role
  cui: number
  search: EntitySearch
  held: Summary | null
  onSearch: (search: EntitySearch) => void
}) {
  const { t, f } = useI18n()
  const { data: list } = useSuspenseQuery(purchaseListQuery(role, cui, search))
  const { data: overview } = useSuspenseQuery(
    purchaseOverviewQuery(role, cui, search),
  )
  // While the next rows load, the ones shown stay, dimmed: no jump.
  const loading = useRouterState({ select: (state) => state.isLoading })
  if (!overview) return null

  // A change of filter or order goes back to the first page.
  const apply = (patch: Patch) =>
    onSearch({ ...search, ...patch, pagina: undefined })
  const sort = purchaseSort(search)
  const onSort = (next: Sort | null) =>
    apply({ ordine: next ? sortToParam(next, PURCHASE_COLUMNS) : undefined })
  const size = search.pe_pagina ?? 25
  const found = overview.summary
  const acceptedOnly = search.stare === String(ACCEPTED)
  const charts = search.vedere !== 'tabel'
  const filters = purchaseFilterDecls({
    role,
    cui,
    search,
    overview,
    items: list.items,
    held:
      held?.first_day && held.last_day
        ? { first: held.first_day, last: held.last_day }
        : null,
    t,
    f,
  })
  const days = f.span(found.first_day ?? null, found.last_day ?? null)
  const fileHref = `/achizitii-directe.csv?${new URLSearchParams(
    purchaseFileSearch(role, cui, search),
  ).toString()}`

  return (
    <Flex direction="column" gap="4">
      <FilterBar
        q={search.q}
        searchWhat={t.purchaseList.searchWhat[role]}
        filters={filters}
        onApply={apply}
      />

      <Flex
        justify="between"
        align="end"
        gap="3"
        wrap="wrap"
        className={loading ? 'dr-dim' : undefined}
      >
        <Box>
          <Text as="div" size="3" weight="medium">
            {acceptedOnly ||
            (found.accepted === found.purchases && found.purchases > 0)
              ? t.purchaseList.acceptedOnly(
                  found.accepted,
                  f.count(found.accepted),
                )
              : t.purchaseList.purchases(
                  found.purchases,
                  f.count(found.purchases),
                )}
            {found.accepted > 0
              ? ` · ${
                  acceptedOnly || found.accepted === found.purchases
                    ? t.purchaseList.value(f.leiShort(found.value))
                    : t.purchaseList.acceptedPart(
                        found.accepted,
                        f.count(found.accepted),
                        f.leiShort(found.value),
                      )
                }`
              : null}
          </Text>
          <Text as="div" size="1" color="gray">
            {t.purchaseList.of(
              f.count(overview.whole),
              days ? t.period.range(days.from, days.to) : null,
            )}
            {found.above_limit > 0
              ? ` · ${t.purchaseList.aboveLimit(
                  found.above_limit,
                  f.count(found.above_limit),
                  f.lei(found.above_limit_value),
                )}`
              : null}
          </Text>
        </Box>
        <Flex gap="2" align="center" wrap="wrap">
          {found.accepted > 0 ? (
            <SegmentedControl.Root
              size="1"
              aria-label={t.list.views.label}
              value={charts ? 'grafic' : 'tabel'}
              onValueChange={(value) =>
                onSearch({
                  ...search,
                  vedere: value === 'tabel' ? 'tabel' : undefined,
                })
              }
            >
              <SegmentedControl.Item value="grafic">
                {t.list.views.charts}
              </SegmentedControl.Item>
              <SegmentedControl.Item value="tabel">
                {t.list.views.table}
              </SegmentedControl.Item>
            </SegmentedControl.Root>
          ) : null}
          {list.total > 0 ? (
            <Button asChild variant="soft" size="1">
              <a href={fileHref} download>
                <DownloadIcon />
                {t.list.export(list.total, f.count(list.total))}
              </a>
            </Button>
          ) : null}
          <SortSelect role={role} sort={sort} onSort={onSort} />
        </Flex>
      </Flex>

      {charts && found.accepted > 0 ? (
        <PurchaseCharts
          role={role}
          search={search}
          overview={overview}
          onApply={apply}
        />
      ) : null}

      {list.total === 0 ? (
        <PurchaseEmpty
          search={search}
          overview={overview}
          onSearch={onSearch}
        />
      ) : (
        <Box className={loading ? 'dr-dim' : undefined}>
          <PurchaseRows
            role={role}
            items={list.items}
            q={search.q}
            sort={sort}
            onSort={onSort}
            total={
              acceptedOnly
                ? {
                    label: t.purchaseList.total(
                      found.accepted,
                      f.count(found.accepted),
                    ),
                    value: f.lei(found.value),
                  }
                : null
            }
          />
        </Box>
      )}

      <ListPager
        page={search.pagina ?? 1}
        size={size}
        total={list.total}
        onPage={(page) =>
          onSearch({ ...search, pagina: page > 1 ? page : undefined })
        }
        onSize={(next) => apply({ pe_pagina: next === 25 ? undefined : next })}
      />
    </Flex>
  )
}
