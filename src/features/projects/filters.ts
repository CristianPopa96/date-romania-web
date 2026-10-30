// The filters the list of projects declares to its FilterBar: Program, Județ, Beneficiar
// (only when the address names one, to be removed), Stare, Valoare, Drum urmărit. A
// choice panel takes numbers, so an option is offered by its place in a fixed order and
// written back to the address as its word.

import type { FilterDecl } from '#/components/list/filter-types'
import {
  PROJECT_KINDS,
  PROJECT_STATUSES,
  REACHES,
} from '#/features/projects/api'
import type { ProjectsOverview } from '#/features/projects/api'
import {
  kindsFromParam,
  kindsToParam,
  reachesFromParam,
  reachesToParam,
  statusesFromParam,
  statusesToParam,
} from '#/features/projects/list'
import type { ProjectListSearch } from '#/features/projects/list'
import type { Messages } from '#/i18n'
import { countyCodeOfSlug, countySlugOfCode } from '#/lib/counties'
import type { Format } from '#/lib/format'
import { rangeChip } from '#/lib/list-chips'

const SMALL = 1_000_000
const LARGE = 25_000_000

export function projectFilterDecls({
  search,
  overview,
  fixedKind,
  t,
  f,
}: {
  search: ProjectListSearch
  overview: ProjectsOverview
  // A programme's own page: its kind is not a filter there.
  fixedKind: boolean
  t: Messages
  f: Format
}): Array<FilterDecl> {
  const p = t.projects
  const labels = p.filters
  const chosen = (names: Array<string>) =>
    names.length > 2
      ? t.list.chosenMany(f.count(names.length))
      : names.join(', ')
  const count = <TValue extends string>(
    options: ReadonlyArray<{ value: TValue; count: number }>,
    value: TValue,
  ) => options.find((option) => option.value === value)?.count ?? 0

  const kinds = kindsFromParam(search.program) ?? []
  const statuses = statusesFromParam(search.stare) ?? []
  const reaches = reachesFromParam(search.drum) ?? []
  const county = countyCodeOfSlug(search.judet)
  const counties = overview.counties
  const countyIndex = counties.findIndex((option) => option.value === county)

  const program: FilterDecl = {
    key: 'program',
    kind: 'choice',
    label: labels.program,
    value: kinds.map((kind) => PROJECT_KINDS.indexOf(kind)),
    options: PROJECT_KINDS.map((kind, index) => ({
      value: index,
      label: p.kinds[kind],
      count: count(overview.kinds, kind),
    })),
    chip: kinds.length ? chosen(kinds.map((kind) => p.kinds[kind])) : null,
    clear: { program: undefined },
    patch: (next) => ({
      program: kindsToParam(next.map((index) => PROJECT_KINDS[index])),
    }),
  }
  const beneficiary: Array<FilterDecl> =
    search.beneficiar !== undefined
      ? [
          {
            key: 'beneficiar',
            kind: 'choice',
            single: true,
            label: labels.beneficiar,
            value: [0],
            options: [
              {
                value: 0,
                label: overview.beneficiary?.name ?? `CUI ${search.beneficiar}`,
              },
            ],
            chip: overview.beneficiary?.name ?? `CUI ${search.beneficiar}`,
            clear: { beneficiar: undefined },
            patch: () => ({ beneficiar: undefined }),
          },
        ]
      : []

  return [
    ...(fixedKind ? [] : [program]),
    {
      key: 'judet',
      kind: 'choice',
      single: true,
      label: labels.judet,
      value: countyIndex >= 0 ? [countyIndex] : [],
      options: counties.map((option, index) => ({
        value: index,
        label: option.name,
        count: option.count,
      })),
      chip: countyIndex >= 0 ? counties[countyIndex].name : null,
      clear: { judet: undefined },
      patch: (next) => ({
        judet: next.length
          ? countySlugOfCode(counties[next[0]].value)
          : undefined,
      }),
    },
    ...beneficiary,
    {
      key: 'stare',
      kind: 'choice',
      label: labels.stare,
      value: statuses.map((status) => PROJECT_STATUSES.indexOf(status)),
      options: PROJECT_STATUSES.map((status, index) => ({
        value: index,
        label: p.status[status],
        count: count(overview.statuses, status),
      })),
      chip: statuses.length
        ? chosen(statuses.map((status) => p.status[status]))
        : null,
      clear: { stare: undefined },
      patch: (next) => ({
        stare: statusesToParam(next.map((index) => PROJECT_STATUSES[index])),
      }),
    },
    {
      key: 'valoare',
      kind: 'range',
      label: labels.valoare,
      value: { min: search.valoare_min, max: search.valoare_max },
      bands: overview.bands.map((band) => ({
        start: band.start,
        end: band.end ?? null,
        count: band.count,
      })),
      presets: [
        { label: p.valuePresets.small, max: SMALL },
        { label: p.valuePresets.middle, min: SMALL, max: LARGE },
        { label: p.valuePresets.large, min: LARGE },
      ],
      chip: rangeChip(search.valoare_min, search.valoare_max, t, f),
      clear: { valoare_min: undefined, valoare_max: undefined },
      patch: (next) => ({ valoare_min: next.min, valoare_max: next.max }),
    },
    {
      key: 'drum',
      kind: 'choice',
      label: labels.drum,
      value: reaches.map((reach) => REACHES.indexOf(reach)),
      options: REACHES.map((reach, index) => ({
        value: index,
        label: p.reach[reach],
        count: count(overview.reaches, reach),
      })),
      chip: reaches.length
        ? chosen(reaches.map((reach) => p.reach[reach]))
        : null,
      clear: { drum: undefined },
      patch: (next) => ({
        drum: reachesToParam(next.map((index) => REACHES[index])),
      }),
    },
  ]
}
