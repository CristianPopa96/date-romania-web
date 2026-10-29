// The filters the list of Anghel Saligny projects declares to its FilterBar: Județ, Legătura
// cu SEAP, Lucrări, Plătit, and Constructor only when an address names one (from a
// builder's page). A choice panel takes numbers, so an option is offered by its place in
// the overview's options, and written back to the address as its word or slug.

import type { FilterDecl } from '#/components/list/filter-types'
import { MATCHES } from '#/features/programme/api'
import type { ProjectOverview } from '#/features/programme/api-list'
import {
  matchesFromParam,
  matchesToParam,
  worksSlug,
} from '#/features/programme/list'
import type { ProjectListSearch } from '#/features/programme/list'
import { countySlug } from '#/features/programme/programme'
import type { Messages } from '#/i18n'
import type { Format } from '#/lib/format'
import { rangeChip } from '#/lib/list-chips'

const SMALL = 1_000_000
const LARGE = 5_000_000

export function projectFilterDecls({
  search,
  overview,
  t,
  f,
}: {
  search: ProjectListSearch
  overview: ProjectOverview
  t: Messages
  f: Format
}): Array<FilterDecl> {
  const labels = t.programme.list.filters
  const counties = overview.counties
  const county = counties.findIndex(
    (option) => countySlug(option.value) === search.judet,
  )
  const matches = matchesFromParam(search.legatura) ?? []
  const works = overview.categories
  const slugs = search.lucrari?.split(',') ?? []
  const chosenWorks = works
    .map((option, index) =>
      slugs.includes(worksSlug(option.value)) ? index : -1,
    )
    .filter((index) => index >= 0)
  const chosen = (names: Array<string>) =>
    names.length > 1
      ? t.list.chosenMany(f.count(names.length))
      : names.join(', ')
  const builder = overview.builder?.name ?? `CUI ${search.firma}`

  return [
    // Reached from a builder's page: shown so it can be cleared, never offered.
    ...(search.firma !== undefined
      ? [
          {
            key: 'firma',
            kind: 'choice' as const,
            single: true,
            label: labels.firma,
            value: [0],
            options: [
              {
                value: 0,
                label: builder,
                count: overview.summary.projects,
              },
            ],
            chip: builder,
            clear: { firma: undefined },
            patch: () => ({ firma: undefined }),
          },
        ]
      : []),
    {
      key: 'judet',
      kind: 'choice',
      single: true,
      label: labels.judet,
      value: county >= 0 ? [county] : [],
      options: counties.map((option, index) => ({
        value: index,
        label: option.name,
        count: option.count,
      })),
      chip: county >= 0 ? counties[county].name : null,
      clear: { judet: undefined },
      patch: (next) => ({
        judet: next.length ? countySlug(counties[next[0]].value) : undefined,
      }),
    },
    {
      key: 'legatura',
      kind: 'choice',
      label: labels.legatura,
      value: matches.map((match) => MATCHES.indexOf(match)),
      options: overview.matches.map((option) => ({
        value: MATCHES.indexOf(option.value),
        label: t.programme.match[option.value],
        count: option.count,
      })),
      chip: matches.length
        ? chosen(matches.map((match) => t.programme.match[match]))
        : null,
      clear: { legatura: undefined },
      patch: (next) => ({
        legatura: matchesToParam(next.map((index) => MATCHES[index])),
      }),
    },
    {
      key: 'lucrari',
      kind: 'choice',
      label: labels.lucrari,
      value: chosenWorks,
      options: works.map((option, index) => ({
        value: index,
        label: option.value,
        count: option.count,
      })),
      chip: chosenWorks.length
        ? chosen(chosenWorks.map((index) => works[index].value))
        : null,
      clear: { lucrari: undefined },
      patch: (next) => ({
        lucrari: next.length
          ? next.map((index) => worksSlug(works[index].value)).join(',')
          : undefined,
      }),
    },
    {
      key: 'platit',
      kind: 'range',
      label: labels.platit,
      value: { min: search.platit_min, max: search.platit_max },
      bands: overview.bands.map((each) => ({
        start: each.start,
        end: each.end ?? null,
        count: each.count,
      })),
      presets: [
        { label: t.programme.list.paidPresets.small, max: SMALL },
        { label: t.programme.list.paidPresets.middle, min: SMALL, max: LARGE },
        { label: t.programme.list.paidPresets.large, min: LARGE },
      ],
      chip: rangeChip(search.platit_min, search.platit_max, t, f),
      clear: { platit_min: undefined, platit_max: undefined },
      patch: (next) => ({ platit_min: next.min, platit_max: next.max }),
    },
  ]
}
