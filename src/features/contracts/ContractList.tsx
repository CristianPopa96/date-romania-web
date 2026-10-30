import { useSuspenseQuery } from '@tanstack/react-query'
import { Text } from '@radix-ui/themes'

import type { Patch } from '#/components/list/filter-types'
import { ListEmpty } from '#/components/list/ListEmpty'
import { ListView } from '#/components/list/ListView'
import { ContractCharts } from '#/features/contracts/ContractCharts'
import { ContractRows } from '#/features/contracts/ContractRows'
import type { ContractOverview } from '#/features/contracts/api-list'
import { contractFilterDecls } from '#/features/contracts/filters'
import {
  CONTRACT_BY_API_PARAM,
  CONTRACT_COLUMNS,
  CONTRACT_FILTER_PARAMS,
  contractFileSearch,
  contractSort,
} from '#/features/contracts/list'
import type { ContractListSearch, Won } from '#/features/contracts/list'
import {
  contractListQuery,
  contractOverviewQuery,
} from '#/features/contracts/queries'
import { useI18n } from '#/i18n/context'
import type { Messages } from '#/i18n'
import type { Role } from '#/lib/api'
import type { Format } from '#/lib/format'
import {
  chosenFilters,
  emptyHint,
  sortToParam,
  withoutFilters,
} from '#/lib/list'
import type { Sort } from '#/lib/list'

type Search = ContractListSearch & { pagina?: number }

// The contracts of one institution or company, declared to the list pattern (ListView):
// its filters, its summary line, two charts, its columns and its file. A company's list is
// one way of winning at a time (`won`), never the two added. With no CUI, the list of every
// contract, the largest first (Clasamente, "Contracte"): with a company chosen it holds
// both ways of winning, and a sum only once one is chosen (Q69).
export function ContractList<TSearch extends Search>({
  role,
  cui,
  search,
  won,
  title,
  onSearch,
}: {
  role: Role
  cui: number | null
  search: TSearch
  won: Won | undefined
  title?: string
  onSearch: (search: TSearch) => void
}) {
  const { t, f } = useI18n()
  const { data: list } = useSuspenseQuery(
    contractListQuery(role, cui, search, won),
  )
  const { data: overview } = useSuspenseQuery(
    contractOverviewQuery(role, cui, search, won),
  )
  // Not answered, or not found: the tab says so, the page stays.
  if (list === 'failed' || overview === 'failed' || !overview) {
    return (
      <Text size="2" color="gray">
        {t.list.failed}
      </Text>
    )
  }

  // A change of filter or order goes back to the first page.
  const apply = (patch: Patch) =>
    onSearch({ ...search, ...patch, pagina: undefined })
  const every = cui === null
  const sort = contractSort(search, every)
  const onSort = (next: Sort | null) =>
    apply({ ordine: next ? sortToParam(next, CONTRACT_COLUMNS) : undefined })
  const found = overview.summary
  const q = search.q === undefined ? undefined : String(search.q)
  const party = role === 'institutions' ? 'furnizor' : 'institutie'
  const back = emptyHint(overview.without, CONTRACT_BY_API_PARAM)
  const days = f.span(
    overview.period.first_day ?? null,
    overview.period.last_day ?? null,
  )
  const range = days ? t.period.range(days.from, days.to) : null
  // A company's contracts won alone and in association are never added up.
  const both = every && search.furnizor !== undefined && !search.castig
  const counted = both ? 0 : found.contracts - found.without_value

  return (
    <ListView
      title={title ?? t.entity.tabContracts}
      search={{
        q,
        what: every
          ? t.contractList.searchWhatEvery
          : t.contractList.searchWhat[role],
        filters: contractFilterDecls({
          role,
          cui,
          search,
          won,
          overview,
          items: list.items,
          held:
            overview.period.first_day && overview.period.last_day
              ? {
                  first: overview.period.first_day,
                  last: overview.period.last_day,
                }
              : null,
          t,
          f,
        }),
        onApply: apply,
      }}
      summary={summaryLine(overview, won, range, both, t, f)}
      views={
        found.contracts > 0
          ? {
              charts: search.vedere !== 'tabel',
              onCharts: (charts) =>
                onSearch({ ...search, vedere: charts ? undefined : 'tabel' }),
            }
          : null
      }
      file={{
        href: `/contracte.csv?${new URLSearchParams(
          contractFileSearch(role, cui, search, won),
        ).toString()}`,
        rows: list.total,
      }}
      sort={{
        value: sort,
        columns: [
          { column: 'data', label: t.contracts.date },
          { column: 'valoare', label: t.contracts.value },
          {
            column: party,
            label:
              role === 'institutions' ? t.contracts.winner : t.contracts.buyer,
          },
          ...(every
            ? [{ column: 'institutie', label: t.contracts.buyer }]
            : []),
        ],
        isDefault: search.ordine === undefined,
        onSort,
      }}
      charts={
        <ContractCharts
          role={role}
          won={won}
          search={search}
          overview={overview}
          onApply={apply}
        />
      }
      rows={
        <ContractRows
          role={role}
          every={every}
          company={every ? search.furnizor : undefined}
          items={list.items}
          q={q}
          sort={sort}
          onSort={onSort}
          total={
            counted > 0
              ? {
                  label:
                    won === 'association'
                      ? t.contractList.totalWhole(counted, f.count(counted))
                      : t.contractList.total(counted, f.count(counted)),
                  value: t.contractList.value(f.lei(found.value)),
                }
              : null
          }
        />
      }
      empty={
        // Empty before any filter: the list says so in its own words.
        overview.whole === 0 && range ? (
          <Text size="2" color="gray">
            {won ? t.contractList.none[won](range) : t.contracts.none(range)}
          </Text>
        ) : (
          <ListEmpty
            back={
              back
                ? {
                    label: t.contractList.filters[back.key],
                    rows: t.contractList.contracts(
                      back.count,
                      f.count(back.count),
                    ),
                    onRemove: () =>
                      onSearch(
                        withoutFilters(CONTRACT_FILTER_PARAMS, search, [
                          back.key,
                        ]),
                      ),
                  }
                : null
            }
            onClear={
              chosenFilters(CONTRACT_FILTER_PARAMS, search).length
                ? () => onSearch(withoutFilters(CONTRACT_FILTER_PARAMS, search))
                : null
            }
          />
        )
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

// "2 contracte · 6,33 mil. lei fără TVA" (or "câștigate singur" for a company), and under
// it which part of the whole that is, over which days, and what the sum leaves out. `both`:
// a company's contracts won alone and in association, never added: no sum.
function summaryLine(
  overview: ContractOverview,
  won: Won | undefined,
  range: string | null,
  both: boolean,
  t: Messages,
  f: Format,
) {
  const found = overview.summary
  const count = f.count(found.contracts)
  return {
    headline: (
      <>
        {won
          ? t.contractList.wonContracts(found.contracts, count, won)
          : t.contractList.contracts(found.contracts, count)}
        {found.contracts > 0 && !both
          ? ` · ${t.contractList.value(f.leiShort(found.value))}`
          : null}
      </>
    ),
    detail: (
      <>
        {t.contractList.of(f.count(overview.whole), range)}
        {found.without_value > 0
          ? ` · ${t.contractList.withoutValue(
              found.without_value,
              f.count(found.without_value),
            )}`
          : null}
        {won === 'association' ? ` · ${t.contractList.wholeValue}` : null}
        {both ? ` · ${t.contractList.noSumBoth}` : null}
      </>
    ),
  }
}
