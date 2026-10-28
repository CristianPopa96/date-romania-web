import { useSuspenseQuery } from '@tanstack/react-query'
import { Link as RouterLink } from '@tanstack/react-router'
import { Code, Flex, Heading, Link, Table, Text } from '@radix-ui/themes'

import { ConfidenceBadge } from '#/components/ConfidenceBadge'
import { DataState } from '#/components/DataState'
import { EuStatusBadge } from '#/components/EuProjectFacts'
import { Pager } from '#/components/Pager'
import { SourceLine } from '#/components/SourceLine'
import { useI18n } from '#/i18n/context'
import { PAGE_SIZE } from '#/lib/api'
import type { EuBeneficiaryFunds } from '#/lib/api-eu'
import { pageCount } from '#/lib/contracts'
import { beneficiaryTie, periodLabel } from '#/lib/eu'
import { euProjectsQuery } from '#/lib/queries'

// The cohesion projects of the entity a page is about (flow 7, "arrive from a
// beneficiary's page"), by programme and one by one; its PNRR contracts are in
// EntityPnrr. The two kinds are never added together, nor two programmes' figures: each
// has the day of its own list.

export function EntityCohesion({
  cui,
  funds,
  page,
  onPage,
}: {
  cui: number
  funds: EuBeneficiaryFunds
  page: number
  onPage: (page: number) => void
}) {
  const { t, f } = useI18n()
  const e = t.eu
  const { data: projects } = useSuspenseQuery(
    euProjectsQuery({ beneficiary: cui, page }),
  )
  const money = (value: number | null) =>
    value === null ? <DataState kind="notPublished" /> : f.lei(value)

  return (
    <Flex direction="column" gap="3">
      <Heading as="h2" size="5">
        {e.held.cohesionTitle}
      </Heading>
      <Text size="2" color="gray" style={{ maxWidth: '70ch' }}>
        {e.held.cohesionLead}
      </Text>
      <Table.Root variant="surface" size="1">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>{e.programme}</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell justify="end">
              {e.projects}
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell justify="end">
              {e.value}
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell justify="end">
              {e.paid}
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>{e.cutOff}</Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {funds.cohesion.map((programme) => (
            <Table.Row key={`${programme.code}-${programme.period}`}>
              <Table.RowHeaderCell>
                {programme.name}
                <Text as="div" size="1" color="gray">
                  {programme.code} {periodLabel(programme.period)}
                </Text>
              </Table.RowHeaderCell>
              <Table.Cell justify="end">
                {f.count(programme.projects)}
              </Table.Cell>
              <Table.Cell justify="end">{money(programme.total)}</Table.Cell>
              <Table.Cell justify="end">{money(programme.paid)}</Table.Cell>
              <Table.Cell>
                {programme.cut_off ? (
                  f.day(programme.cut_off)
                ) : (
                  <DataState kind="notPublished" />
                )}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
      {funds.cohesion_source ? (
        <SourceLine source={funds.cohesion_source} />
      ) : null}

      <Text size="2" color="gray">
        {e.found(projects.total, f.count(projects.total))}
      </Text>
      <Table.Root variant="surface" size="1">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>{e.project}</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell justify="end">
              {e.value}
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell justify="end">
              {e.paid}
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>{e.state}</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>{e.held.tie}</Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {projects.items.map((row) => {
            const tie = beneficiaryTie(row.beneficiary)
            return (
              <Table.Row key={row.smis}>
                <Table.RowHeaderCell>
                  <Link asChild>
                    <RouterLink
                      to="/programe/fonduri-europene/proiecte/$smis"
                      params={{ smis: String(row.smis) }}
                    >
                      {row.title ?? e.fallbackTitle}
                    </RouterLink>
                  </Link>
                  <Text as="div" size="1" color="gray">
                    <Code variant="ghost">{e.smis(String(row.smis))}</Code>
                    {` · ${row.programme}`}
                  </Text>
                </Table.RowHeaderCell>
                <Table.Cell justify="end" style={{ whiteSpace: 'nowrap' }}>
                  {money(row.total)}
                </Table.Cell>
                <Table.Cell justify="end" style={{ whiteSpace: 'nowrap' }}>
                  {money(row.paid)}
                </Table.Cell>
                <Table.Cell>
                  <EuStatusBadge
                    status={row.status}
                    written={row.status_written}
                  />
                </Table.Cell>
                <Table.Cell>
                  <ConfidenceBadge
                    level={tie.level}
                    label={e.tie[tie.label]}
                    help={e.tieHelp[tie.label]}
                  />
                </Table.Cell>
              </Table.Row>
            )
          })}
        </Table.Body>
      </Table.Root>
      <Pager
        page={page}
        pages={pageCount(projects.total, PAGE_SIZE)}
        onPage={onPage}
      />
    </Flex>
  )
}
