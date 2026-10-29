import { useSuspenseQuery } from '@tanstack/react-query'
import { Link as RouterLink } from '@tanstack/react-router'
import { InfoCircledIcon } from '@radix-ui/react-icons'
import {
  Badge,
  Callout,
  Container,
  Flex,
  Link,
  Table,
  Text,
} from '@radix-ui/themes'

import { DataState } from '#/components/DataState'
import { EntityLink } from '#/components/EntityLink'
import {
  FiguresCard,
  NotPublic,
  ProjectHeader,
  ProjectSectionHeading,
} from '#/components/project/ProjectFrame'
import { ProjectChain } from '#/features/programme/ProjectChain'
import { ProjectContracts } from '#/features/programme/ProjectContracts'
import { SourceLine } from '#/components/SourceLine'
import { useI18n } from '#/i18n/context'
import type { ProgrammeFile, Project } from '#/features/programme/api'
import { paymentFiles, progressShare } from '#/features/programme/programme'
import { programmeQuery, projectQuery } from '#/features/programme/queries'

// One Anghel Saligny project on the project page of every programme (ScreenProject,
// design D22): its figures, "Drumul banilor" from the ministry to the SEAP contract, its
// payments by file, the contracts found from its builders, and what is not public.
export function ProjectView({ id }: { id: number }) {
  const { t, f } = useI18n()
  const p = t.programme
  const page = t.projects.page
  const { data: project } = useSuspenseQuery(projectQuery(id))
  const { data: programme } = useSuspenseQuery(programmeQuery)
  // The route loader answers "not found" before this renders.
  if (!project) return null
  const searched = programme
    ? f.span(programme.contracts_first_day, programme.contracts_last_day)
    : null
  const files = paymentFiles(project.items)
  const filesSpan = f.span(files.first, files.last)
  const share = progressShare(project.progress)
  const money = (value: number | null) =>
    value === null ? <DataState kind="notPublished" /> : f.leiShort(value)
  const isCounty = /^jude[tț]ul/i.test(project.town_hall)
  const place = isCounty
    ? p.countyOf(project.county_name)
    : `${project.town_hall}, ${p.countyOf(project.county_name)}`

  return (
    <Container size="4" px="5" py="7">
      <Flex direction="column" gap="6">
        <ProjectHeader
          crumbs={
            <>
              <Link asChild>
                <RouterLink to="/proiecte">{t.projects.crumb}</RouterLink>
              </Link>{' '}
              /{' '}
              <Link asChild>
                <RouterLink to="/programe/anghel-saligny">{p.name}</RouterLink>
              </Link>{' '}
              / {p.projectTitle(String(project.id))}
            </>
          }
          eyebrow={page.eyebrow(p.name, place)}
          title={project.investment ?? p.fallbackTitle}
        />

        <FiguresCard
          figures={[
            {
              label: p.figureTotal,
              value: money(project.total_value),
              note: project.ministry_contract_date
                ? p.financingOn(f.day(project.ministry_contract_date))
                : undefined,
            },
            {
              label: p.figureState,
              value: money(project.state_budget_value),
              note: project.poim ? p.alsoEu : undefined,
            },
            {
              label: p.figurePaid,
              value: f.leiShort(project.paid),
              note: filesSpan
                ? `${p.payments(project.payments, f.count(project.payments))} · ${filesSpan.from}–${filesSpan.to}`
                : p.payments(project.payments, f.count(project.payments)),
            },
            {
              label: p.figureProgress,
              value:
                share !== null
                  ? f.percent(share)
                  : (project.progress ?? <DataState kind="notPublished" />),
              note: p.progressBy,
            },
          ]}
          facts={[
            {
              label: page.beneficiary,
              value: project.town_hall_entity ? (
                <EntityLink
                  role="institutions"
                  cui={project.town_hall_entity.cui}
                >
                  {project.town_hall_entity.name}
                </EntityLink>
              ) : (
                project.town_hall
              ),
            },
            project.state
              ? {
                  label: page.status,
                  value: (
                    <Badge color="gray" variant="outline">
                      {project.state}
                    </Badge>
                  ),
                }
              : null,
            project.estimated_end
              ? { label: page.deadline, value: f.day(project.estimated_end) }
              : null,
          ]}
        />

        <ProjectChain project={project} searched={searched} />

        <Payments project={project} />

        <Flex direction="column" gap="4">
          <ProjectSectionHeading title={page.linkedTitle} aside={p.linkedHow} />
          {project.builders.map((builder) => (
            <ProjectContracts
              key={`${builder.cui} ${builder.name}`}
              builder={builder}
            />
          ))}
          <Why project={project} files={programme?.files ?? []} />
          <Designers project={project} />
        </Flex>

        <NotPublic title={page.notPublicTitle} text={p.notPublic} />

        <Flex direction="column" gap="1">
          <SourceLine source={project.source} of="payments" />
          {project.builders.some((each) => each.contracts.length > 0) ? (
            <SourceLine source={project.contracts_source} of="contracts" />
          ) : null}
        </Flex>
      </Flex>
    </Container>
  )
}

// Said once, where the road stops before a contract: what the reader is looking at.
function Why({
  project,
  files,
}: {
  project: Project
  files: Array<ProgrammeFile>
}) {
  const { t, f } = useI18n()
  const p = t.programme
  if (project.match !== 'none' && project.match !== 'unnamed') return null
  // The first payment file that names builders by tax ID, if any does.
  const named = files.find((file) => file.with_tax_id > 0)
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
          {named?.published_on
            ? p.whyUnnamed(f.day(named.published_on))
            : named
              ? p.whyUnnamedOlder
              : p.whyUnnamedAll}
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

// Every payment held for the project, by the file that lists it: the files give no
// payment day, only the file's. Never a chart by month.
function Payments({ project }: { project: Project }) {
  const { t, f } = useI18n()
  const p = t.programme
  const files = paymentFiles(project.items)
  const filesSpan = f.span(files.first, files.last)
  // A file that leaves a value out does not publish it: said, never left blank.
  const missing = <DataState kind="notPublished" />
  return (
    <Flex direction="column" gap="3">
      <ProjectSectionHeading title={p.paymentsHeading} aside={p.filesOnly} />
      <Table.Root variant="surface" size="1">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>{p.fileColumn}</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>{p.namedBuilder}</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell justify="end">
              {p.amount}
            </Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {project.items.map((payment) => (
            <Table.Row key={payment.id}>
              <Table.RowHeaderCell>
                {payment.published_on ? f.day(payment.published_on) : missing}
              </Table.RowHeaderCell>
              <Table.Cell>{payment.builder_text ?? missing}</Table.Cell>
              <Table.Cell justify="end" style={{ whiteSpace: 'nowrap' }}>
                {f.lei(payment.amount)}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
        <tfoot>
          <Table.Row>
            <Table.RowHeaderCell colSpan={2}>
              {p.paymentsInFiles(
                p.payments(project.payments, f.count(project.payments)),
                files.count,
                f.count(files.count),
              )}
              {filesSpan ? ` · ${filesSpan.from}–${filesSpan.to}` : null}
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
