// The filters a list of PNRR contracts declares to its FilterBar: a beneficiary's takes
// Măsură, a measure's Județ and Beneficiar; both Stare, Valoare, Progres fizic. A choice
// panel takes numbers, so a measure, a county, a beneficiary or a status is offered by its
// place in the overview's options, and written back to the address as its code, word or
// CUI; a county, a beneficiary and progress are one at a time.

import type { FilterDecl } from '#/components/list/filter-types'
import { PNRR_STATUSES } from '#/features/pnrr/api'
import type { PnrrContractOverview } from '#/features/pnrr/api-list'
import {
  PROGRESS_BANDS,
  pnrrStatusesFromParam,
  pnrrStatusesToParam,
  progressBand,
} from '#/features/pnrr/list'
import type { PnrrListOf, PnrrListSearch } from '#/features/pnrr/list'
import { countySlug, measureSlug } from '#/features/pnrr/pnrr'
import type { Messages } from '#/i18n'
import type { Format } from '#/lib/format'
import { rangeChip } from '#/lib/list-chips'

const SMALL = 1_000_000
const LARGE = 25_000_000

export function pnrrFilterDecls({
  of,
  search,
  overview,
  t,
  f,
}: {
  of: PnrrListOf
  search: PnrrListSearch
  overview: PnrrContractOverview
  t: Messages
  f: Format
}): Array<FilterDecl> {
  const labels = t.pnrr.list.filters
  const statuses = pnrrStatusesFromParam(search.stare) ?? []
  const band = progressBand(search)
  const chosen = (names: Array<string>) =>
    names.length > 2
      ? t.list.chosenMany(f.count(names.length))
      : names.join(', ')

  return [
    ...('beneficiary' in of
      ? [measureDecl(search, overview, t, chosen)]
      : [
          countyDecl(search, overview, t),
          beneficiaryDecl(search, overview, t),
        ]),
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

function measureDecl(
  search: PnrrListSearch,
  overview: PnrrContractOverview,
  t: Messages,
  chosen: (names: Array<string>) => string,
): FilterDecl {
  const measures = overview.measures
  const codes = search.masura?.split(',') ?? []
  const picked = measures
    .map((option, index) =>
      codes.includes(measureSlug(option.value)) ? index : -1,
    )
    .filter((index) => index >= 0)
  return {
    key: 'masura',
    kind: 'choice',
    label: t.pnrr.list.filters.masura,
    value: picked,
    options: measures.map((option, index) => ({
      value: index,
      label: option.value,
      count: option.count,
    })),
    chip: picked.length
      ? chosen(picked.map((index) => measures[index].value))
      : null,
    clear: { masura: undefined },
    patch: (next) => ({
      masura: next.length
        ? next.map((index) => measureSlug(measures[index].value)).join(',')
        : undefined,
    }),
  }
}

// The API takes one county: the dashboard's spelling, written without marks in the address.
function countyDecl(
  search: PnrrListSearch,
  overview: PnrrContractOverview,
  t: Messages,
): FilterDecl {
  const counties = overview.counties
  const picked = counties.findIndex(
    (option) => countySlug(option.value) === search.judet,
  )
  return {
    key: 'judet',
    kind: 'choice',
    single: true,
    label: t.pnrr.list.filters.judet,
    value: picked >= 0 ? [picked] : [],
    options: counties.map((option, index) => ({
      value: index,
      label: option.value,
      count: option.count,
    })),
    chip: picked >= 0 ? counties[picked].value : null,
    clear: { judet: undefined },
    patch: (next) => ({
      judet: next.length ? countySlug(counties[next[0]].value) : undefined,
    }),
  }
}

// The largest beneficiaries held as entities are the options; one from an address that is
// not among them is still shown by its CUI, so it can be cleared.
function beneficiaryDecl(
  search: PnrrListSearch,
  overview: PnrrContractOverview,
  t: Messages,
): FilterDecl {
  const held = overview.beneficiaries.flatMap((bar) =>
    bar.entity ? [{ ...bar, entity: bar.entity }] : [],
  )
  const picked = held.findIndex((bar) => bar.entity.cui === search.beneficiar)
  return {
    key: 'beneficiar',
    kind: 'choice',
    single: true,
    label: t.pnrr.list.filters.beneficiar,
    value: picked >= 0 ? [picked] : [],
    options: held.map((bar, index) => ({
      value: index,
      label: bar.entity.name,
      count: bar.contracts,
    })),
    chip:
      picked >= 0
        ? held[picked].entity.name
        : search.beneficiar !== undefined
          ? `CUI ${search.beneficiar}`
          : null,
    clear: { beneficiar: undefined },
    patch: (next) => ({
      beneficiar: next.length ? held[next[0]].entity.cui : undefined,
    }),
  }
}

// The address of one progress band, or of none.
export function progressPatch(index: number | undefined) {
  const band = index === undefined ? undefined : PROGRESS_BANDS[index]
  return {
    progres_min: band?.min,
    progres_max: band && 'max' in band ? band.max : undefined,
  }
}
