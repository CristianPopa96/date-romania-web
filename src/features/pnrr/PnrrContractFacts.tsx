import { Flex, Progress, Text } from '@radix-ui/themes'

import { useI18n } from '#/i18n/context'
import type { PnrrContract } from '#/features/pnrr/api'
import { measureLabel } from '#/features/pnrr/pnrr'

// The ministry's own progress figures, as given; never worked out from the payments. A
// contract whose measures disagree shows one row per measure (design Q53, proposed).
export function ProgressBars({ contract }: { contract: PnrrContract }) {
  const { t, f } = useI18n()
  const p = t.pnrr
  const ministry = contract.ministry
  const percent = (value: number | null) =>
    value === null ? t.common.notPublished : f.percent(value)

  if (!contract.measures_differ) {
    return (
      <Flex direction="column" gap="3">
        <Bar
          label={p.progressPhysical}
          value={contract.physical_progress}
          note={p.reportedBy(ministry)}
        />
        <Bar
          label={p.progressFinancial}
          value={contract.financial_progress}
          note={p.reportedByDiffers(ministry)}
        />
      </Flex>
    )
  }
  return (
    <Flex direction="column" gap="2">
      <Text size="2" weight="medium">
        {p.progressByMeasure}
      </Text>
      {contract.lines.map((line) => (
        <Flex
          key={`${line.measure}-${line.funding}`}
          justify="between"
          gap="3"
          wrap="wrap"
        >
          <Text size="2">{measureLabel(line.measure, line.measure_name)}</Text>
          <Text size="2" color="gray">
            {p.progressRow(
              percent(line.physical_progress),
              percent(line.financial_progress),
            )}
          </Text>
        </Flex>
      ))}
      <Text size="1" color="gray">
        {p.reportedByDiffers(ministry)}
      </Text>
    </Flex>
  )
}

function Bar({
  label,
  value,
  note,
}: {
  label: string
  value: number | null
  note: string
}) {
  const { t, f } = useI18n()
  return (
    <Flex direction="column" gap="1">
      <Flex justify="between">
        <Text size="2">{label}</Text>
        <Text size="2">
          {value === null ? t.common.notPublished : f.percent(value)}
        </Text>
      </Flex>
      {value === null ? null : (
        <Progress value={Math.round(value * 100)} aria-label={label} />
      )}
      <Text size="1" color="gray">
        {note}
      </Text>
    </Flex>
  )
}
