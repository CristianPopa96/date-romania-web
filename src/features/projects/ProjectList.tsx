import { useSuspenseQuery } from '@tanstack/react-query'
import { Text } from '@radix-ui/themes'

import type { Patch } from '#/components/list/filter-types'
import { ListEmpty } from '#/components/list/ListEmpty'
import { ListView } from '#/components/list/ListView'
import { ProjectCharts } from '#/features/projects/ProjectCharts'
import { ProjectRows } from '#/features/projects/ProjectRows'
import type { ProjectKind, ProjectsOverview } from '#/features/projects/api'
import { projectFilterDecls } from '#/features/projects/filters'
import type { HeldProgramme } from '#/features/projects/filters'
import {
  PROJECT_BY_API_PARAM,
  PROJECT_COLUMNS,
  PROJECT_FILTER_PARAMS,
  projectSort,
  projectsCsvPath,
} from '#/features/projects/list'
import type {
  ProjectArea,
  ProjectListSearch,
  ProjectParty,
  ProjectScope,
} from '#/features/projects/list'
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
  cohesion,
  party,
  area,
  title,
  titleAs,
}: {
  search: TSearch
  onSearch: (search: TSearch) => void
  fixed?: ProjectKind
  // The EU funds page: the programmes it holds, and the codes its address names.
  cohesion?: {
    held: ReadonlyArray<HeldProgramme>
    codes: Array<string> | undefined
  }
  // An entity page's institution or company: its projects only, and on a company's, how
  // it is tied to each.
  party?: ProjectParty
  // A place page's UAT or county: the projects landing there.
  area?: ProjectArea
  title: string
  // h3 under an entity page's own heading for its lists.
  titleAs?: 'h2' | 'h3'
}) {
  const { t, f } = useI18n()
  const p = t.projects
  const scope: ProjectScope = {
    kind: fixed,
    codes: cohesion?.codes,
    party,
    area,
  }
  const { data: list } = useSuspenseQuery(projectListQuery(search, scope))
  const { data: overview } = useSuspenseQuery(
    projectsOverviewQuery(search, scope),
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
  // The filters a programme's page keeps whatever the reader removes; on the EU funds
  // page `program` is its programmes, a filter like any other.
  const own = fixed && !cohesion ? ['program' as const] : []
  const kept = (filters: ProjectListSearch) =>
    own.length ? { ...filters, program: search.program } : filters

  return (
    <ListView
      title={title}
      titleAs={titleAs}
      search={{
        q,
        what: p.searchWhat,
        filters: projectFilterDecls({
          search,
          overview,
          fixedKind: fixed !== undefined,
          held: cohesion?.held,
          fixedParty: party !== undefined,
          fixedArea: area !== undefined,
          t,
          f,
        }),
        onApply: apply,
      }}
      summary={summaryLine(
        overview,
        fixed,
        t,
        f,
        party !== undefined || area !== undefined,
      )}
      views={
        found.projects > 0 && !cohesion
          ? {
              charts: search.vedere !== 'tabel',
              onCharts: (charts) =>
                onSearch({ ...search, vedere: charts ? undefined : 'tabel' }),
            }
          : null
      }
      file={
        found.projects > 0
          ? {
              href: projectsCsvPath(search, scope),
              rows: found.projects,
            }
          : null
      }
      sort={{
        value: sort,
        columns: [{ column: 'valoare', label: p.valueColumn }],
        isDefault: search.ordine === undefined,
        onSort,
      }}
      // The EU funds page compares its programmes in the table above it: no chart (Q66).
      charts={
        cohesion ? null : (
          <ProjectCharts
            search={search}
            overview={overview}
            fixedKind={fixed !== undefined}
            onApply={apply}
          />
        )
      }
      rows={
        <ProjectRows
          items={list.items}
          showVia={party !== undefined && 'company' in party}
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
  t: Messages,
  f: Format,
  // An entity's list: the whole of every project is not its whole.
  own = false,
) {
  const p = t.projects
  const found = overview.summary
  const kinds = overview.kinds.filter((each) => each.count > 0).length
  // More than one programme has rows: cohesion alone is several, each list at its day.
  const several =
    overview.programmes.filter((each) => each.count > 0).length > 1
  const whole = !fixed && !own
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
        {/* The whole is every programme's: said on the list of all of them only. */}
        {whole ? p.of(f.count(overview.whole)) : null}
        {several ? `${whole ? ' · ' : ''}${p.noSum}` : null}
        {found.natural_persons > 0
          ? `${whole || several ? '. ' : ''}${p.naturalPersons(found.natural_persons, f.count(found.natural_persons))}`
          : null}
      </>
    ),
  }
}
