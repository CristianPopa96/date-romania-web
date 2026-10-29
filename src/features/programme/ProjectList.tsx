import { useSuspenseQuery } from '@tanstack/react-query'
import { Text } from '@radix-ui/themes'

import type { Patch } from '#/components/list/filter-types'
import { ListEmpty } from '#/components/list/ListEmpty'
import { ListView } from '#/components/list/ListView'
import { ProjectCharts } from '#/features/programme/ProjectCharts'
import { ProjectRows } from '#/features/programme/ProjectRows'
import { projectFilterDecls } from '#/features/programme/filters'
import {
  PROJECT_BY_API_PARAM,
  PROJECT_COLUMNS,
  PROJECT_FILTER_PARAMS,
  projectSort,
} from '#/features/programme/list'
import type { ProjectListSearch } from '#/features/programme/list'
import {
  projectListQuery,
  projectOverviewQuery,
} from '#/features/programme/queries'
import { useI18n } from '#/i18n/context'
import {
  chosenFilters,
  emptyHint,
  sortToParam,
  withoutFilters,
} from '#/lib/list'
import type { Sort } from '#/lib/list'

// The projects of the Anghel Saligny programme, declared to the list pattern (ListView):
// its filters, its summary line, two charts and its columns. Every figure comes from the
// ministry's payment files, one programme, so the amounts may be added.
export function ProjectList({
  categories,
  search,
  onSearch,
}: {
  // The programme's kinds of works, which the address names by slug.
  categories: ReadonlyArray<string>
  search: ProjectListSearch
  onSearch: (search: ProjectListSearch) => void
}) {
  const { t, f } = useI18n()
  const { data: list } = useSuspenseQuery(projectListQuery(search, categories))
  const { data: overview } = useSuspenseQuery(
    projectOverviewQuery(search, categories),
  )
  const l = t.programme.list
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
  const sort = projectSort(search)
  const onSort = (next: Sort | null) =>
    apply({ ordine: next ? sortToParam(next, PROJECT_COLUMNS) : undefined })
  const q = search.q === undefined ? undefined : String(search.q)
  const back = emptyHint(overview.without, PROJECT_BY_API_PARAM)
  const found = overview.summary

  return (
    <ListView
      title={t.programme.findTitle}
      search={{
        q,
        what: l.searchWhat,
        filters: projectFilterDecls({ search, overview, t, f }),
        onApply: apply,
      }}
      summary={{
        headline: (
          <>
            {l.projects(found.projects, f.count(found.projects))}
            {found.projects > 0
              ? ` · ${l.paid(
                  f.leiShort(found.paid),
                  found.payments,
                  f.count(found.payments),
                )}`
              : null}
          </>
        ),
        detail: (
          <>
            {l.of(f.count(overview.whole))}
            {/* A builder's projects: what they were paid is the whole project's. */}
            {search.firma !== undefined && found.projects > 0
              ? ` ${l.paidAllBuilders}`
              : null}
          </>
        ),
      }}
      views={
        found.projects > 0
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
          { column: 'platit', label: t.programme.paidColumn },
          { column: 'valoare', label: l.value },
        ],
        isDefault: search.ordine === undefined,
        onSort,
      }}
      charts={
        <ProjectCharts search={search} overview={overview} onApply={apply} />
      }
      rows={
        <ProjectRows
          items={list.items}
          q={q}
          sort={sort}
          onSort={onSort}
          total={
            found.projects > 0
              ? {
                  label: l.total(found.projects, f.count(found.projects)),
                  value: f.lei(found.paid),
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
                  rows: l.projects(back.count, f.count(back.count)),
                  onRemove: () =>
                    onSearch(
                      withoutFilters(PROJECT_FILTER_PARAMS, search, [back.key]),
                    ),
                }
              : null
          }
          onClear={
            chosenFilters(PROJECT_FILTER_PARAMS, search).length
              ? () => onSearch(withoutFilters(PROJECT_FILTER_PARAMS, search))
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
