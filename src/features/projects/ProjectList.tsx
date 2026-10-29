import { useSuspenseQuery } from '@tanstack/react-query'
import { Text } from '@radix-ui/themes'

import type { Patch } from '#/components/list/filter-types'
import { ListEmpty } from '#/components/list/ListEmpty'
import { ListView } from '#/components/list/ListView'
import { ProjectCharts } from '#/features/projects/ProjectCharts'
import { ProjectRows } from '#/features/projects/ProjectRows'
import type { ProjectKind, ProjectsOverview } from '#/features/projects/api'
import { projectFilterDecls } from '#/features/projects/filters'
import {
  PROJECT_BY_API_PARAM,
  PROJECT_COLUMNS,
  PROJECT_FILTER_PARAMS,
  kindsFromParam,
  projectSort,
  projectsCsvPath,
} from '#/features/projects/list'
import type { ProjectListSearch } from '#/features/projects/list'
import {
  projectListQuery,
  projectsOverviewQuery,
} from '#/features/projects/queries'
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

// Every project of every programme, declared to the list pattern (ListView): its filters,
// its summary line, two charts that count, its columns. On a programme's own page the
// list is fixed to it (`fixed`) and its programme is no filter. Programmes are never
// added: a value appears only once one programme is chosen.
export function ProjectList<TSearch extends ProjectListSearch>({
  search,
  onSearch,
  fixed,
  title,
}: {
  search: TSearch
  onSearch: (search: TSearch) => void
  fixed?: ProjectKind
  title: string
}) {
  const { t, f } = useI18n()
  const p = t.projects
  const { data: list } = useSuspenseQuery(projectListQuery(search, fixed))
  const { data: overview } = useSuspenseQuery(
    projectsOverviewQuery(search, fixed),
  )
  if (list === 'failed' || overview === 'failed' || !overview) {
    return (
      <Text size="2" color="gray">
        {p.failed}
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
  // The filters a programme's page keeps whatever the reader removes.
  const own = fixed ? ['program' as const] : []
  const kept = (filters: ProjectListSearch) =>
    fixed ? { ...filters, program: search.program } : filters

  return (
    <ListView
      title={title}
      search={{
        q,
        what: p.searchWhat,
        filters: projectFilterDecls({
          search,
          overview,
          fixedKind: fixed !== undefined,
          t,
          f,
        }),
        onApply: apply,
      }}
      summary={summaryLine(overview, fixed, search, t, f)}
      views={
        found.projects > 0
          ? {
              charts: search.vedere !== 'tabel',
              onCharts: (charts) =>
                onSearch({ ...search, vedere: charts ? undefined : 'tabel' }),
            }
          : null
      }
      file={
        found.projects > 0
          ? { href: projectsCsvPath(search, fixed), rows: found.projects }
          : null
      }
      sort={{
        value: sort,
        columns: [{ column: 'valoare', label: p.valueColumn }],
        isDefault: search.ordine === undefined,
        onSort,
      }}
      charts={
        <ProjectCharts
          search={search}
          overview={overview}
          fixedKind={fixed !== undefined}
          onApply={apply}
        />
      }
      rows={
        <ProjectRows
          items={list.items}
          q={q}
          sort={sort}
          onSort={onSort}
          total={
            found.value !== null && found.projects > 0
              ? {
                  label: p.total(found.projects, f.count(found.projects)),
                  value: f.lei(found.value),
                }
              : null
          }
        />
      }
      empty={
        <ListEmpty
          back={
            back && !(own as Array<string>).includes(back.key)
              ? {
                  label: p.filters[back.key],
                  rows: p.projects(back.count, f.count(back.count)),
                  onRemove: () =>
                    onSearch(
                      kept(
                        withoutFilters(PROJECT_FILTER_PARAMS, search, [
                          back.key,
                        ]),
                      ) as TSearch,
                    ),
                }
              : null
          }
          onClear={
            chosenFilters(PROJECT_FILTER_PARAMS, search).filter(
              (key) => !(own as Array<string>).includes(key),
            ).length
              ? () =>
                  onSearch(
                    kept(
                      withoutFilters(PROJECT_FILTER_PARAMS, search),
                    ) as TSearch,
                  )
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

// "46.144 proiecte în 3 programe · 1.345 urmărite până la firme"; with one programme
// chosen "· valoare 1,2 mld. lei". Under it what part of the whole it is, the line on
// sums, and the natural persons' projects counted but never listed.
function summaryLine(
  overview: ProjectsOverview,
  fixed: ProjectKind | undefined,
  search: ProjectListSearch,
  t: Messages,
  f: Format,
) {
  const p = t.projects
  const found = overview.summary
  const kinds = overview.kinds.filter((each) => each.count > 0).length
  const several = !fixed && (kindsFromParam(search.program)?.length ?? 0) !== 1
  return {
    headline: (
      <>
        {p.projects(found.projects, f.count(found.projects))}
        {fixed ? null : ` ${p.inKinds(kinds, f.count(kinds))}`}
        {found.projects > 0
          ? ` · ${p.followed(f.count(found.companies))}`
          : null}
        {found.value !== null && found.projects > 0
          ? ` · ${p.value(f.leiShort(found.value))}`
          : null}
      </>
    ),
    detail: (
      <>
        {p.of(f.count(overview.whole))}
        {several ? ` · ${p.noSum}` : null}
        {found.natural_persons > 0
          ? `. ${p.naturalPersons(found.natural_persons, f.count(found.natural_persons))}`
          : null}
      </>
    ),
  }
}
