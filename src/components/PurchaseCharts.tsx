import { Flex } from '@radix-ui/themes'

import { ChartCard } from '#/components/list/ChartCard'
import type { Patch } from '#/components/list/filter-types'
import { RankBars } from '#/components/list/RankBars'
import { TimeBars } from '#/components/list/TimeBars'
import { useI18n } from '#/i18n/context'
import type { Role } from '#/lib/api'
import type { PurchaseOverview } from '#/lib/api-purchases'
import { fillSteps, isOpen, monthOf } from '#/lib/list'
import { partyOf } from '#/lib/purchase-list'
import type { PurchaseListSearch } from '#/lib/purchase-list'

// The two charts of a list of direct purchases: accepted value over time, and the largest
// counterparts. Both count what every total counts (accepted purchases under their limit)
// under the filters of the list; a bar clicked becomes a filter.
export function PurchaseCharts({
  role,
  search,
  overview,
  onApply,
}: {
  role: Role
  search: PurchaseListSearch
  overview: PurchaseOverview
  onApply: (patch: Patch) => void
}) {
  const { t, f } = useI18n()
  const step = overview.step
  const points = fillSteps(
    overview.points.map((point) => ({
      start: point.start,
      value: point.value,
    })),
    step,
    (start) => ({ start, value: 0 }),
  )
  const span = (start: string) =>
    step === 'month' ? monthOf(start) : { from: start, to: start }
  const chosen =
    points.find((point) => {
      const { from, to } = span(point.start)
      return search.de_la === from && search.pana_la === to
    })?.start ?? null
  const open = points.some((point) =>
    isOpen(point.start, step, overview.last_day_held ?? null),
  )
  const name = (start: string) =>
    step === 'month' ? f.month(start) : f.day(start)

  const party = partyOf(role)
  const chosenParty = search[party.param]
  const rows = [
    ...overview.parties.map((each) => ({
      key: String(each.cui),
      label: each.name,
      value: each.value,
      detail: t.purchaseList.partyCount(each.accepted, f.count(each.accepted)),
      on: chosenParty === each.cui,
      pick: () =>
        onApply({
          [party.param]: chosenParty === each.cui ? undefined : each.cui,
        }),
    })),
    ...(overview.others.parties > 0
      ? [
          {
            key: 'others',
            label: t.list.chart.others(f.count(overview.others.parties)),
            value: overview.others.value,
          },
        ]
      : []),
  ]

  return (
    <Flex gap="3" wrap="wrap" align="stretch">
      <ChartCard
        title={t.purchaseList.timeTitle[step]}
        unit={t.purchaseList.timeUnit}
        hint={t.list.chart.clickHint}
        note={
          open
            ? step === 'month'
              ? t.list.chart.openMonth
              : t.list.chart.openDay
            : null
        }
        rows={points.map((point) => [name(point.start), f.lei(point.value)])}
      >
        <TimeBars
          points={points}
          step={step}
          lastHeld={overview.last_day_held ?? null}
          chosen={chosen}
          onPick={(start) => {
            const { from, to } = span(start)
            // The bar chosen again gives the list back its period.
            onApply(
              start === chosen
                ? { de_la: undefined, pana_la: undefined }
                : { de_la: from, pana_la: to },
            )
          }}
        />
      </ChartCard>
      {rows.length ? (
        <ChartCard
          title={t.purchaseList.partiesTitle[overview.party]}
          unit={t.list.chart.sameFilters}
          hint={t.list.chart.clickHint}
          rows={rows.map((row) => [row.label, f.lei(row.value)])}
        >
          <RankBars rows={rows} format={f.leiShort} />
        </ChartCard>
      ) : null}
    </Flex>
  )
}
