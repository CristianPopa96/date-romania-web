// The filters the list of contracts declares to its FilterBar, from what the API accepts:
// Perioada, Valoare, the other party, CPV, Fel, Fonduri UE, and on a company's page how it
// won them. Each says its chip once chosen, and the change of address its panel asks for.

import type { FilterDecl } from '#/components/list/filter-types'
import type { Contract } from '#/features/contracts/api'
import {
  getContractCpvCodes,
  getContractParties,
} from '#/features/contracts/api-list'
import type { ContractOverview } from '#/features/contracts/api-list'
import { contractFilter } from '#/features/contracts/list'
import type { ContractListSearch, Won } from '#/features/contracts/list'
import type { Messages } from '#/i18n'
import type { Role } from '#/lib/api'
import type { Format } from '#/lib/format'
import { choiceFromParam, choiceToParam } from '#/lib/list'
import type { Period } from '#/lib/list'
import { periodChip, rangeChip } from '#/lib/list-chips'

const SMALL = 100_000
const LARGE = 1_000_000

// How a company won, as a choice: 1 alone, 2 in an association.
const WON_CHOICE: Record<Won, number> = { alone: 1, association: 2 }

export function contractFilterDecls({
  role,
  cui,
  search,
  won,
  overview,
  items,
  held,
  t,
  f,
}: {
  role: Role
  cui: number
  search: ContractListSearch
  won: Won | undefined
  overview: ContractOverview
  items: Array<Contract>
  held: { first: string; last: string } | null
  t: Messages
  f: Format
}): Array<FilterDecl> {
  const labels = t.contractList.filters
  const filter = contractFilter(role, cui, search, won)
  const party =
    role === 'institutions'
      ? ({ param: 'furnizor', api: 'supplier' } as const)
      : ({ param: 'institutie', api: 'buyer' } as const)
  const partyCui = search[party.param]
  const kinds = choiceFromParam(search.fel) ?? []
  const eu = search.ue === undefined ? [] : [search.ue === 'da' ? 1 : 0]
  const period: Period = { from: search.de_la, to: search.pana_la }

  const decls: Array<FilterDecl> = [
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
        { label: t.contractList.valuePresets.small, max: SMALL },
        { label: t.contractList.valuePresets.middle, min: SMALL, max: LARGE },
        { label: t.contractList.valuePresets.large, min: LARGE },
      ],
      chip: rangeChip(search.valoare_min, search.valoare_max, t, f),
      clear: { valoare_min: undefined, valoare_max: undefined },
      patch: (next) => ({ valoare_min: next.min, valoare_max: next.max }),
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
          await getContractParties({ data: { filter, side: party.api, find } })
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
        (await getContractCpvCodes({ data: { filter, find } })).map(
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
    {
      key: 'fel',
      kind: 'choice',
      label: labels.fel,
      value: kinds,
      options: overview.kinds.map((option) => ({
        value: option.value,
        label: t.contractList.kinds[option.value] ?? String(option.value),
        count: option.count,
      })),
      chip: kinds.length
        ? kinds
            .map((kind) => t.contractList.kinds[kind] ?? String(kind))
            .join(', ')
        : null,
      clear: { fel: undefined },
      patch: (next) => ({ fel: choiceToParam(next) }),
    },
    {
      key: 'ue',
      kind: 'choice',
      single: true,
      label: labels.ue,
      value: eu,
      options: overview.eu_funded.map((option) => ({
        value: option.value,
        label: t.contractList.eu[option.value] ?? String(option.value),
        count: option.count,
      })),
      chip: eu.length ? (t.contractList.eu[eu[0]] ?? null) : null,
      clear: { ue: undefined },
      patch: (next) => ({
        ue: next.length ? (next[0] === 1 ? 'da' : 'nu') : undefined,
      }),
    },
  ]
  // A company's list is one kind of win at a time. Cleared, it goes back to its default:
  // alone, or in association when the company won nothing alone.
  if (role === 'suppliers' && won) {
    decls.push({
      key: 'castig',
      kind: 'choice',
      single: true,
      label: labels.castig,
      value: [WON_CHOICE[won]],
      options: overview.won.map((option) => ({
        value: WON_CHOICE[option.value],
        label: t.contractList.won[option.value],
        count: option.count,
      })),
      chip: search.castig ? t.contractList.won[won] : null,
      clear: { castig: undefined },
      patch: (next) => ({
        castig: next.length
          ? next[0] === WON_CHOICE.association
            ? 'asociere'
            : 'singur'
          : undefined,
      }),
    })
  }
  return decls
}

// The name of the party chosen, from the rows shown or the chart; its CUI if neither has it.
function partyName(
  cui: number,
  role: Role,
  items: Array<Contract>,
  overview: ContractOverview,
) {
  const fromRows =
    role === 'institutions'
      ? items
          .flatMap((item) => item.winners)
          .find((winner) => winner.supplier?.cui === cui)?.supplier?.name
      : items.find((item) => item.buyer?.cui === cui)?.buyer?.name
  const fromChart = overview.parties.find((each) => each.cui === cui)?.name
  return fromRows ?? fromChart ?? `CUI ${cui}`
}
