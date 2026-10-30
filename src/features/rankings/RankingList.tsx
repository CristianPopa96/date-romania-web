import { useSuspenseQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { Flex, Text } from '@radix-ui/themes'

import { ChartCard } from '#/components/list/ChartCard'
import type { Patch } from '#/components/list/filter-types'
import { ListEmpty } from '#/components/list/ListEmpty'
import { ListView } from '#/components/list/ListView'
import { RankBars } from '#/components/list/RankBars'
import { TreeMap } from '#/components/list/TreeMap'
import type { TreeTile } from '#/components/list/TreeMap'
import { IncompleteContracts, PeriodNote } from '#/components/Notes'
import { SourceLine } from '#/components/SourceLine'
import { cpvDivisionsQuery } from '#/features/patterns'
import { RankingRows } from '#/features/rankings/RankingRows'
import type { RankedList } from '#/features/rankings/api'
import { rankingFilterDecls } from '#/features/rankings/filters'
import {
  rankingKind,
  rankingListQuery,
  rankingTopQuery,
} from '#/features/rankings/queries'
import {
  RANKING_COLUMNS,
  RANKING_FILTER_PARAMS,
  rankingSort,
} from '#/features/rankings/urls'
import type { RankingSearch, RankingTab } from '#/features/rankings/urls'
import { useI18n } from '#/i18n/context'
import type { Role } from '#/lib/api'
import { chosenFilters, sortToParam, withoutFilters } from '#/lib/list'
import type { Sort } from '#/lib/list'
import { statsQuery } from '#/lib/queries'

// One ranking, declared to the list pattern (ListView): winners or institutions of
// contracts, or suppliers or institutions of direct purchases, never both kinds of money.
// Its filters, the count of parties ranked, the ten largest as bars (each opens its page),
// the places in the order chosen, and the pager. A name searched for keeps its place.
export function RankingList({
  tab,
  search,
  onSearch,
}: {
  tab: RankingTab
  search: RankingSearch
  onSearch: (search: RankingSearch) => void
}) {
  const { t, f } = useI18n()
  const navigate = useNavigate()
  const { data: list } = useSuspenseQuery(rankingListQuery(search))
  const { data: top } = useSuspenseQuery(rankingTopQuery(search))
  const { data: divisions } = useSuspenseQuery(cpvDivisionsQuery)
  const { data: stats } = useSuspenseQuery(statsQuery)
  if (list === 'failed' || !list) {
    return (
      <Text size="2" color="gray">
        {t.list.failed}
      </Text>
    )
  }

  const l = t.rankings.list
  const kind = rankingKind(search)
  const contracts = kind.startsWith('contract-')
  const role: Role =
    kind === 'contract-suppliers' || kind === 'suppliers'
      ? 'suppliers'
      : 'institutions'
  const countText = (n: number) =>
    contracts
      ? t.contracts.count(n, f.count(n))
      : t.partners.accepted(n, f.count(n))
  const apply = (patch: Patch) =>
    onSearch({ ...search, ...patch, pagina: undefined })
  const sort = rankingSort(search)
  const onSort = (next: Sort | null) =>
    apply({ ordine: next ? sortToParam(next, RANKING_COLUMNS) : undefined })
  const q = search.q === undefined ? undefined : String(search.q)
  const summary = stats?.direct_purchases
  const held =
    summary?.first_day && summary.last_day
      ? { first: summary.first_day, last: summary.last_day }
      : null
  const bars = top === 'failed' || !top ? [] : top.items
  // The ten largest, and the rest added up as one tile. Won in association, a contract
  // is in the value of each of its members, so the rest would count it again: left out.
  const association = search.castigate === 'asociere'
  const rest =
    top === 'failed' || !top || association
      ? null
      : {
          parties: top.total - bars.length,
          value: top.value - bars.reduce((sum, row) => sum + row.value, 0),
        }
  const tiles: Array<TreeTile> = [
    ...bars.map((row) => ({
      key: String(row.cui),
      label: row.name,
      value: row.value,
      detail: countText(row.count),
      pick: () =>
        void navigate({
          to: role === 'institutions' ? '/institutii/$cui' : '/furnizori/$cui',
          params: { cui: String(row.cui) },
        }),
    })),
    ...(rest && rest.parties > 0 && rest.value > 0
      ? [
          {
            key: 'rest',
            label: l.rest(role, rest.parties, f.count(rest.parties)),
            value: rest.value,
          },
        ]
      : []),
  ]
  const source = sourceOf(list)

  return (
    <Flex direction="column" gap="3">
      {list.contract ? (
        <IncompleteContracts period={list.contract.period} />
      ) : summary ? (
        <PeriodNote summary={summary} />
      ) : null}
      <ListView
        title={l.titles[kind]}
        search={{
          q,
          what: l.searchWhat,
          filters: rankingFilterDecls({
            tab,
            search,
            divisions: divisions ?? [],
            held,
            t,
            f,
          }),
          onApply: apply,
        }}
        summary={{
          headline: l.parties(role, list.total, f.count(list.total)),
          detail:
            search.castigate === 'asociere'
              ? t.rankings.associationNote
              : l.order[sort.column === 'numar' ? 'count' : 'value'](contracts),
        }}
        views={
          bars.length
            ? {
                charts: search.vedere !== 'tabel',
                onCharts: (charts) =>
                  onSearch({
                    ...search,
                    vedere: charts ? undefined : 'tabel',
                  }),
              }
            : null
        }
        file={null}
        sort={{
          value: sort,
          columns: [
            { column: 'valoare', label: l.value },
            {
              column: 'numar',
              label: contracts ? l.contracts : l.purchases,
            },
          ],
          isDefault: search.ordine === undefined,
          onSort,
        }}
        charts={
          // In a row, as every list's charts: a card's size is its width there.
          <Flex gap="3" wrap="wrap" align="stretch">
            <ChartCard
              title={
                association
                  ? l.topTitleAssociation
                  : q
                    ? l.topTitleSearch
                    : l.topTitle
              }
              unit={l.topUnit}
              hint={association ? l.topHintBars : l.topHint}
              rows={tiles.map((tile) => [tile.label, f.lei(tile.value)])}
            >
              {/* Won in association, a contract is in each member's value: two tiles could
                  be the same money, so they are bars, never parts of one whole. */}
              {association ? (
                <RankBars
                  rows={tiles.map((tile) => ({ ...tile, on: false }))}
                  format={f.leiShort}
                />
              ) : (
                <TreeMap tiles={tiles} format={f.leiShort} />
              )}
            </ChartCard>
          </Flex>
        }
        rows={
          <RankingRows
            items={list.items}
            role={role}
            countLabel={contracts ? l.contracts : l.purchases}
            countText={countText}
            q={q}
            sort={sort}
            onSort={onSort}
          />
        }
        empty={
          <ListEmpty
            back={null}
            onClear={
              chosenFilters(RANKING_FILTER_PARAMS, search).length
                ? () => onSearch(withoutFilters(RANKING_FILTER_PARAMS, search))
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
          onSize: (next) =>
            apply({ pe_pagina: next === 25 ? undefined : next }),
        }}
      />
      {source ? <SourceLine source={source} /> : null}
    </Flex>
  )
}

function sourceOf(list: RankedList) {
  return list.contract?.source ?? list.direct?.source ?? null
}
