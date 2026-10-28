// The filters the list of direct purchases declares to its FilterBar, from what the API
// accepts: Perioada, Valoare, Stare, Tip, the other party, CPV. Each says its chip once
// chosen, and the change of address its panel asks for.

import type { FilterDecl } from '#/components/list/filter-types'
import type { Messages } from '#/i18n'
import type { Purchase, PurchaseOverview } from '#/features/purchases/api'
import type { Role } from '#/lib/api'
import {
  getPurchaseCpvCodes,
  getPurchaseParties,
} from '#/features/purchases/api'
import type { Format } from '#/lib/format'
import { choiceFromParam, choiceToParam, periodYear } from '#/lib/list'
import type { Period } from '#/lib/list'
import { partyOf, purchaseFilter } from '#/features/purchases/list'
import type { PurchaseListSearch } from '#/features/purchases/list'

const SMALL = 10_000
const LARGE = 100_000

export function purchaseFilterDecls({
  role,
  cui,
  search,
  overview,
  items,
  held,
  t,
  f,
}: {
  role: Role
  cui: number
  search: PurchaseListSearch
  overview: PurchaseOverview
  items: Array<Purchase>
  held: { first: string; last: string } | null
  t: Messages
  f: Format
}): Array<FilterDecl> {
  const labels = t.purchaseList.filters
  const party = partyOf(role)
  const filter = purchaseFilter(role, cui, search)
  const chosenMany = (values: Array<string>) =>
    values.length > 2
      ? t.list.chosenMany(f.count(values.length))
      : values.join(', ')
  const states = choiceFromParam(search.stare) ?? []
  const types = choiceFromParam(search.tip) ?? []
  const period: Period = { from: search.de_la, to: search.pana_la }
  const partyCui = search[party.param]

  return [
    {
      key: 'perioada',
      kind: 'period',
      label: labels.perioada,
      value: period,
      held,
      chip: periodChip(period, t, f),
      clear: { de_la: undefined, pana_la: undefined },
      patch: (next) => ({ de_la: next.from, pana_la: next.to }),
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
        { label: t.purchaseList.valuePresets.small, max: SMALL },
        { label: t.purchaseList.valuePresets.middle, min: SMALL, max: LARGE },
        { label: t.purchaseList.valuePresets.large, min: LARGE },
      ],
      chip: rangeChip(search.valoare_min, search.valoare_max, t, f),
      clear: { valoare_min: undefined, valoare_max: undefined },
      patch: (next) => ({ valoare_min: next.min, valoare_max: next.max }),
    },
    {
      key: 'stare',
      kind: 'choice',
      label: labels.stare,
      value: states,
      options: overview.states.map((option) => ({
        value: option.value,
        label: t.purchases.states[option.value] ?? String(option.value),
        count: option.count,
      })),
      chip: states.length
        ? chosenMany(
            states.map(
              (state) => t.purchaseList.stateChip[state] ?? String(state),
            ),
          )
        : null,
      clear: { stare: undefined },
      patch: (next) => ({ stare: choiceToParam(next) }),
    },
    {
      key: 'tip',
      kind: 'choice',
      label: labels.tip,
      value: types,
      options: overview.contract_types.map((option) => ({
        value: option.value,
        label: t.purchaseList.types[option.value] ?? String(option.value),
        count: option.count,
      })),
      chip: types.length
        ? chosenMany(
            types.map((type) => t.purchaseList.types[type] ?? String(type)),
          )
        : null,
      clear: { tip: undefined },
      patch: (next) => ({ tip: choiceToParam(next) }),
    },
    {
      key: party.param,
      kind: 'entity',
      label: labels[party.param],
      value: partyCui === undefined ? undefined : String(partyCui),
      chip:
        partyCui === undefined
          ? null
          : partyName(partyCui, role, items, overview),
      clear: { [party.param]: undefined },
      lookup: async (find) =>
        (
          await getPurchaseParties({ data: { filter, side: party.api, find } })
        ).map((option) => ({
          value: String(option.cui),
          label: option.name,
          sub: `CUI ${option.cui}`,
          count: option.count,
        })),
      patch: (next) => ({
        [party.param]: next === undefined ? undefined : Number(next),
      }),
    },
    {
      key: 'cpv',
      kind: 'code',
      label: labels.cpv,
      value: search.cpv === undefined ? undefined : String(search.cpv),
      chip: search.cpv === undefined ? null : String(search.cpv),
      clear: { cpv: undefined },
      lookup: async (find) =>
        (await getPurchaseCpvCodes({ data: { filter, find } })).map(
          (option) => ({
            // The filter takes the digits; the part after the dash is a check digit.
            value: option.code.split('-')[0],
            label: option.name ?? option.code,
            sub: option.code,
            count: option.count,
          }),
        ),
      patch: (next) => ({ cpv: next }),
    },
  ]
}

// "2026", or "01.03–30.06.2026", or one end: "de la 01.03.2026".
export function periodChip(
  period: Period,
  t: Messages,
  f: Format,
): string | null {
  const { from, to } = period
  if (!from && !to) return null
  const year = periodYear(period)
  if (year) return String(year)
  if (from && to) {
    const days = f.span(from, to)
    return days ? `${days.from}–${days.to}` : null
  }
  return from
    ? t.list.period.since(f.day(from))
    : t.list.period.until(f.day(to as string))
}

// "50.000–270.120 lei", "de la 100.000 lei", "sub 10.000 lei".
export function rangeChip(
  min: number | undefined,
  max: number | undefined,
  t: Messages,
  f: Format,
): string | null {
  if (min === undefined && max === undefined) return null
  if (min !== undefined && max !== undefined) {
    return t.money.lei(t.list.range.between(f.count(min), f.count(max)))
  }
  return min !== undefined
    ? t.list.range.from(f.lei(min))
    : t.list.range.under(f.lei(max as number))
}

// The name of the party chosen, from the rows shown or the chart; its CUI if neither has it.
function partyName(
  cui: number,
  role: Role,
  items: Array<Purchase>,
  overview: PurchaseOverview,
) {
  const side = role === 'institutions' ? 'supplier' : 'buyer'
  const fromRows = items.find((item) => item[side]?.cui === cui)?.[side]?.name
  const fromChart = overview.parties.find((each) => each.cui === cui)?.name
  return fromRows ?? fromChart ?? `CUI ${cui}`
}
