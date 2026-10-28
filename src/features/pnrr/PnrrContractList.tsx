import { useSuspenseQuery } from '@tanstack/react-query'
import { Text } from '@radix-ui/themes'

import type { Patch } from '#/components/list/filter-types'
import { ListEmpty } from '#/components/list/ListEmpty'
import { ListView } from '#/components/list/ListView'
import { PnrrContractCharts } from '#/features/pnrr/PnrrContractCharts'
import { PnrrContractRows } from '#/features/pnrr/PnrrContractRows'
import { pnrrFilterDecls } from '#/features/pnrr/filters'
import {
  PNRR_BY_API_PARAM,
  PNRR_COLUMNS,
  PNRR_FILTER_PARAMS,
  pnrrSort,
} from '#/features/pnrr/list'
import type { PnrrListSearch } from '#/features/pnrr/list'
import { pnrrListQuery, pnrrOverviewQuery } from '#/features/pnrr/queries'
import { useI18n } from '#/i18n/context'
import {
  chosenFilters,
  emptyHint,
  sortToParam,
  withoutFilters,
} from '#/lib/list'
import type { Sort } from '#/lib/list'

type Search = PnrrListSearch & { pagina?: number }

// The PNRR contracts of one beneficiary, declared to the list pattern (ListView): its
// filters, its summary line, two charts and its columns. All are of one dashboard edition,
// so their values may be added.
export function PnrrContractList<TSearch extends Search>({
  cui,
  edition,
  search,
  onSearch,
}: {
  cui: number
  // The day of the dashboard edition the contracts are read from.
  edition: string
  search: TSearch
  onSearch: (search: TSearch) => void
}) {
  const { t, f } = useI18n()
  const { data: list } = useSuspenseQuery(pnrrListQuery(cui, search))
  const { data: overview } = useSuspenseQuery(pnrrOverviewQuery(cui, search))
  if (list === 'failed' || overview === 'failed' || !overview) {
    return (
      <Text size="2" color="gray">
        {t.eu.held.failed}
      </Text>
    )
  }

  // A change of filter or order goes back to the first page.
  const apply = (patch: Patch) =>
    onSearch({ ...search, ...patch, pagina: undefined })
  const sort = pnrrSort(search)
  const onSort = (next: Sort | null) =>
    apply({ ordine: next ? sortToParam(next, PNRR_COLUMNS) : undefined })
  const q = search.q === undefined ? undefined : String(search.q)
  const back = emptyHint(overview.without, PNRR_BY_API_PARAM)
  const found = overview.summary
  const l = t.pnrr.list

  return (
    <ListView
      title={l.title}
      search={{
        q,
        what: l.searchWhat,
        filters: pnrrFilterDecls({ search, overview, t, f }),
        onApply: apply,
      }}
      summary={{
        headline: (
          <>
            {l.contracts(found.contracts, f.count(found.contracts))}
            {found.contracts > 0 && found.value !== null
              ? ` · ${l.value(f.leiShort(found.value))}`
              : null}
          </>
        ),
        detail: (
          <>
            {l.of(f.count(overview.whole), f.day(edition))}
            {overview.measures_differ > 0
              ? ` · ${l.differ(
                  overview.measures_differ,
                  f.count(overview.measures_differ),
                )}`
              : null}
          </>
        ),
      }}
      views={
        found.contracts > 0
          ? {
              charts: search.vedere !== 'tabel',
              onCharts: (charts) =>
                onSearch({ ...search, vedere: charts ? undefined : 'tabel' }),
            }
          : null
      }
      file={null}
      sort={{
        value: sort,
        columns: [
          { column: 'valoare', label: t.pnrr.value },
          { column: 'progres', label: t.pnrr.physical },
        ],
        isDefault: search.ordine === undefined,
        onSort,
      }}
      charts={
        <PnrrContractCharts
          search={search}
          overview={overview}
          onApply={apply}
        />
      }
      rows={
        <PnrrContractRows
          items={list.items}
          q={q}
          sort={sort}
          onSort={onSort}
          total={
            found.contracts > 0 && found.value !== null
              ? {
                  label: l.total(found.contracts, f.count(found.contracts)),
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
                  label: l.filters[back.key],
                  rows: l.contracts(back.count, f.count(back.count)),
                  onRemove: () =>
                    onSearch(
                      withoutFilters(PNRR_FILTER_PARAMS, search, [back.key]),
                    ),
                }
              : null
          }
          onClear={
            chosenFilters(PNRR_FILTER_PARAMS, search).length
              ? () => onSearch(withoutFilters(PNRR_FILTER_PARAMS, search))
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
