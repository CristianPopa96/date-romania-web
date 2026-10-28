import { useSuspenseQuery } from '@tanstack/react-query'

import type { Patch } from '#/components/list/filter-types'
import { ListEmpty } from '#/components/list/ListEmpty'
import { ListView } from '#/components/list/ListView'
import { PurchaseCharts } from '#/features/purchases/PurchaseCharts'
import { PurchaseRows } from '#/features/purchases/PurchaseRows'
import type { PurchaseOverview } from '#/features/purchases/api'
import { purchaseFilterDecls } from '#/features/purchases/filters'
import {
  PURCHASE_BY_API_PARAM,
  PURCHASE_COLUMNS,
  PURCHASE_FILTER_PARAMS,
  purchaseFileSearch,
  purchaseSort,
} from '#/features/purchases/list'
import type { PurchaseListSearch } from '#/features/purchases/list'
import {
  purchaseListQuery,
  purchaseOverviewQuery,
} from '#/features/purchases/queries'
import { useI18n } from '#/i18n/context'
import type { Messages } from '#/i18n'
import type { Role, Summary } from '#/lib/api'
import { ACCEPTED } from '#/lib/api'
import type { Format } from '#/lib/format'
import {
  chosenFilters,
  emptyHint,
  sortToParam,
  withoutFilters,
} from '#/lib/list'
import type { Sort } from '#/lib/list'

type Search = PurchaseListSearch & { pagina?: number }

// The direct purchases of one institution or supplier, declared to the list pattern
// (ListView): its filters, its summary line, two charts, its columns and its file.
export function PurchaseList<TSearch extends Search>({
  role,
  cui,
  search,
  held,
  onSearch,
}: {
  role: Role
  cui: number
  search: TSearch
  held: Summary | null
  onSearch: (search: TSearch) => void
}) {
  const { t, f } = useI18n()
  const { data: list } = useSuspenseQuery(purchaseListQuery(role, cui, search))
  const { data: overview } = useSuspenseQuery(
    purchaseOverviewQuery(role, cui, search),
  )
  if (!overview) return null

  // A change of filter or order goes back to the first page.
  const apply = (patch: Patch) =>
    onSearch({ ...search, ...patch, pagina: undefined })
  const sort = purchaseSort(search)
  const onSort = (next: Sort | null) =>
    apply({ ordine: next ? sortToParam(next, PURCHASE_COLUMNS) : undefined })
  const found = overview.summary
  const acceptedOnly = search.stare === String(ACCEPTED)
  const party = role === 'institutions' ? 'furnizor' : 'institutie'
  const back = emptyHint(overview.without, PURCHASE_BY_API_PARAM)

  return (
    <ListView
      search={{
        q: search.q,
        what: t.purchaseList.searchWhat[role],
        filters: purchaseFilterDecls({
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
        }),
        onApply: apply,
      }}
      summary={summaryLine(overview, acceptedOnly, t, f)}
      views={
        found.accepted > 0
          ? {
              charts: search.vedere !== 'tabel',
              onCharts: (charts) =>
                onSearch({ ...search, vedere: charts ? undefined : 'tabel' }),
            }
          : null
      }
      file={{
        href: `/achizitii-directe.csv?${new URLSearchParams(
          purchaseFileSearch(role, cui, search),
        ).toString()}`,
        rows: list.total,
      }}
      sort={{
        value: sort,
        columns: [
          { column: 'data', label: t.purchases.date },
          { column: 'valoare', label: t.purchases.value },
          {
            column: party,
            label:
              role === 'institutions'
                ? t.common.supplier
                : t.common.institution,
          },
        ],
        isDefault: search.ordine === undefined,
        onSort,
      }}
      charts={
        <PurchaseCharts
          role={role}
          search={search}
          overview={overview}
          onApply={apply}
        />
      }
      rows={
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
      }
      empty={
        <ListEmpty
          back={
            back
              ? {
                  label: t.purchaseList.filters[back.key],
                  rows: t.purchaseList.purchases(
                    back.count,
                    f.count(back.count),
                  ),
                  onRemove: () =>
                    onSearch(
                      withoutFilters(PURCHASE_FILTER_PARAMS, search, [
                        back.key,
                      ]),
                    ),
                }
              : null
          }
          onClear={
            chosenFilters(PURCHASE_FILTER_PARAMS, search).length
              ? () => onSearch(withoutFilters(PURCHASE_FILTER_PARAMS, search))
              : null
          }
        />
      }
      pager={{
        page: search.pagina ?? 1,
        size: search.pe_pagina ?? 25,
        total: list.total,
        onPage: (page) =>
          onSearch({ ...search, pagina: page > 1 ? page : undefined }),
        onSize: (next) => apply({ pe_pagina: next === 25 ? undefined : next }),
      }}
    />
  )
}

// "46 achiziții acceptate · 2,94 mil. lei fără TVA", and under it which part of the whole
// that is, over which days, and what is left out of the sum for being above its limit.
function summaryLine(
  overview: PurchaseOverview,
  acceptedOnly: boolean,
  t: Messages,
  f: Format,
) {
  const found = overview.summary
  const allAccepted =
    acceptedOnly || (found.accepted === found.purchases && found.purchases > 0)
  const days = f.span(found.first_day ?? null, found.last_day ?? null)
  return {
    headline: (
      <>
        {allAccepted
          ? t.purchaseList.acceptedOnly(found.accepted, f.count(found.accepted))
          : t.purchaseList.purchases(found.purchases, f.count(found.purchases))}
        {found.accepted > 0
          ? ` · ${
              allAccepted
                ? t.purchaseList.value(f.leiShort(found.value))
                : t.purchaseList.acceptedPart(
                    found.accepted,
                    f.count(found.accepted),
                    f.leiShort(found.value),
                  )
            }`
          : null}
      </>
    ),
    detail: (
      <>
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
      </>
    ),
  }
}
