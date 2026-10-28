import { Flex, Heading, Table, Text } from '@radix-ui/themes'

import { DataState } from '#/components/DataState'
import { SourceLine } from '#/components/SourceLine'
import { EuProjectList } from '#/features/eu-projects/EuProjectList'
import type { EuBeneficiaryFunds } from '#/features/eu-projects/api'
import { periodLabel } from '#/features/eu-projects/eu'
import type { EuProjectListSearch } from '#/features/eu-projects/list'
import { useI18n } from '#/i18n/context'

// The cohesion projects of the entity a page is about (flow 7, "arrive from a
// beneficiary's page"), by programme and one by one; its PNRR contracts are in
// EntityPnrr. The two kinds are never added together, nor two programmes' figures: each
// has the day of its own list.

export function EntityCohesion<TSearch extends EuProjectListSearch>({
  cui,
  funds,
  search,
  onSearch,
}: {
  cui: number
  funds: EuBeneficiaryFunds
  search: TSearch & { pagina?: number }
  onSearch: (search: TSearch) => void
}) {
  const { t, f } = useI18n()
  const e = t.eu
  const byName = funds.cohesion.reduce((n, row) => n + row.by_name, 0)
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
      {byName > 0 ? (
        <Text size="2" style={{ maxWidth: '70ch' }}>
          {e.held.byNameNote(byName, f.count(byName))}
        </Text>
      ) : null}
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
                {programme.by_name > 0 ? (
                  <Text as="div" size="1" color="gray">
                    {e.held.byName(
                      programme.by_name,
                      f.count(programme.by_name),
                    )}
                  </Text>
                ) : null}
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

      <EuProjectList
        cui={cui}
        programmes={funds.cohesion}
        search={search}
        onSearch={onSearch}
      />
    </Flex>
  )
}
