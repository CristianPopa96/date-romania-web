import type { CSSProperties } from 'react'
import { Badge, Card, Flex, Heading, Link, Table, Text } from '@radix-ui/themes'

import { DataState } from '#/components/DataState'
import { SourceLine } from '#/components/SourceLine'
import type { Check, CheckFigure } from '#/features/national/api'
import type { Source } from '#/lib/api'
import {
  checkPeriod,
  differenceCell,
  monthOf,
  oursCell,
  periodText,
} from '#/features/national/national'
import { useI18n } from '#/i18n/context'

export const DOMAINS_ANCHOR = 'pe-domenii'

// CheckTable (D24, design rounds 18 and 19): official figures against ours, one pair a
// row, in the order the API gives (comparable, then different measures, then not yet;
// each the largest official figure first). A difference only where both measure the same
// thing over the same period; otherwise the cell says they never compare or do not
// compare yet, and "De ce" always says why. Each figure has one line under it, saying
// what was read, which opens its source panel. No total row.
export function CheckTable({ checks }: { checks: Array<Check> }) {
  const { t } = useI18n()
  const words = t.national.checks
  const columns = words.columns
  // The first column stays while the table scrolls inside its card on a phone.
  const sticky = {
    position: 'sticky',
    left: 0,
    zIndex: 1,
    background: 'var(--color-panel-solid)',
  } as const

  return (
    <Card size="3">
      <Flex direction="column" gap="4">
        <Flex direction="column" gap="1">
          <Heading as="h2" size="5">
            {words.title}
          </Heading>
          <Text size="2" color="gray" style={{ maxWidth: '70ch' }}>
            {words.lead}
          </Text>
        </Flex>
        {/* Table.Root scrolls sideways inside the card on its own; each column keeps a
            width to read in, so a phone scrolls the table, never the page. */}
        <Table.Root size="1">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell style={{ ...sticky, minWidth: 140 }}>
                {columns.check}
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell style={{ minWidth: 190 }}>
                {columns.official}
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell style={{ minWidth: 190 }}>
                {columns.ours}
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell style={{ minWidth: 100 }}>
                {columns.period}
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell style={{ minWidth: 150 }}>
                {columns.difference}
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell style={{ minWidth: 220 }}>
                {columns.why}
              </Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {checks.map((check) => (
              <CheckRow key={check.key} check={check} sticky={sticky} />
            ))}
          </Table.Body>
        </Table.Root>
      </Flex>
    </Card>
  )
}

function CheckRow({ check, sticky }: { check: Check; sticky: CSSProperties }) {
  const { t, f } = useI18n()
  const words = t.national.checks
  const [name, what] = words.names[check.key] ?? [check.key, '']
  const cell = differenceCell(check)
  const month = check.official.period_end
    ? monthOf(f, check.official.period_end)
    : ''
  const oursPeriod = periodText(
    f,
    check.ours.period_start,
    check.ours.period_end,
    t.national.span,
  )
  const oursDetail =
    check.key === 'local_budgets'
      ? f.count(check.ours.count ?? 0)
      : check.key === 'anghel_saligny'
        ? (oursPeriod ?? '')
        : ''

  return (
    <Table.Row style={{ verticalAlign: 'top' }}>
      <Table.RowHeaderCell style={sticky}>
        <Text as="div" weight="bold">
          {name}
        </Text>
        <Text as="div" size="1" color="gray">
          {what}
        </Text>
      </Table.RowHeaderCell>
      <Table.Cell>
        <FigureCell figure={check.official} muted={false} />
        <ReadLine
          text={words.officialSource[check.key]?.(month)}
          source={check.official.source}
        />
      </Table.Cell>
      <Table.Cell>
        <FigureCell figure={check.ours} muted={check.state !== 'comparable'} />
        <ReadLine
          text={words.oursSource[check.key]?.(oursDetail)}
          source={check.ours.collected ? check.ours.source : null}
        />
      </Table.Cell>
      <Table.Cell>
        <Text style={{ whiteSpace: 'nowrap' }}>
          {checkPeriod(f, check, t.national.span)}
        </Text>
      </Table.Cell>
      <Table.Cell>
        {cell.kind === 'differentMeasures' || cell.kind === 'notYet' ? (
          <Badge color="gray" variant="outline">
            {cell.kind === 'differentMeasures'
              ? words.differentMeasures
              : words.notYet}
          </Badge>
        ) : (
          <Text
            weight="bold"
            style={{ whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}
          >
            {cell.kind === 'paid'
              ? words.paid(f.percent(cell.share))
              : cell.share == null
                ? f.leiBillionsSigned(cell.amount)
                : words.difference(
                    f.leiBillionsSigned(cell.amount),
                    f.percentSigned(cell.share),
                  )}
          </Text>
        )}
        {cell.kind === 'paid' && cell.over ? (
          <Text as="div" size="1" color="gray" style={{ maxWidth: '26ch' }}>
            {words.overCredits}
          </Text>
        ) : null}
      </Table.Cell>
      <Table.Cell>
        <Text as="div" size="1" color="gray" style={{ maxWidth: '34ch' }}>
          {words.reasons[check.reason] ?? check.reason}{' '}
          {check.key === 'local_domains' ? (
            <Link href={`#${DOMAINS_ANCHOR}`} size="1">
              {words.byDomain}
            </Link>
          ) : null}
        </Text>
      </Table.Cell>
    </Table.Row>
  )
}

// The one line under a figure: what was read, opening its source panel where there is
// a source.
function ReadLine({
  text,
  source,
}: {
  text: string | undefined
  source: Source | null | undefined
}) {
  if (!text) return null
  if (source) return <SourceLine source={source} label={text} />
  return (
    <Text as="div" size="1" color="gray">
      {text}
    </Text>
  )
}

function FigureCell({
  figure,
  muted,
}: {
  figure: CheckFigure
  muted: boolean
}) {
  const { t, f } = useI18n()
  const cell = oursCell(figure)
  if (cell.kind === 'notCollected') return <DataState kind="notCollected" />
  const text =
    cell.kind === 'count'
      ? t.national.checks.contracts(cell.count, f.count(cell.count))
      : f.leiBillions(cell.amount)
  return (
    <Text
      as="div"
      weight={muted ? 'medium' : 'bold'}
      color={muted ? 'gray' : undefined}
      style={{ whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}
    >
      {text}
    </Text>
  )
}
