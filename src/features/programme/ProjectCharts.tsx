import { Flex } from '@radix-ui/themes'

import { ChartCard } from '#/components/list/ChartCard'
import type { Patch } from '#/components/list/filter-types'
import { RankBars } from '#/components/list/RankBars'
import type { RankRow } from '#/components/list/RankBars'
import { StatusBars } from '#/components/list/StatusBars'
import type { Part } from '#/components/list/StatusBars'
import type { ProjectOverview } from '#/features/programme/api-list'
import { matchesFromParam, matchesToParam } from '#/features/programme/list'
import type { ProjectListSearch } from '#/features/programme/list'
import { countySlug } from '#/features/programme/programme'
import { useI18n } from '#/i18n/context'

// How many counties the chart names; the rest are one bar.
const TOP_COUNTIES = 6

// The two charts of the Anghel Saligny projects: what was paid by county, and the projects
// by whether a SEAP contract was found for them. A bar or a part clicked becomes a filter.
export function ProjectCharts({
  search,
  overview,
  onApply,
}: {
  search: ProjectListSearch
  overview: ProjectOverview
  onApply: (patch: Patch) => void
}) {
  const { t, f } = useI18n()
  const l = t.programme.list
  const named = overview.counties.slice(0, TOP_COUNTIES)
  const rest = overview.counties.slice(TOP_COUNTIES)
  const counties: Array<RankRow> = [
    ...named.map((option) => {
      const slug = countySlug(option.value)
      const on = search.judet === slug
      return {
        key: option.value,
        label: option.name,
        value: option.paid,
        detail: l.projects(option.count, f.count(option.count)),
        on,
        pick: () => onApply({ judet: on ? undefined : slug }),
      }
    }),
    ...(rest.length
      ? [
          {
            key: 'others',
            label: t.list.chart.others(f.count(rest.length)),
            value: rest.reduce((sum, option) => sum + option.paid, 0),
          },
        ]
      : []),
  ]
  const matches = matchesFromParam(search.legatura) ?? []
  const parts: Array<Part> = overview.matches.map((option) => {
    const on = matches.length === 1 && matches[0] === option.value
    return {
      key: option.value,
      label: t.programme.match[option.value],
      count: option.count,
      // As the match marks: amber where a contract was found, gray where none was.
      color:
        option.value === 'one' || option.value === 'several'
          ? ('amber' as const)
          : ('gray' as const),
      on,
      pick: () =>
        onApply({
          legatura: on ? undefined : matchesToParam([option.value]),
        }),
    }
  })

  return (
    <Flex gap="3" wrap="wrap" align="stretch">
      <ChartCard
        title={l.countiesTitle}
        unit={l.countiesUnit}
        hint={t.list.chart.clickHint}
        rows={counties.map((row) => [row.label, f.lei(row.value)])}
      >
        <RankBars rows={counties} format={f.leiShort} />
      </ChartCard>
      <ChartCard
        title={l.matchTitle}
        unit={l.matchUnit}
        hint={t.list.chart.clickHint}
        rows={parts.map((part) => [part.label, f.count(part.count)])}
      >
        <StatusBars parts={parts} format={f.count} />
      </ChartCard>
    </Flex>
  )
}
