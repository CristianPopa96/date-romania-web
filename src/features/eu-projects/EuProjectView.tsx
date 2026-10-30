import { useSuspenseQuery } from '@tanstack/react-query'
import { Link as RouterLink } from '@tanstack/react-router'
import { Code, Container, Flex, Link, Text } from '@radix-ui/themes'

import { ConfidenceBadge } from '#/components/ConfidenceBadge'
import { DataState } from '#/components/DataState'
import { EntityLink, roleOfKind } from '#/components/EntityLink'
import { SourceLine } from '#/components/SourceLine'
import type { TraceHop, TraceLink } from '#/components/TraceChain'
import {
  FiguresCard,
  MoneyRoad,
  NotPublic,
  ProjectHeader,
  ProjectSectionHeading,
} from '#/components/project/ProjectFrame'
import {
  EuStatusBadge,
  PaymentsTable,
} from '#/features/eu-projects/EuProjectFacts'
import { EuSeapSection } from '#/features/eu-projects/EuSeapSection'
import { seapHops } from '#/features/eu-projects/SeapHops'
import { useI18n } from '#/i18n/context'
import type { EuProject, EuSeapLinks } from '#/features/eu-projects/api'
import { beneficiaryTie, euShare, periodLabel } from '#/features/eu-projects/eu'
import { euProjectQuery, euSeapQuery } from '#/features/eu-projects/queries'

// One EU cohesion project on the project page of every programme (ScreenProject, design
// D22): its figures, "Drumul banilor" from the EU to the companies, its partners, the
// payments where the programme publishes them one by one (Health), the SEAP records that
// cite it (`page` of their contracts) and what is not public.
export function EuProjectView({
  smis,
  page,
  onPage,
}: {
  smis: number
  page: number
  onPage: (page: number) => void
}) {
  const { data: project } = useSuspenseQuery(euProjectQuery(smis))
  // The route loader answers "not found" before this renders.
  return project ? (
    <ProjectView project={project} page={page} onPage={onPage} />
  ) : null
}

function ProjectView({
  project,
  page,
  onPage,
}: {
  project: EuProject
  page: number
  onPage: (page: number) => void
}) {
  const { t, f } = useI18n()
  const e = t.eu
  const pages = t.projects.page
  const { data: seap } = useSuspenseQuery(
    euSeapQuery({ kind: 'smis', id: project.smis, page }),
  )
  const share = euShare(project.eu, project.total)
  const payments = project.payments
  const days = (payments ?? []).flatMap((payment) =>
    payment.paid_on ? [payment.paid_on] : [],
  )
  const span = f.span(days.at(-1) ?? null, days.at(0) ?? null)
  const paidInFiles = (payments ?? []).reduce((sum, p) => sum + p.amount, 0)
  const programme = `${project.programme_name} ${periodLabel(project.period)}`
  const place = [project.locality, project.county].filter(Boolean).join(', ')
  const money = (value: number | null) =>
    value === null ? <DataState kind="notPublished" /> : f.leiShort(value)

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
                <RouterLink to="/programe/fonduri-europene">
                  {e.name}
                </RouterLink>
              </Link>{' '}
              / {e.smis(String(project.smis))}
            </>
          }
          eyebrow={pages.eyebrow(programme, place || null)}
          title={project.title ?? e.fallbackTitle}
        />

        <FiguresCard
          figures={[
            {
              label: e.total,
              value: money(project.total),
              note: project.starts_on
                ? e.started(f.day(project.starts_on))
                : undefined,
            },
            {
              label: e.eu,
              value: money(project.eu),
              note: share === null ? undefined : f.percent(share),
            },
            {
              label: project.cut_off
                ? e.paidUntil(f.day(project.cut_off))
                : e.paidAll,
              value: money(project.paid),
              note: payments ? e.paidUntilDated : e.paidUntilDetail,
            },
            {
              label: e.rate,
              value:
                project.cofinancing_rate === null ? (
                  <DataState kind="notPublished" />
                ) : (
                  f.percent(project.cofinancing_rate)
                ),
              note: e.rateNote,
            },
          ]}
          facts={[
            {
              label: pages.beneficiary,
              value: <Beneficiary project={project} />,
            },
            {
              label: pages.status,
              value: (
                <EuStatusBadge
                  status={project.status}
                  written={project.status_written}
                />
              ),
            },
            project.ends_on
              ? { label: pages.deadline, value: f.day(project.ends_on) }
              : null,
            {
              label: e.smisCode,
              value: <Code variant="ghost">{project.smis}</Code>,
            },
          ]}
        />

        {/* As the list writes them, one text: never tied to an entity by name. */}
        {project.partners ? (
          <Flex direction="column" gap="2">
            <ProjectSectionHeading title={e.partners} />
            <Text size="2" color="gray" style={{ maxWidth: 900 }}>
              {project.partners}
            </Text>
          </Flex>
        ) : null}

        <CohesionRoad project={project} seap={seap} />

        {payments && project.payments_source ? (
          <Flex direction="column" gap="3">
            <ProjectSectionHeading
              title={e.paymentsTitle}
              aside={e.paymentsNote(
                payments.length,
                f.count(payments.length),
                f.leiShort(paidInFiles),
                span ? t.period.range(span.from, span.to) : '',
              )}
            />
            <PaymentsTable payments={payments} />
            <SourceLine source={project.payments_source} of="payments" />
          </Flex>
        ) : null}

        <EuSeapSection
          of={{ kind: 'smis', id: project.smis, page }}
          beneficiary={project.beneficiary.entity?.cui ?? null}
          onPage={onPage}
        />

        <NotPublic
          title={pages.notPublicTitle}
          text={payments ? e.notPublicDated : e.notPublic}
        />

        <SourceLine
          source={{
            ...project.source,
            record:
              project.source.record &&
              (project.cut_off
                ? e.listOn(project.source.record, f.day(project.cut_off))
                : project.source.record),
          }}
        />
      </Flex>
    </Container>
  )
}

