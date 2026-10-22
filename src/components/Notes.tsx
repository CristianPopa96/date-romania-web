import { InfoCircledIcon } from '@radix-ui/react-icons'
import { Callout, Text } from '@radix-ui/themes'

import { useI18n } from '#/i18n/context'
import {
  DIRECT_PURCHASE_LIMIT,
  DIRECT_PURCHASE_LIMIT_GOODS_SERVICES,
} from '#/lib/api'
import type { Summary } from '#/lib/api'
import type { Period } from '#/lib/api-contracts'

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
          f.lei(DIRECT_PURCHASE_LIMIT_GOODS_SERVICES),
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

// Said once on every page that adds contracts up: the list behind the figures is not
// complete, and why (the callout half of PeriodNote in the design system).
export function IncompleteContracts({ period }: { period: Period | null }) {
  const { t, f } = useI18n()
  const days = period && f.span(period.first_day, period.last_day)
  if (!days) return null
  return (
    <Callout.Root color="gray" variant="surface" size="1">
      <Callout.Icon>
        <InfoCircledIcon />
      </Callout.Icon>
      <Callout.Text>
        <Text weight="bold">{t.period.incompleteTitle}</Text>{' '}
        {t.period.incomplete(days.from, days.to)}
      </Callout.Text>
    </Callout.Root>
  )
}
