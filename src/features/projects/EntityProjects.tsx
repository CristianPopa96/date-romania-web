import { useSuspenseQuery } from '@tanstack/react-query'
import { Flex, Heading, Table, Text } from '@radix-ui/themes'

import { DataState } from '#/components/DataState'
import { ProjectList } from '#/features/projects/ProjectList'
import type { ProgrammeFigures } from '#/features/projects/api'
import type { ProjectListSearch } from '#/features/projects/list'
import { projectProgrammesQuery } from '#/features/projects/queries'
import { periodLabel } from '#/features/eu-projects'
import { useI18n } from '#/i18n/context'
import type { Role } from '#/lib/api'

// The "Proiecte" tab of an entity page (ScreenInstitution, ScreenSupplier; design D22).
// An institution's: the projects of every programme it is the beneficiary of, by programme
// above the list, each at its own day and never added together. A company's: the projects
// it was paid through, each saying how; no table, since what a programme paid its
// beneficiary is not what the company was paid.
export function EntityProjects<TSearch extends ProjectListSearch>({
  role,
  cui,
  search,
  onSearch,
}: {
  role: Role
  cui: number
  search: TSearch
  onSearch: (search: TSearch) => void
}) {
  const { t } = useI18n()
  const p = t.projects
  return (
    <Flex direction="column" gap="5">
      {role === 'institutions' ? <ByProgramme cui={cui} /> : null}
      <ProjectList
        title={role === 'suppliers' ? p.tabCompanyTitle : p.tabTitle}
        titleAs="h3"
        party={role === 'suppliers' ? { company: cui } : { beneficiary: cui }}
        search={search}
        onSearch={onSearch}
      />
    </Flex>
  )
}

// One row per programme: its projects, their value, what was paid as the programme
// publishes it, and its day. No total row.
function ByProgramme({ cui }: { cui: number }) {
  const { t, f } = useI18n()
  const b = t.projects.byProgramme
  const { data: programmes } = useSuspenseQuery(projectProgrammesQuery(cui))
  if (programmes === 'failed' || !programmes.length) return null
  const money = (value: number | null) =>
    value === null ? <DataState kind="notPublished" /> : f.lei(value)
  return (
    <Flex direction="column" gap="2">
      <Heading as="h3" size="3">
        {b.title}
      </Heading>
      <Table.Root variant="surface" size="1">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>{b.programme}</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell justify="end">
              {b.projects}
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell justify="end">
              {b.value}
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell justify="end">
              {b.paid}
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>{b.day}</Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {programmes.map((each: ProgrammeFigures) => (
            <Table.Row key={each.programme}>
              <Table.RowHeaderCell>
                {each.period
                  ? `${each.programme} ${periodLabel(each.period)}`
                  : each.name}
              </Table.RowHeaderCell>
              <Table.Cell justify="end">{f.count(each.projects)}</Table.Cell>
              <Table.Cell justify="end" style={{ whiteSpace: 'nowrap' }}>
                {money(each.value)}
              </Table.Cell>
              <Table.Cell justify="end" style={{ whiteSpace: 'nowrap' }}>
                {money(each.paid)}
                <Text as="div" size="1" color="gray">
                  {b.paidAs[each.paid_as]}
                </Text>
              </Table.Cell>
              <Table.Cell>
                {each.day ? f.day(each.day) : <DataState kind="notPublished" />}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
      <Text size="1" color="gray">
        {b.note}
      </Text>
    </Flex>
  )
}
