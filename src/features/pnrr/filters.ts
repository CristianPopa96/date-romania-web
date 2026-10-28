// The filters a beneficiary's list of PNRR contracts declares to its FilterBar: Măsură,
// Stare, Valoare, Progres fizic. A choice panel takes numbers, so a measure or a status is
// offered by its place in the overview's options, and written back to the address as its
// code or word; progress is one band at a time.

import type { FilterDecl } from '#/components/list/filter-types'
import { PNRR_STATUSES } from '#/features/pnrr/api'
import type { PnrrContractOverview } from '#/features/pnrr/api-list'
import {
  PROGRESS_BANDS,
  pnrrStatusesFromParam,
  pnrrStatusesToParam,
  progressBand,
} from '#/features/pnrr/list'
import type { PnrrListSearch } from '#/features/pnrr/list'
import { measureSlug } from '#/features/pnrr/pnrr'
import type { Messages } from '#/i18n'
import type { Format } from '#/lib/format'
import { rangeChip } from '#/lib/list-chips'

const SMALL = 1_000_000
const LARGE = 25_000_000

export function pnrrFilterDecls({
  search,
  overview,
  t,
  f,
}: {
  search: PnrrListSearch
  overview: PnrrContractOverview
  t: Messages
  f: Format
}): Array<FilterDecl> {
  const labels = t.pnrr.list.filters
  const measures = overview.measures
  const chosenCodes = search.masura?.split(',') ?? []
  const chosenMeasures = measures
    .map((option, index) =>
      chosenCodes.includes(measureSlug(option.value)) ? index : -1,
    )
    .filter((index) => index >= 0)
  const statuses = pnrrStatusesFromParam(search.stare) ?? []
  const band = progressBand(search)
  const chosen = (names: Array<string>) =>
    names.length > 2
      ? t.list.chosenMany(f.count(names.length))
      : names.join(', ')

  return [
    {
      key: 'masura',
      kind: 'choice',
      label: labels.masura,
      value: chosenMeasures,
      options: measures.map((option, index) => ({
        value: index,
        label: option.value,
        count: option.count,
      })),
      chip: chosenMeasures.length
        ? chosen(chosenMeasures.map((index) => measures[index].value))
        : null,
      clear: { masura: undefined },
      patch: (next) => ({
        masura: next.length
          ? next.map((index) => measureSlug(measures[index].value)).join(',')
          : undefined,
      }),
    },
    {
      key: 'stare',
      kind: 'choice',
      label: labels.stare,
      value: statuses.map((status) => PNRR_STATUSES.indexOf(status)),
      options: overview.statuses.map((option) => ({
        value: PNRR_STATUSES.indexOf(option.value),
        label: t.pnrr.status[option.value],
        count: option.count,
      })),
      chip: statuses.length
        ? chosen(statuses.map((status) => t.pnrr.status[status]))
        : null,
      clear: { stare: undefined },
      patch: (next) => ({
        stare: pnrrStatusesToParam(next.map((index) => PNRR_STATUSES[index])),
      }),
    },
    {
      key: 'valoare',
      kind: 'range',
      label: labels.valoare,
      value: { min: search.valoare_min, max: search.valoare_max },
      bands: overview.bands.map((each) => ({
        start: each.start,
        end: each.end ?? null,
        count: each.count,
      })),
      presets: [
        { label: t.pnrr.list.valuePresets.small, max: SMALL },
        { label: t.pnrr.list.valuePresets.middle, min: SMALL, max: LARGE },
        { label: t.pnrr.list.valuePresets.large, min: LARGE },
      ],
      chip: rangeChip(search.valoare_min, search.valoare_max, t, f),
      clear: { valoare_min: undefined, valoare_max: undefined },
      patch: (next) => ({ valoare_min: next.min, valoare_max: next.max }),
    },
    {
      key: 'progres',
      kind: 'choice',
      single: true,
      label: labels.progres,
      value: band >= 0 ? [band] : [],
      options: overview.progress.map((each, index) => ({
        value: index,
        label: t.pnrr.list.progressBands[index] ?? String(each.start),
        count: each.count,
      })),
      // A range from an address that is not one of the bands is still shown, so it can
      // be cleared.
      chip:
        band >= 0
          ? t.pnrr.list.progressBands[band]
          : search.progres_min !== undefined || search.progres_max !== undefined
            ? t.pnrr.list.progressRange(
                search.progres_min ?? 0,
                search.progres_max ?? 100,
              )
            : null,
      clear: { progres_min: undefined, progres_max: undefined },
      patch: (next) => progressPatch(next[0]),
    },
  ]
}

// The address of one progress band, or of none.
export function progressPatch(index: number | undefined) {
  const band = index === undefined ? undefined : PROGRESS_BANDS[index]
  return {
    progres_min: band?.min,
    progres_max: band && 'max' in band ? band.max : undefined,
  }
}
