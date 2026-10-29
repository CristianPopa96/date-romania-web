import { Flex, Text } from '@radix-ui/themes'

import { ChartCard } from '#/components/list/ChartCard'
import type { Patch } from '#/components/list/filter-types'
import { RankBars } from '#/components/list/RankBars'
import { PROJECT_KINDS } from '#/features/projects/api'
import type { ProjectsOverview } from '#/features/projects/api'
import { kindsFromParam, kindsToParam } from '#/features/projects/list'
import type { ProjectListSearch } from '#/features/projects/list'
import { useI18n } from '#/i18n/context'

// The two charts of the list of projects. Both count projects, never sums: a count may be
// added across programmes, a value may not. "Proiecte pe programe": a bar sets the
// programme filter. "Cât de departe urmărim drumul": followed to the companies against
// those with no tied purchase.
export function ProjectCharts({
  search,
  overview,
  fixedKind,
  onApply,
}: {
  search: ProjectListSearch
  overview: ProjectsOverview
  fixedKind: boolean
  onApply: (patch: Patch) => void
}) {
  const { t, f } = useI18n()
  const p = t.projects
  const kinds = kindsFromParam(search.program) ?? []
  const byKind = PROJECT_KINDS.flatMap((kind) => {
    const option = overview.kinds.find((each) => each.value === kind)
    if (!option) return []
    const on = kinds.length === 1 && kinds[0] === kind
    return [
      {
        key: kind,
        label: p.kinds[kind],
        value: option.count,
        on,
        pick: () => onApply({ program: on ? undefined : kindsToParam([kind]) }),
      },
    ]
  })
  const companies =
    overview.reaches.find((each) => each.value === 'companies')?.count ?? 0
  const followed = [
    { key: 'firme', label: p.reachCompanies, value: companies },
    {
      key: 'fara',
      label: p.reachNone,
      value: overview.reaches
        .filter(
          (each) => each.value === 'beneficiary' || each.value === 'payments',
        )
        .reduce((n, each) => n + each.count, 0),
    },
  ]

  return (
    <Flex gap="3" wrap="wrap" align="stretch">
      {fixedKind ? null : (
        <ChartCard
          title={p.byKindTitle}
          unit={p.byKindUnit}
          hint={t.list.chart.clickHint}
          rows={byKind.map((row) => [row.label, f.count(row.value)])}
        >
          <RankBars rows={byKind} format={f.count} />
          <Text size="1" color="gray">
            {p.byKindNote}
          </Text>
        </ChartCard>
      )}
      <ChartCard
        title={p.reachTitle}
        unit={p.reachUnit}
        rows={followed.map((row) => [row.label, f.count(row.value)])}
      >
        <RankBars rows={followed} format={f.count} />
        <Text size="1" color="gray">
          {p.reachNote}
        </Text>
      </ChartCard>
    </Flex>
  )
}
