import { Flex, Text } from '@radix-ui/themes'

import { useI18n } from '#/i18n/context'
import type { PnrrContract } from '#/features/pnrr/api'
import { measureLabel } from '#/features/pnrr/pnrr'

// The ministry's own progress figures for a contract whose measures disagree, one row per
// measure, as given; never worked out from the payments (design Q53).
export function ProgressByMeasure({ contract }: { contract: PnrrContract }) {
  const { t, f } = useI18n()
  const p = t.pnrr
  const ministry = contract.ministry
  const percent = (value: number | null) =>
    value === null ? t.common.notPublished : f.percent(value)

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
