import { Flex } from '@radix-ui/themes'

import { ChartCard } from '#/components/list/ChartCard'
import type { Patch } from '#/components/list/filter-types'
import { RankBars } from '#/components/list/RankBars'
import { TimeBars } from '#/components/list/TimeBars'
import type { ContractOverview } from '#/features/contracts/api-list'
import type { ContractListSearch } from '#/features/contracts/list'
import { useI18n } from '#/i18n/context'
import type { Role } from '#/lib/api'
import { fillSteps, isOpen, monthOf } from '#/lib/list'

// The two charts of a list of contracts: value signed over time, and the largest
// counterparts. Both count the contracts of the list under its filters; a bar clicked
// becomes a filter. On an institution's page the winners are ranked by what they won
// alone; the contracts won by associations are one bar of their own, never given to a
// member.
export function ContractCharts({
  role,
  search,
  overview,
  onApply,
}: {
  role: Role
  search: ContractListSearch
  overview: ContractOverview
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
  // The newest days held still miss the contracts SEAP has not published yet.
  const lastHeld = overview.period.last_day ?? null
  const open = points.some((point) => isOpen(point.start, step, lastHeld))
  const name = (start: string) =>
    step === 'month' ? f.month(start) : f.day(start)

  const param = role === 'institutions' ? 'furnizor' : 'institutie'
  const chosenParty = search[param]
  const associations = overview.associations
  const rows = [
    ...overview.parties.map((each) => ({
      key: String(each.cui),
      label: each.name,
      value: each.value,
      detail: t.contractList.contracts(each.contracts, f.count(each.contracts)),
      on: chosenParty === each.cui,
      pick: () =>
        onApply({ [param]: chosenParty === each.cui ? undefined : each.cui }),
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
    ...(associations && associations.contracts > 0
      ? [
          {
            key: 'associations',
            label: t.contractList.associations(
              associations.contracts,
              f.count(associations.contracts),
            ),
            value: associations.value,
          },
        ]
      : []),
  ]

  return (
    <Flex gap="3" wrap="wrap" align="stretch">
      <ChartCard
        title={t.contractList.timeTitle[step]}
        unit={t.contractList.timeUnit}
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
          lastHeld={lastHeld}
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
          title={t.contractList.partiesTitle[overview.party]}
          unit={t.contractList.partiesUnit[overview.party]}
          hint={t.list.chart.clickHint}
          rows={rows.map((row) => [row.label, f.lei(row.value)])}
        >
          <RankBars rows={rows} format={f.leiShort} />
        </ChartCard>
      ) : null}
    </Flex>
  )
}