// The beneficiary as the list names it, its page when tied, and how it was tied.
function Beneficiary({ project }: { project: EuProject }) {
  const { t } = useI18n()
  const { beneficiary } = project
  const tie = beneficiaryTie(beneficiary)
  return (
    <>
      {beneficiary.entity ? (
        <EntityLink
          role={roleOfKind(beneficiary.entity.kind)}
          cui={beneficiary.entity.cui}
        >
          {beneficiary.entity.name}
        </EntityLink>
      ) : (
        (beneficiary.name ?? <DataState kind="notPublished" />)
      )}{' '}
      <ConfidenceBadge
        level={tie.level}
        label={t.eu.tie[tie.label]}
        help={t.eu.tieHelp[tie.label]}
      />
    </>
  )
}

// "Drumul banilor" of a cohesion project: the EU → the programme → the financing contract
// (the SMIS project) → the beneficiary → what was paid up to the list's day → the SEAP
// records that cite the SMIS code → the companies.
function CohesionRoad({
  project,
  seap,
}: {
  project: EuProject
  seap: EuSeapLinks | null | 'failed'
}) {
  const { t, f } = useI18n()
  const e = t.eu
  const page = t.projects.page
  const legend: Record<TraceLink, string> = page.legend
  const by = (kind: TraceLink) => ({ kind, label: legend[kind] })
  const tie = beneficiaryTie(project.beneficiary)
  const payments = project.payments

  const hops: Array<TraceHop> = [
    { role: e.roadFunder, name: e.roadEu, note: e.roadFunds },
    {
      role: e.roadProgramme,
      name: project.programme,
      note: `${project.programme_name} ${periodLabel(project.period)}`,
      link: by('published'),
    },
    {
      role: e.roadContract,
      name: e.smis(String(project.smis)),
      figure: project.total === null ? undefined : f.leiShort(project.total),
      note: project.starts_on ? e.started(f.day(project.starts_on)) : undefined,
      link: by('published'),
    },
    {
      role: page.beneficiary,
      name: project.beneficiary.entity ? (
        <EntityLink
          role={roleOfKind(project.beneficiary.entity.kind)}
          cui={project.beneficiary.entity.cui}
        >
          {project.beneficiary.entity.name}
        </EntityLink>
      ) : (
        (project.beneficiary.name ?? <DataState kind="notPublished" />)
      ),
      badge: (
        <ConfidenceBadge
          level={tie.level}
          label={e.tie[tie.label]}
          help={e.tieHelp[tie.label]}
        />
      ),
      link: by('published'),
    },
    payments && payments.length
      ? {
          role: e.roadPayments,
          name: e.roadPaymentsCount(payments.length, f.count(payments.length)),
          figure: f.leiShort(payments.reduce((sum, p) => sum + p.amount, 0)),
          note: e.roadDated,
          link: by('published'),
        }
      : project.paid !== null
        ? {
            role: e.roadPayments,
            name: f.leiShort(project.paid),
            note: project.cut_off
              ? e.roadUntil(f.day(project.cut_off))
              : e.roadNoCutOff,
            link: by('published'),
          }
        : {
            role: e.roadPayments,
            name: <DataState kind="notPublished" />,
            note: e.roadNoPaid,
            link: by('unknown'),
            missing: 'step',
          },
    ...seapHops(seap, 'smis', by, t, f),
  ]

  return (
    <MoneyRoad
      title={page.roadTitle}
      lead={page.roadLead}
      hops={hops}
      label={page.roadTitle}
      legend={legend}
    />
  )
}
