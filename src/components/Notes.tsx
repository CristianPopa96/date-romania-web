import { InfoCircledIcon } from '@radix-ui/react-icons'
import { Callout, Text } from '@radix-ui/themes'

import type { Summary } from '#/lib/api'
import { count, lei, period } from '#/lib/format'

// We hold only the days collected so far, so every total says which days it covers.
export function PeriodNote({ summary }: { summary: Summary }) {
  const days = period(summary.first_day, summary.last_day)
  if (!days) return null
  return (
    <Text size="2" color="gray">
      Achiziții directe finalizate în perioada {days}. Sumele sunt fără TVA.
    </Text>
  )
}

// Stated as what SEAP publishes, never as an error or a breach.
export function AboveLimitNote({
  summary,
  limit = 900400,
}: {
  summary: Summary
  limit?: number
}) {
  if (summary.above_limit === 0) return null
  const one = summary.above_limit === 1
  return (
    <Callout.Root color="amber" variant="surface" size="1">
      <Callout.Icon>
        <InfoCircledIcon />
      </Callout.Icon>
      <Callout.Text>
        {one
          ? 'O achiziție acceptată este publicată'
          : `${count(summary.above_limit)} achiziții acceptate sunt publicate`}{' '}
        în SEAP cu o valoare peste {lei(limit)}, plafonul legal cel mai mare
        pentru o achiziție directă.{' '}
        {one ? 'Nu este inclusă' : 'Nu sunt incluse'} în total:{' '}
        {lei(summary.above_limit_value)}. Tipar observat, nu o acuzație.
      </Callout.Text>
    </Callout.Root>
  )
}

export function Unavailable() {
  return (
    <Callout.Root color="gray" variant="surface">
      <Callout.Icon>
        <InfoCircledIcon />
      </Callout.Icon>
      <Callout.Text>
        Datele nu sunt disponibile acum. Încearcă din nou peste câteva minute.
      </Callout.Text>
    </Callout.Root>
  )
}
