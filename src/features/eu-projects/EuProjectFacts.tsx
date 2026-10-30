import { Badge, Table, Text, VisuallyHidden } from '@radix-ui/themes'

import { DataState } from '#/components/DataState'
import { useI18n } from '#/i18n/context'
import type { EuPayment, EuProject } from '#/features/eu-projects/api'

// A project's status: ours when the list's words say one of the three, else the list's own
// words in gray ('etapizat', 'nefinalizat'), never guessed into one of ours.
export function EuStatusBadge({
  status,
  written,
}: {
  status: EuProject['status']
  written: string | null
}) {
  const { t } = useI18n()
  if (status) {
    const color =
      status === 'finished'
        ? 'green'
        : status === 'in_progress'
          ? 'amber'
          : 'gray'
    return <Badge color={color}>{t.eu.status[status]}</Badge>
  }
  return written ? (
    <Badge color="gray" variant="outline">
      {written}
    </Badge>
  ) : (
    <DataState kind="notPublished" />
  )
}

// The Health programme's payments, one by one, newest first.
export function PaymentsTable({
  payments,
}: {
  payments: ReadonlyArray<EuPayment>
}) {
  const { t, f } = useI18n()
  const e = t.eu
  if (payments.length === 0) {
    return (
      <Text size="2" color="gray">
        {e.paymentsNone}
      </Text>
    )
  }
  return (
    <Table.Root variant="surface" size="1">
      {/* Radix puts props on its wrapper, not the table: a caption names it. */}
      <VisuallyHidden asChild>
        <caption>{e.paymentsTitle}</caption>
      </VisuallyHidden>
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeaderCell>{e.paidOn}</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell justify="end">
            {e.amount}
          </Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>{e.kind}</Table.ColumnHeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {payments.map((payment, index) => (
          <Table.Row key={index}>
            <Table.Cell>
              {payment.paid_on ? (
                f.day(payment.paid_on)
              ) : (
                <DataState kind="notPublished" />
              )}
            </Table.Cell>
            <Table.Cell justify="end">{f.lei(payment.amount)}</Table.Cell>
            <Table.Cell>
              <Text color="gray">
                {[payment.kind, payment.funding].filter(Boolean).join(' · ')}
              </Text>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  )
}
