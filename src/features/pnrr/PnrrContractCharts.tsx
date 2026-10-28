import { Flex } from '@radix-ui/themes'

import { ChartCard } from '#/components/list/ChartCard'
import type { Patch } from '#/components/list/filter-types'
import { RankBars } from '#/components/list/RankBars'
import { StatusBars } from '#/components/list/StatusBars'
import type { Part } from '#/components/list/StatusBars'
import type { PnrrContractOverview } from '#/features/pnrr/api-list'
import { progressPatch } from '#/features/pnrr/filters'
import {
  pnrrStatusesFromParam,
  pnrrStatusesToParam,
  progressBand,
} from '#/features/pnrr/list'
import type { PnrrListSearch } from '#/features/pnrr/list'
import { useI18n } from '#/i18n/context'

// The two charts of a beneficiary's PNRR contracts: the contracts by status, those whose
// measures differ as a part of their own; and by physical progress. A part or a band
// clicked becomes a filter.
export function PnrrContractCharts({
  search,
  overview,
  onApply,
}: {
  search: PnrrListSearch
  overview: PnrrContractOverview
  onApply: (patch: Patch) => void
}) {
  const { t, f } = useI18n()
  const statuses = pnrrStatusesFromParam(search.stare) ?? []
  const parts: Array<Part> = [
    ...overview.statuses.map((option) => {
      const on = statuses.length === 1 && statuses[0] === option.value
      return {
        key: option.value,
        label: t.pnrr.status[option.value],
        count: option.count,
        // A state of the work, never a judgement: amber while it runs, green once done.
        color:
          option.value === 'finished' ? ('green' as const) : ('amber' as const),
        on,
        pick: () =>
          onApply({
            stare: on ? undefined : pnrrStatusesToParam([option.value]),
          }),
      }
    }),
    ...(overview.measures_differ > 0
      ? [
          {
            key: 'differ',
            label: t.pnrr.list.differPart,
            count: overview.measures_differ,
            color: 'gray' as const,
          },
        ]
      : []),
  ]
  const band = progressBand(search)
  const bands = overview.progress.map((each, index) => ({
    key: String(index),
    label: t.pnrr.list.progressBands[index] ?? String(each.start),
    value: each.count,
    on: band === index,
    pick: () => onApply(progressPatch(band === index ? undefined : index)),
  }))

  return (
    <Flex gap="3" wrap="wrap" align="stretch">
      <ChartCard
        title={t.pnrr.list.statusTitle}
        unit={t.pnrr.list.statusUnit}
        hint={t.list.chart.clickHint}
        rows={parts.map((part) => [part.label, f.count(part.count)])}
      >
        <StatusBars parts={parts} format={f.count} />
      </ChartCard>
      <ChartCard
        title={t.pnrr.list.progressTitle}
        unit={t.pnrr.list.progressUnit}
        hint={t.list.chart.clickHint}
        rows={bands.map((each) => [each.label, f.count(each.value)])}
      >
        <RankBars rows={bands} format={f.count} />
      </ChartCard>
    </Flex>
  )
}
