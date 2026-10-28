import {
  Badge,
  Card,
  Code,
  DataList,
  Flex,
  Table,
  Text,
  VisuallyHidden,
} from '@radix-ui/themes'

import { ConfidenceBadge } from '#/components/ConfidenceBadge'
import { DataState } from '#/components/DataState'
import { EntityLink, roleOfKind } from '#/components/EntityLink'
import { useI18n } from '#/i18n/context'
import type {
  EuBeneficiary,
  EuPayment,
  EuProject,
} from '#/features/eu-projects/api'
import { beneficiaryTie, periodLabel } from '#/features/eu-projects/eu'

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

// The beneficiary as the list names it, the institution or company it is tied to, and how.
export function Beneficiary({ beneficiary }: { beneficiary: EuBeneficiary }) {
  const { t } = useI18n()
  const tie = beneficiaryTie(beneficiary)
  const { entity } = beneficiary
  return (
    <Flex direction="column" gap="1" align="start">
      {entity ? (
        <Text>
          <EntityLink role={roleOfKind(entity.kind)} cui={entity.cui}>
            {entity.name}
          </EntityLink>{' '}
          <Code variant="ghost" color="gray">
            CUI {entity.cui}
          </Code>
        </Text>
      ) : (
        <Text>{beneficiary.name ?? t.common.notPublished}</Text>
      )}
      <ConfidenceBadge
        level={tie.level}
        label={t.eu.tie[tie.label]}
        help={t.eu.tieHelp[tie.label]}
      />
    </Flex>
  )
}

export function Facts({ project }: { project: EuProject }) {
  const { t, f } = useI18n()
  const e = t.eu
  const place = [project.locality, project.county].filter(Boolean).join(', ')
  const day = (value: string | null) =>
    value ? f.day(value) : <DataState kind="notPublished" />

  return (
    <Card size="3">
      <DataList.Root
        size="2"
        orientation={{ initial: 'vertical', sm: 'horizontal' }}
      >
        <DataList.Item>
          <DataList.Label>{e.smisCode}</DataList.Label>
          <DataList.Value>
            <Code variant="ghost">{project.smis}</Code>
          </DataList.Value>
        </DataList.Item>
        <DataList.Item>
          <DataList.Label>{e.beneficiary}</DataList.Label>
          <DataList.Value>
            <Beneficiary beneficiary={project.beneficiary} />
          </DataList.Value>
        </DataList.Item>
        <DataList.Item>
          <DataList.Label>{e.programme}</DataList.Label>
          <DataList.Value>
            {project.programme_name} {periodLabel(project.period)}
          </DataList.Value>
        </DataList.Item>
        <DataList.Item>
          <DataList.Label>{e.state}</DataList.Label>
          <DataList.Value>
            <EuStatusBadge
              status={project.status}
              written={project.status_written}
            />
          </DataList.Value>
        </DataList.Item>
        <DataList.Item>
          <DataList.Label>{e.starts}</DataList.Label>
          <DataList.Value>{day(project.starts_on)}</DataList.Value>
        </DataList.Item>
        <DataList.Item>
          <DataList.Label>{e.ends}</DataList.Label>
          <DataList.Value>{day(project.ends_on)}</DataList.Value>
        </DataList.Item>
        <DataList.Item>
          <DataList.Label>{e.place}</DataList.Label>
          <DataList.Value>
            {place || <DataState kind="notPublished" />}
          </DataList.Value>
        </DataList.Item>
        <DataList.Item>
          <DataList.Label>{e.rate}</DataList.Label>
          <DataList.Value>
            {project.cofinancing_rate === null ? (
              <DataState kind="notPublished" />
            ) : (
              f.percent(project.cofinancing_rate)
            )}
          </DataList.Value>
        </DataList.Item>
      </DataList.Root>
    </Card>
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
