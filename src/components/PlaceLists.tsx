import { Link as RouterLink } from '@tanstack/react-router'
import { Flex, Heading, Link, Table, Text } from '@radix-ui/themes'

import { DataState } from '#/components/DataState'
import { EntityLink, roleOfKind } from '#/components/EntityLink'
import { MatchBadge } from '#/components/MatchBadge'
import { useI18n } from '#/i18n/context'
import { rich } from '#/i18n/rich'
import type {
  CountyUatRow,
  LocalInstitution,
  LocalProject,
} from '#/lib/api-places'
import { placeLink } from '#/lib/places'

// The tables of a locality or a county page (ScreenLocality): the town hall's Anghel
// Saligny projects, the institutions here, a county's UATs.

export function ProjectsTable({ projects }: { projects: Array<LocalProject> }) {
  const { t, f } = useI18n()
  const p = t.places
  return (
    <Flex direction="column" gap="2">
      <Heading size="5">{p.projects}</Heading>
      <Text size="2" color="gray">
        {rich(p.projectsLead, {
          notCollected: <DataState key="state" kind="notCollected" />,
        })}
      </Text>
      {projects.length === 0 ? (
        <Text size="2" color="gray">
          {p.projectsNone}
        </Text>
      ) : (
        <Table.Root variant="surface" size="1">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>{p.project}</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>{p.builder}</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>{p.progress}</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell justify="end">
                {p.paid}
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>{p.contract}</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {projects.map((project) => (
              <Table.Row key={project.id}>
                <Table.Cell>
                  <Link asChild>
                    <RouterLink
                      to="/programe/anghel-saligny/proiecte/$id"
                      params={{ id: String(project.id) }}
                    >
                      {project.investment ?? String(project.id)}
                    </RouterLink>
                  </Link>
                </Table.Cell>
                <Table.Cell>
                  {project.builder ? (
                    <EntityLink role="suppliers" cui={project.builder.cui}>
                      {project.builder.name}
                    </EntityLink>
                  ) : (
                    (project.builder_text ?? <DataState kind="notPublished" />)
                  )}
                </Table.Cell>
                <Table.Cell>
                  {project.progress ?? <DataState kind="notPublished" />}
                </Table.Cell>
                <Table.Cell justify="end" style={{ whiteSpace: 'nowrap' }}>
                  {f.lei(project.paid)}
                </Table.Cell>
                <Table.Cell>
                  <MatchBadge
                    match={project.match}
                    label={t.programme.matchOfProject[project.match]}
                  />
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      )}
    </Flex>
  )
}

export function InstitutionsTable({
  institutions,
  range,
  capital,
}: {
  institutions: Array<LocalInstitution>
  range: string | null
  // The town hall's capital spending and its year, when its budget is held.
  capital: { amount: number; year: number } | null
}) {
  const { t, f } = useI18n()
  const p = t.places
  return (
    <Flex direction="column" gap="2">
      <Heading size="5">{p.institutions}</Heading>
      {institutions.length === 0 ? (
        <Text size="2" color="gray">
          {p.institutionsNone}
        </Text>
      ) : (
        <Table.Root variant="surface" size="1">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>{p.institution}</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell justify="end">
                {range ? p.contractsIn(range) : p.contractsHeader}
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell justify="end">
                {capital ? p.capitalIn(String(capital.year)) : p.capitalHeader}
              </Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {institutions.map((row) => (
              <Table.Row key={row.entity.cui}>
                <Table.Cell>
                  <EntityLink
                    role={roleOfKind(row.entity.kind)}
                    cui={row.entity.cui}
                  >
                    {row.entity.name}
                  </EntityLink>
                  {row.town_hall ? (
                    <Text size="1" color="gray">
                      {' '}
                      · {p.townHall}
                    </Text>
                  ) : null}
                </Table.Cell>
                <Table.Cell justify="end" style={{ whiteSpace: 'nowrap' }}>
                  {row.contracts > 0 ? f.lei(row.contract_value) : p.noneSigned}
                </Table.Cell>
                <Table.Cell justify="end">
                  {row.town_hall && capital ? (
                    f.lei(capital.amount)
                  ) : (
                    <DataState kind="notCollected" />
                  )}
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      )}
    </Flex>
  )
}

export function UatsTable({
  uats,
  range,
  year,
}: {
  uats: Array<CountyUatRow>
  range: string | null
  year: number | null
}) {
  const { t, f } = useI18n()
  const p = t.places
  return (
    <Flex direction="column" gap="2">
      <Heading size="5">{p.uatTable}</Heading>
      <Table.Root variant="surface" size="1">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>{p.uats}</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell justify="end">
              {p.people}
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell justify="end">
              {year ? p.capitalIn(String(year)) : p.capitalHeader}
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell justify="end">
              {range ? p.contractsIn(range) : p.contractsHeader}
            </Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {uats.map((row) => (
            <Table.Row key={row.place.siruta}>
              <Table.Cell>
                <Link asChild>
                  <RouterLink {...placeLink(row.place)}>
                    {row.place.name}
                  </RouterLink>
                </Link>
              </Table.Cell>
              <Table.Cell justify="end">
                {row.population === null ? (
                  <DataState kind="notCollected" />
                ) : (
                  f.count(row.population)
                )}
              </Table.Cell>
              <Table.Cell justify="end" style={{ whiteSpace: 'nowrap' }}>
                {row.capital === null ? (
                  <DataState kind="notCollected" />
                ) : (
                  f.lei(row.capital)
                )}
              </Table.Cell>
              <Table.Cell justify="end" style={{ whiteSpace: 'nowrap' }}>
                {row.contracts > 0 ? f.lei(row.contract_value) : p.noneSigned}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Flex>
  )
}
