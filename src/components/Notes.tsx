import { InfoCircledIcon } from '@radix-ui/react-icons'
import { Callout, Text } from '@radix-ui/themes'

import { useI18n } from '#/i18n/context'
import { DIRECT_PURCHASE_LIMIT } from '#/lib/api'
import type { Summary } from '#/lib/api'

// We hold only the days collected so far, so every total says which days it covers.
export function PeriodNote({ summary }: { summary: Summary }) {
  const { t, f } = useI18n()
  const days = f.period(summary.first_day, summary.last_day)
  if (!days) return null
  return (
    <Text size="2" color="gray">
      {t.notes.period(days)}
    </Text>
  )
}

// Stated as what SEAP publishes, never as an error or a breach.
export function AboveLimitNote({ summary }: { summary: Summary }) {
  const { t, f } = useI18n()
  if (summary.above_limit === 0) return null
  return (
    <Callout.Root color="amber" variant="surface" size="1">
      <Callout.Icon>
        <InfoCircledIcon />
      </Callout.Icon>
      <Callout.Text>
        {t.notes.aboveLimit(
          summary.above_limit,
          f.count(summary.above_limit),
          f.lei(DIRECT_PURCHASE_LIMIT),
          f.lei(summary.above_limit_value),
        )}
      </Callout.Text>
    </Callout.Root>
  )
}

export function Unavailable() {
  const { t } = useI18n()
  return (
    <Callout.Root color="gray" variant="surface">
      <Callout.Icon>
        <InfoCircledIcon />
      </Callout.Icon>
      <Callout.Text>{t.common.unavailable}</Callout.Text>
    </Callout.Root>
  )
}
