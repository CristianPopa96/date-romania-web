import { useSuspenseQuery } from '@tanstack/react-query'
import { Text } from '@radix-ui/themes'

import type { Patch } from '#/components/list/filter-types'
import { ListEmpty } from '#/components/list/ListEmpty'
import { ListView } from '#/components/list/ListView'
import { EuProjectCharts } from '#/features/eu-projects/EuProjectCharts'
import { EuProjectRows } from '#/features/eu-projects/EuProjectRows'
import type { EuProjectOverview } from '#/features/eu-projects/api-list'
import { euProjectFilterDecls } from '#/features/eu-projects/filters'
import type { HeldProgramme } from '#/features/eu-projects/filters'
import {
  EU_PROJECT_BY_API_PARAM,
  EU_PROJECT_COLUMNS,
  EU_PROJECT_FILTER_PARAMS,
  euProjectSort,
  programmeCodes,
} from '#/features/eu-projects/list'
import type { EuProjectListSearch } from '#/features/eu-projects/list'
import {
  euProjectListQuery,
  euProjectOverviewQuery,
} from '#/features/eu-projects/queries'
import { useI18n } from '#/i18n/context'
import type { Messages } from '#/i18n'
import type { Format } from '#/lib/format'
import {
  chosenFilters,
  emptyHint,
  sortToParam,
  withoutFilters,
} from '#/lib/list'
import type { Sort } from '#/lib/list'

type Search = EuProjectListSearch & { pagina?: number }

// The EU cohesion projects of one beneficiary (its entity page's tab), declared to the
// list pattern (ListView): its filters, its summary line, two charts and its columns. Programmes are never added: the summary gives a value only when one
// programme is chosen, with that list's day.
export function EuProjectList<TSearch extends Search>({
  cui,
  programmes,
  search,
  onSearch,
}: {
  cui: number
  programmes: ReadonlyArray<HeldProgramme>
  search: TSearch
  onSearch: (search: TSearch) => void
}) {
  const { t, f } = useI18n()
  const codes = programmeCodes(programmes, search.program)
  const { data: list } = useSuspenseQuery(
    euProjectListQuery(cui, search, codes),
  )
  const { data: overview } = useSuspenseQuery(
    euProjectOverviewQuery(cui, search, codes),
  )
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
  const sort = euProjectSort(search)
  const onSort = (next: Sort | null) =>
    apply({ ordine: next ? sortToParam(next, EU_PROJECT_COLUMNS) : undefined })
  const q = search.q === undefined ? undefined : String(search.q)
  const back = emptyHint(overview.without, EU_PROJECT_BY_API_PARAM)
  // One programme chosen: its own figures may be shown, with its list's day.
  const single =
    codes?.length === 1
      ? overview.programmes.find((each) => each.value === codes[0])
      : undefined

  return (
    <ListView
      title={t.eu.list.title}
      // Under the entity tabs' own heading, one level below it.
      titleAs="h3"
      search={{
        q,
        what: t.eu.list.searchWhat,
        filters: euProjectFilterDecls({ search, overview, programmes, t, f }),
        onApply: apply,
      }}
      summary={summaryLine(overview, single, t, f)}
      views={
        overview.summary.projects > 0
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
          { column: 'valoare', label: t.eu.value },
          { column: 'platit', label: t.eu.paid },
        ],
        isDefault: search.ordine === undefined,
        onSort,
      }}
      charts={
        <EuProjectCharts
          search={search}
          overview={overview}
          programmes={programmes}
          onApply={apply}
        />
      }
      rows={
        <EuProjectRows
          items={list.items}
          q={q}
          sort={sort}
          onSort={onSort}
          total={
            single && single.total !== null && codes
              ? {
                  label: t.eu.list.total(codes[0]),
                  value: f.lei(single.total),
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
                  label: t.eu.list.filters[back.key],
                  rows: t.eu.list.projects(back.count, f.count(back.count)),
                  onRemove: () =>
                    onSearch(
                      withoutFilters(EU_PROJECT_FILTER_PARAMS, search, [
                        back.key,
                      ]),
                    ),
                }
              : null
          }
          onClear={
            chosenFilters(EU_PROJECT_FILTER_PARAMS, search).length
              ? () => onSearch(withoutFilters(EU_PROJECT_FILTER_PARAMS, search))
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

// "3 proiecte", with one programme chosen "· valoare 6,2 mil. lei · plătit 6,1 mil. lei
// până la 31.08.2025"; under it which part of the beneficiary's projects it is.
function summaryLine(
  overview: EuProjectOverview,
  single: EuProjectOverview['programmes'][number] | undefined,
  t: Messages,
  f: Format,
) {
  const found = overview.summary
  const money = (value: number | null) =>
    value === null ? t.common.notPublished : f.leiShort(value)
  return {
    headline: (
      <>
        {t.eu.list.projects(found.projects, f.count(found.projects))}
        {single && found.projects > 0
          ? ` · ${t.eu.list.programme(
              money(single.total),
              money(single.paid),
              single.cut_off ? f.day(single.cut_off) : null,
            )}`
          : null}
      </>
    ),
    detail: (
      <>
        {t.eu.list.of(f.count(overview.whole))}
        {overview.other_statuses > 0
          ? ` · ${t.eu.list.otherStatuses(
              overview.other_statuses,
              f.count(overview.other_statuses),
            )}`
          : null}
      </>
    ),
  }
}
