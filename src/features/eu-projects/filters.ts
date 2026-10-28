// The filters a beneficiary's list of EU projects declares to its FilterBar: Program,
// Stare, Valoare. A choice panel takes numbers, so a programme or a status is offered by
// its place in the overview's options, and written back to the address as its slug or
// word.

import type { FilterDecl } from '#/components/list/filter-types'
import { EU_STATUSES } from '#/features/eu-projects/api'
import type { EuProjectOverview } from '#/features/eu-projects/api-list'
import { programmeSlug } from '#/features/eu-projects/eu'
import {
  euStatusesFromParam,
  euStatusesToParam,
} from '#/features/eu-projects/list'
import type { EuProjectListSearch } from '#/features/eu-projects/list'
import type { Messages } from '#/i18n'
import type { Format } from '#/lib/format'
import { rangeChip } from '#/lib/list-chips'

const SMALL = 1_000_000
const LARGE = 25_000_000

// A programme the beneficiary has, as the tab's figures name it.
export type HeldProgramme = { code: string; period: string; name: string }

export function euProjectFilterDecls({
  search,
  overview,
  programmes,
  t,
  f,
}: {
  search: EuProjectListSearch
  overview: EuProjectOverview
  programmes: ReadonlyArray<HeldProgramme>
  t: Messages
  f: Format
}): Array<FilterDecl> {
  const labels = t.eu.list.filters
  const options = overview.programmes.flatMap((option) => {
    const held = programmes.find((each) => each.code === option.value)
    return held ? [{ ...option, slug: programmeSlug(held), held }] : []
  })
  const slugs = search.program?.split(',') ?? []
  const chosenProgrammes = options
    .map((option, index) => (slugs.includes(option.slug) ? index : -1))
    .filter((index) => index >= 0)
  const statuses = euStatusesFromParam(search.stare) ?? []
  const chosenStatuses = statuses.map((status) => EU_STATUSES.indexOf(status))
  const chosen = (names: Array<string>) =>
    names.length > 2
      ? t.list.chosenMany(f.count(names.length))
      : names.join(', ')

  return [
    {
      key: 'program',
      kind: 'choice',
      label: labels.program,
      value: chosenProgrammes,
      options: options.map((option, index) => ({
        value: index,
        label: `${option.held.code} ${option.held.period}`,
        count: option.count,
      })),
      chip: chosenProgrammes.length
        ? chosen(
            chosenProgrammes.map(
              (index) =>
                `${options[index].held.code} ${options[index].held.period}`,
            ),
          )
        : null,
      clear: { program: undefined },
      patch: (next) => ({
        program: next.length
          ? next.map((index) => options[index].slug).join(',')
          : undefined,
      }),
    },
    {
      key: 'stare',
      kind: 'choice',
      label: labels.stare,
      value: chosenStatuses,
      options: overview.statuses.map((option) => ({
        value: EU_STATUSES.indexOf(option.value),
        label: t.eu.status[option.value],
        count: option.count,
      })),
      chip: statuses.length
        ? chosen(statuses.map((status) => t.eu.status[status]))
        : null,
      clear: { stare: undefined },
      patch: (next) => ({
        stare: euStatusesToParam(next.map((index) => EU_STATUSES[index])),
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
        { label: t.eu.list.valuePresets.small, max: SMALL },
        { label: t.eu.list.valuePresets.middle, min: SMALL, max: LARGE },
        { label: t.eu.list.valuePresets.large, min: LARGE },
      ],
      chip: rangeChip(search.valoare_min, search.valoare_max, t, f),
      clear: { valoare_min: undefined, valoare_max: undefined },
      patch: (next) => ({ valoare_min: next.min, valoare_max: next.max }),
    },
  ]
}
