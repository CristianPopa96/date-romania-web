import { useSuspenseQuery } from '@tanstack/react-query'
import { Link as RouterLink } from '@tanstack/react-router'
import { InfoCircledIcon } from '@radix-ui/react-icons'
import {
  Callout,
  Card,
  Code,
  Container,
  Flex,
  Heading,
  Link,
  Table,
  Text,
} from '@radix-ui/themes'

import { EntityLink } from '#/components/EntityLink'
import { MatchBadge } from '#/components/MatchBadge'
import { ProjectChain } from '#/components/ProjectChain'
import { ProjectContracts } from '#/components/ProjectContracts'
import { SourceLine } from '#/components/SourceLine'
import { useI18n } from '#/i18n/context'
import type { Project } from '#/lib/api-programme'
import { progressShare } from '#/lib/programme'
import { programmeQuery, projectQuery } from '#/lib/queries'

// One project of the programme: what it is, the chain from the ministry to the SEAP
// contract for each of its builders, the contracts found and every payment.
export function ProjectView({ id }: { id: number }) {
  const { t, f } = useI18n()
  const p = t.programme
  const { data: project } = useSuspenseQuery(projectQuery(id))
  const { data: programme } = useSuspenseQuery(programmeQuery)
  // The route loader answers "not found" before this renders.
  if (!project) return null
  const searched = programme
    ? f.span(programme.contracts_first_day, programme.contracts_last_day)
    : null
  const facts = [
    project.ministry_contract_no && project.ministry_contract_date
      ? p.ministryContract(
          project.ministry_contract_no,
          f.day(project.ministry_contract_date),
        )
      : null,
    project.total_value !== null
      ? p.totalValue(f.leiShort(project.total_value))
      : null,
    project.state_budget_value !== null
      ? p.stateBudget(f.leiShort(project.state_budget_value))
      : null,
    project.poim ? p.alsoEu : null,
    project.estimated_end ? p.estimatedEnd(f.day(project.estimated_end)) : null,
  ].filter((fact) => fact !== null)

  return (
    <Container size="4" px="5" py="7">
      <Flex direction="column" gap="5">
        <Flex direction="column" gap="3">
          <Text size="2" color="gray">
            {p.crumb} /{' '}
            <Link asChild>
              <RouterLink to="/programe/anghel-saligny">{p.name}</RouterLink>
            </Link>{' '}
            / {p.projectTitle(String(project.id))}
          </Text>
          <Text size="1" color="gray" weight="medium">
            {project.category}
          </Text>
          <Heading size="7">{project.investment ?? p.fallbackTitle}</Heading>
        </Flex>

        <Card size="3">
          <Flex direction="column" gap="4">
            <Flex justify="between" align="start" gap="4" wrap="wrap">
              <Flex direction="column" gap="1">
                <Heading as="h2" size="5">
                  {p.chainTitle}
                </Heading>
                <Text size="2" color="gray">
                  {facts.join(' · ')}
                </Text>
              </Flex>
              <MatchBadge
                match={project.match}
                label={p.matchOfProject[project.match]}
                size="2"
              />
            </Flex>
            {project.builders.map((builder) => (
              <Flex
                key={`${builder.cui} ${builder.name}`}
                direction="column"
                gap="4"
              >
                <ProjectChain
                  project={project}
                  builder={builder}
                  searched={searched}
                />
                <ProjectContracts builder={builder} />
              </Flex>
            ))}
            <Why project={project} firstNamed={firstNamed(programme?.files)} />
            <Designers project={project} />
            <SourceLine source={project.source} of="payments" />
            {project.builders.some((each) => each.contracts.length > 0) ? (
              <SourceLine source={project.contracts_source} of="contracts" />
            ) : null}
          </Flex>
        </Card>

        <Payments project={project} />
      </Flex>
    </Container>
  )
}

// The day of the first payment file that names builders by tax ID.
function firstNamed(
  files: Array<{ published_on: string | null; with_tax_id: number }> = [],
) {
  return files.find((file) => file.with_tax_id > 0)?.published_on ?? null
}

// Said once, where the chain stops before a contract: what the reader is looking at.
function Why({
  project,
  firstNamed: day,
}: {
  project: Project
  firstNamed: string | null
}) {
  const { t, f } = useI18n()
  const p = t.programme
  if (project.match !== 'none' && project.match !== 'unnamed') return null
  return (
    <Callout.Root color="gray" variant="surface" size="1">
      <Callout.Icon>
        <InfoCircledIcon />
      </Callout.Icon>
      {project.match === 'none' ? (
        <Callout.Text>
          <Text weight="bold">{p.whyNoneTitle}</Text> {p.whyNoneLead}{' '}
          {p.whyNone.join(' ')}
        </Callout.Text>
      ) : (
        <Callout.Text>
          <Text weight="bold">{p.whyUnnamedTitle}</Text>{' '}
          {day ? p.whyUnnamed(f.day(day)) : p.whyUnnamedAll}
        </Callout.Text>
      )}
    </Callout.Root>
  )
}

function Designers({ project }: { project: Project }) {
  const { t } = useI18n()
  if (project.designers.length === 0) return null
  return (
    <Text size="2" color="gray">
      {t.programme.designer}:{' '}
      {project.designers.map((designer, index) => (
        <span key={`${designer.cui} ${designer.name}`}>
          {index > 0 ? ', ' : null}
          {designer.entity && designer.cui ? (
            <EntityLink role="suppliers" cui={designer.cui}>
              {designer.name}
            </EntityLink>
          ) : (
            designer.name
          )}
        </span>
      ))}
    </Text>
  )
}

// Every payment held for the project, newest file first.
function Payments({ project }: { project: Project }) {
  const { t, f } = useI18n()
  const p = t.programme
  return (
    <Flex direction="column" gap="3">
      <Heading as="h2" size="5">
        {p.paymentsTitle}
      </Heading>
      <Text size="2" color="gray" style={{ maxWidth: '75ch' }}>
        {p.paymentsNote}
      </Text>
      <Table.Root variant="surface" size="1">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>{p.fileDay}</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>{p.request}</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>{p.registered}</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>{p.builder}</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell justify="end">
              {p.progressColumn}
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell justify="end">
              {p.amount}
            </Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {project.items.map((payment) => {
            const share = progressShare(payment.progress)
            return (
              <Table.Row key={payment.id}>
                <Table.RowHeaderCell>
                  {payment.published_on ? f.day(payment.published_on) : null}
                </Table.RowHeaderCell>
                <Table.Cell>
                  <Code variant="ghost">{p.requestNo(String(payment.id))}</Code>
                </Table.Cell>
                <Table.Cell>
                  {payment.registered_on ? f.day(payment.registered_on) : null}
                </Table.Cell>
                <Table.Cell>{payment.builder_text}</Table.Cell>
                <Table.Cell justify="end">
                  {share !== null ? f.percent(share, 2) : payment.progress}
                </Table.Cell>
                <Table.Cell justify="end" style={{ whiteSpace: 'nowrap' }}>
                  {f.lei(payment.amount)}
                </Table.Cell>
              </Table.Row>
            )
          })}
        </Table.Body>
        <tfoot>
          <Table.Row>
            <Table.RowHeaderCell colSpan={5}>
              {p.payments(project.payments, f.count(project.payments))}
            </Table.RowHeaderCell>
            <Table.Cell justify="end" style={{ whiteSpace: 'nowrap' }}>
              <Text weight="bold">{f.lei(project.paid)}</Text>
            </Table.Cell>
          </Table.Row>
        </tfoot>
      </Table.Root>
    </Flex>
  )
}
