import { Flex } from '@radix-ui/themes'

import { ChartCard } from '#/components/list/ChartCard'
import type { Patch } from '#/components/list/filter-types'
import { RankBars } from '#/components/list/RankBars'
import { StatusBars } from '#/components/list/StatusBars'
import type { Part } from '#/components/list/StatusBars'
import type { EuProjectOverview } from '#/features/eu-projects/api-list'
import { programmeSlug } from '#/features/eu-projects/eu'
import type { HeldProgramme } from '#/features/eu-projects/filters'
import {
  euStatusesFromParam,
  euStatusesToParam,
} from '#/features/eu-projects/list'
import type { EuProjectListSearch } from '#/features/eu-projects/list'
import { useI18n } from '#/i18n/context'

const STATUS_COLOR = {
  in_progress: 'amber',
  finished: 'green',
  terminated: 'gray',
} as const

// The two charts of a beneficiary's EU projects: the value per programme, side by side and
// never added (each programme's figures are of its own list's day), and the projects by
// status. A bar or a status clicked becomes a filter.
export function EuProjectCharts({
  search,
  overview,
  programmes,
  onApply,
}: {
  search: EuProjectListSearch
  overview: EuProjectOverview
  programmes: ReadonlyArray<HeldProgramme>
  onApply: (patch: Patch) => void
}) {
  const { t, f } = useI18n()
  const slugs = search.program?.split(',') ?? []
  const rows = overview.programmes.flatMap((option) => {
    const held = programmes.find((each) => each.code === option.value)
    if (!held || option.total === null) return []
    const slug = programmeSlug(held)
    const on = slugs.length === 1 && slugs[0] === slug
    return [
      {
        key: slug,
        label: `${held.code} ${held.period}`,
        value: option.total,
        detail: t.eu.list.projects(option.count, f.count(option.count)),
        on,
        pick: () => onApply({ program: on ? undefined : slug }),
      },
    ]
  })
  const statuses = euStatusesFromParam(search.stare) ?? []
  const parts: Array<Part> = [
    ...overview.statuses.map((option) => {
      const on = statuses.length === 1 && statuses[0] === option.value
      return {
        key: option.value,
        label: t.eu.status[option.value],
        count: option.count,
        color: STATUS_COLOR[option.value],
        on,
        pick: () =>
          onApply({
            stare: on ? undefined : euStatusesToParam([option.value]),
          }),
      }
    }),
    ...(overview.other_statuses > 0
      ? [
          {
            key: 'other',
            label: t.eu.list.otherStatus,
            count: overview.other_statuses,
            color: 'gray' as const,
          },
        ]
      : []),
  ]

  return (
    <Flex gap="3" wrap="wrap" align="stretch">
      {rows.length ? (
        <ChartCard
          title={t.eu.list.programmesTitle}
          unit={t.eu.list.programmesUnit}
          hint={t.list.chart.clickHint}
          rows={rows.map((row) => [row.label, f.lei(row.value)])}
        >
          <RankBars rows={rows} format={f.leiShort} />
        </ChartCard>
      ) : null}
      <ChartCard
        title={t.eu.list.statusTitle}
        unit={t.eu.list.statusUnit}
        hint={t.list.chart.clickHint}
        rows={parts.map((part) => [part.label, f.count(part.count)])}
      >
        <StatusBars parts={parts} format={f.count} />
      </ChartCard>
    </Flex>
  )
}
