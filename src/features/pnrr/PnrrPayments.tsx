import { Link as RouterLink } from '@tanstack/react-router'
import { ChevronDownIcon } from '@radix-ui/react-icons'
import {
  Card,
  Code,
  Flex,
  Heading,
  Link,
  Table,
  Text,
  VisuallyHidden,
} from '@radix-ui/themes'

import { Stat } from '#/features/programme'
import { useI18n } from '#/i18n/context'
import type { PnrrContract, PnrrPayments } from '#/features/pnrr/api'
import { measureLabel, paymentsCase } from '#/features/pnrr/pnrr'

// The payments to the contract's beneficiary on each of its measures. They name the
// beneficiary and the measure, never the contract: they are listed as the contract's only
// when it is the beneficiary's one contract on the measure. Otherwise they are shown for
// the beneficiary and the measure, with its contracts there, and never counted for one.
export function PnrrPaymentsSection({ contract }: { contract: PnrrContract }) {
  const { t } = useI18n()
  const beneficiary = contract.beneficiary?.name ?? t.pnrr.beneficiary
  const names = new Map(
    contract.lines.map((line) => [line.measure, line.measure_name]),
  )

  return (
    <Flex direction="column" gap="5">
      {contract.payments.map((payments) => (
        <MeasurePayments
          key={payments.measure}
          contract={contract}
          payments={payments}
          beneficiary={beneficiary}
          measure={measureLabel(payments.measure, names.get(payments.measure))}
        />
      ))}
    </Flex>
  )
}

function MeasurePayments({
  contract,
  payments,
  beneficiary,
  measure,
}: {
  contract: PnrrContract
  payments: PnrrPayments
  beneficiary: string
  measure: string
}) {
  const { t, f } = useI18n()
  const p = t.pnrr
  const which = paymentsCase(payments)

  if (which === 'none') {
    return (
      <Flex direction="column" gap="1">
        <Heading as="h2" size="5">
          {p.paymentsTitle} · {measure}
        </Heading>
        <Text size="2" color="gray">
          {p.noPayment} · {p.paymentsNone(beneficiary, measure)}
        </Text>
      </Flex>
    )
  }
  if (which === 'own') {
    return (
      <Flex direction="column" gap="3">
        <Flex justify="between" align="baseline" gap="3" wrap="wrap">
          <Heading as="h2" size="5">
            {p.paymentsTitle} · {measure}
          </Heading>
          <Text size="1" color="gray">
            {p.paymentsOwn(beneficiary, measure)}
          </Text>
        </Flex>
        <PaymentsTable payments={payments} />
      </Flex>
    )
  }
  const days = f.span(payments.first_day, payments.last_day)
  // Folded by default: the summary says what it holds, and a measure with hundreds of
  // payments does not push the rest of the page away. A details element opens without
  // any script.
  return (
    <Card size="3" asChild>
      <details className="dr-fold">
        <summary>
          <Flex justify="between" align="center" gap="4" wrap="wrap">
            <Stat
              label={`${p.paidOnContract} · ${measure}`}
              value={p.cannotSay}
              detail={[p.cannotSayDetail]}
            />
            <Flex align="center" gap="2">
              <Text size="2" color="gray">
                {p.paymentsFolded(
                  p.paymentsCount(payments.count, f.count(payments.count)),
                  f.leiShort(payments.paid),
                )}
              </Text>
              <ChevronDownIcon className="dr-fold-mark" aria-hidden />
            </Flex>
          </Flex>
        </summary>
        <Flex direction="column" gap="4" mt="4">
          <Flex justify="between" align="baseline" gap="3" wrap="wrap">
            <Heading as="h3" size="4">
              {p.paymentsShared(beneficiary, measure)}
            </Heading>
            <Text size="1" color="gray">
              {p.paymentsSharedDetail(
                payments.contracts,
                f.count(payments.contracts),
                days ? t.period.range(days.from, days.to) : '',
              )}
            </Text>
          </Flex>
          <Stat
            label={p.paymentsCount(payments.count, f.count(payments.count))}
            value={f.leiShort(payments.paid)}
            detail={[]}
          />
          <Table.Root variant="surface" size="1">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell>{p.others}</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell justify="end">
                  {p.value}
                </Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              <SiblingRow
                id={contract.id}
                title={contract.title}
                number={contract.number}
                total={contract.total}
                current
              />
              {payments.others.map((other) => (
                <SiblingRow key={other.id} {...other} />
              ))}
            </Table.Body>
          </Table.Root>
          <PaymentsTable payments={payments} />
        </Flex>
      </details>
    </Card>
  )
}

function SiblingRow({
  id,
  title,
  number,
  total,
  current = false,
}: {
  id: number
  title: string | null
  number: string | null
  total: number | null
  current?: boolean
}) {
  const { t, f } = useI18n()
  const p = t.pnrr
  return (
    <Table.Row>
      <Table.RowHeaderCell>
        {current ? (
          (title ?? p.fallbackTitle)
        ) : (
          <Link asChild>
            <RouterLink
              to="/programe/pnrr/contracte/$id"
              params={{ id: String(id) }}
            >
              {title ?? p.fallbackTitle}
            </RouterLink>
          </Link>
        )}
        <Text as="div" size="1" color="gray">
          {number ? <Code variant="ghost">nr. {number}</Code> : null}
          {current ? ` · ${p.thisContract}` : ''}
        </Text>
      </Table.RowHeaderCell>
      <Table.Cell justify="end">
        {total === null ? '' : f.lei(total)}
      </Table.Cell>
    </Table.Row>
  )
}

function PaymentsTable({ payments }: { payments: PnrrPayments }) {
  const { t, f } = useI18n()
  const p = t.pnrr
  // A fixed height that scrolls inside itself, its header kept in view: a measure can
  // hold hundreds of payments.
  return (
    <Table.Root variant="surface" size="1" className="dr-scroll-table">
      {/* Radix puts props on its wrapper, not the table: a caption names it. */}
      <VisuallyHidden asChild>
        <caption>{p.paymentsTitle}</caption>
      </VisuallyHidden>
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeaderCell>{p.paidOn}</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell justify="end">
            {p.amount}
          </Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>{p.kind}</Table.ColumnHeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {payments.items.map((payment, index) => (
          <Table.Row key={index}>
            <Table.RowHeaderCell>
              {payment.paid_on ? f.day(payment.paid_on) : t.common.notPublished}
            </Table.RowHeaderCell>
            <Table.Cell justify="end">{f.leiExact(payment.amount)}</Table.Cell>
            <Table.Cell>
              {(payment.funding && p.fundings[payment.funding]) ??
                payment.funding}
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  )
}
