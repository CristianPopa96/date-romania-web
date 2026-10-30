// The filters the list of contracts declares to its FilterBar, from what the API accepts:
// Perioada, Valoare, the other party, CPV, Fel, Fonduri UE, and on a company's page how it
// won them. The list of every contract (`cui` null) takes Firmă, Instituție, Câștigat,
// Județ, CPV, Fonduri UE and Perioada (design round 14). Each says its chip once chosen,
// and the change of address its panel asks for.

import type { FilterDecl } from '#/components/list/filter-types'
import type { Contract } from '#/features/contracts/api'
import {
  getContractCpvCodes,
  getContractParties,
} from '#/features/contracts/api-list'
import type { ContractOverview } from '#/features/contracts/api-list'
import { contractFilter, wonOfParam } from '#/features/contracts/list'
import type { ContractListSearch, Won } from '#/features/contracts/list'
import type { Messages } from '#/i18n'
import type { Role } from '#/lib/api'
import { countyFilter } from '#/lib/county-filter'
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
  cui: number | null
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
  // A party filter: the winner ("Firmă" on the list of every contract), or the buyer.
  const party = (param: 'furnizor' | 'institutie'): FilterDecl => {
    const chosen = search[param]
    const side = param === 'furnizor' ? 'supplier' : 'buyer'
    return {
      key: param,
      kind: 'entity',
      label:
        cui === null && param === 'furnizor' ? labels.firma : labels[param],
      value: chosen === undefined ? undefined : String(chosen),
      chip:
        chosen === undefined ? null : partyName(chosen, side, items, overview),
      clear: { [param]: undefined },
      lookup: async (find) =>
        (await getContractParties({ data: { filter, side, find } })).map(
          (option) => ({
            value: String(option.cui),
            label: option.name,
            sub: `CUI ${option.cui}`,
            count: option.count,
          }),
        ),
      patch: (next) => ({
        [param]: next === undefined ? undefined : Number(next),
      }),
    }
  }
  const [periodDecl, value, cpv, kind, euDecl] = decls
  // The list of every contract: both parties are filters, and how a contract was won is a
  // choice of its own, both ways when not chosen.
  if (cui === null) {
    const chosen = wonOfParam(search.castig)
    const how = chosen === undefined ? undefined : WON_CHOICE[chosen]
    return [
      party('furnizor'),
      party('institutie'),
      {
        key: 'castig',
        kind: 'choice',
        single: true,
        label: labels.castig,
        value: how === undefined ? [] : [how],
        options: overview.won.map((option) => ({
          value: WON_CHOICE[option.value],
          label: t.contractList.won[option.value],
          count: option.count,
        })),
        chip: chosen ? t.contractList.won[chosen] : null,
        clear: { castig: undefined },
        patch: (next) => ({
          castig: next.length
            ? next[0] === WON_CHOICE.association
              ? 'asociere'
              : 'singur'
            : undefined,
        }),
      },
      countyFilter(search.judet, labels.judet),
      cpv,
      euDecl,
      periodDecl,
    ]
  }
  const own: Array<FilterDecl> = [
    periodDecl,
    value,
    party(role === 'institutions' ? 'furnizor' : 'institutie'),
    cpv,
    kind,
    euDecl,
  ]
  // A company's list is one kind of win at a time. Cleared, it goes back to its default:
  // alone, or in association when the company won nothing alone.
  if (role === 'suppliers' && won) {
    own.push({
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
  return own
}

// The name of the party chosen, from the rows shown or the chart; its CUI if neither has it.
function partyName(
  cui: number,
  side: 'supplier' | 'buyer',
  items: Array<Contract>,
  overview: ContractOverview,
) {
  const fromRows =
    side === 'supplier'
      ? items
          .flatMap((item) => item.winners)
          .find((winner) => winner.supplier?.cui === cui)?.supplier?.name
      : items.find((item) => item.buyer?.cui === cui)?.buyer?.name
  const fromChart = overview.parties.find((each) => each.cui === cui)?.name
  return fromRows ?? fromChart ?? `CUI ${cui}`
}
