// The filters a ranking declares to its FilterBar: Câștigat (winners) or Clasament (direct
// purchases: who sold, who bought), Perioada (direct purchases), CPV and, for contracts,
// Fonduri UE. A ranking cannot count each option, so its choices carry no counts. A
// choice panel takes numbers: an option is offered by its place, and written back to the
// address as its word or code.

import type { FilterDecl } from '#/components/list/filter-types'
import { cpvDivisionLabel } from '#/features/patterns'
import type { CpvDivision } from '#/features/patterns'
import { isContractTab } from '#/features/rankings/urls'
import type { RankingSearch, RankingTab } from '#/features/rankings/urls'
import type { Messages } from '#/i18n'
import type { Format } from '#/lib/format'
import { periodChip } from '#/lib/list-chips'

const EU = ['da', 'nu'] as const

export function rankingFilterDecls({
  tab,
  search,
  divisions,
  held,
  t,
  f,
}: {
  tab: RankingTab
  search: RankingSearch
  divisions: ReadonlyArray<CpvDivision>
  // The days of direct purchases held, for the period's presets.
  held: { first: string; last: string } | null
  t: Messages
  f: Format
}): Array<FilterDecl> {
  const labels = t.rankings.list.filters
  const code = search.cpv === undefined ? undefined : String(search.cpv)
  // The code in the address stays a choice even when the list could not be read.
  const options =
    code === undefined || divisions.some((division) => division.code === code)
      ? divisions
      : [...divisions, { code, name: null }]
  const cpv = options.findIndex((division) => division.code === code)
  const decls: Array<FilterDecl> = []

  if (tab === 'furnizori') {
    const together = search.castigate === 'asociere'
    decls.push({
      key: 'castigate',
      kind: 'choice',
      single: true,
      label: labels.castigate,
      // Alone is the ranking's own; in an association is chosen.
      value: together ? [1] : [0],
      options: [
        { value: 0, label: t.rankings.wonAlone },
        { value: 1, label: t.rankings.wonTogether },
      ],
      // The ranking's own choice is no filter: its title says it.
      chip: together ? t.rankings.wonTogether : null,
      clear: { castigate: undefined },
      patch: (next) => ({ castigate: next[0] === 1 ? 'asociere' : undefined }),
    })
  }
  if (tab === 'achizitii') {
    const buyers = search.parte === 'institutii'
    decls.push(
      {
        key: 'parte',
        kind: 'choice',
        single: true,
        label: labels.parte,
        value: buyers ? [1] : [0],
        options: [
          { value: 0, label: t.rankings.suppliers },
          { value: 1, label: t.rankings.institutions },
        ],
        chip: buyers ? t.rankings.institutions : null,
        clear: { parte: undefined },
        patch: (next) => ({ parte: next[0] === 1 ? 'institutii' : undefined }),
      },
      {
        key: 'perioada',
        kind: 'period',
        label: labels.perioada,
        value: { from: search.de_la, to: search.pana_la },
        held,
        chip: periodChip({ from: search.de_la, to: search.pana_la }, t, f),
        clear: { de_la: undefined, pana_la: undefined },
        patch: (next) => ({ de_la: next.from, pana_la: next.to }),
      },
    )
  }
  decls.push({
    key: 'cpv',
    kind: 'choice',
    single: true,
    label: labels.cpv,
    value: cpv >= 0 ? [cpv] : [],
    options: options.map((division, index) => ({
      value: index,
      label: cpvDivisionLabel(division.code, division),
    })),
    chip: cpv >= 0 ? cpvDivisionLabel(options[cpv].code, options[cpv]) : null,
    clear: { cpv: undefined },
    patch: (next) => ({
      cpv: next.length ? options[next[0]].code : undefined,
    }),
  })
  if (isContractTab(tab)) {
    const eu = EU.findIndex((value) => value === search.ue)
    decls.push({
      key: 'ue',
      kind: 'choice',
      single: true,
      label: labels.ue,
      value: eu >= 0 ? [eu] : [],
      options: [
        { value: 0, label: t.rankings.filters.euYes },
        { value: 1, label: t.rankings.filters.euNo },
      ],
      chip: eu >= 0 ? t.rankings.filters[eu === 0 ? 'euYes' : 'euNo'] : null,
      clear: { ue: undefined },
      patch: (next) => ({ ue: next.length ? EU[next[0]] : undefined }),
    })
  }
  return decls
}
