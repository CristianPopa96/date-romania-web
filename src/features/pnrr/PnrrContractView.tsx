import { useSuspenseQuery } from '@tanstack/react-query'
import { Link as RouterLink } from '@tanstack/react-router'
import { Code, Container, Flex, Link } from '@radix-ui/themes'

import { DataState } from '#/components/DataState'
import { EntityLink, roleOfKind } from '#/components/EntityLink'
import { SourceLine } from '#/components/SourceLine'
import {
  FiguresCard,
  NotPublic,
  ProjectHeader,
} from '#/components/project/ProjectFrame'
import { EuSeapSection, euSeapQuery } from '#/features/eu-projects'
import { PnrrRoad } from '#/features/pnrr/PnrrRoad'
import { ProgressBars } from '#/features/pnrr/PnrrContractFacts'
import { PnrrPaymentsSection } from '#/features/pnrr/PnrrPayments'
import { PnrrStatusBadge } from '#/features/pnrr/PnrrTables'
import { useI18n } from '#/i18n/context'
import type { PnrrContract } from '#/features/pnrr/api'
import { measureLabel, paidSoFar } from '#/features/pnrr/pnrr'
import { pnrrContractQuery } from '#/features/pnrr/queries'

// One PNRR financing contract on the project page of every programme (ScreenProject,
// design D22): its figures, "Drumul banilor" from the EU to the companies, its payments,
// the SEAP records that cite its number (`page` of their contracts) and what is not
// public.
export function PnrrContractView({
  id,
  page,
  onPage,
}: {
  id: number
  page: number
  onPage: (page: number) => void
}) {
  const { data: contract } = useSuspenseQuery(pnrrContractQuery(id))
  // The route loader answers "not found" before this renders.
  return contract ? (
    <ContractView contract={contract} page={page} onPage={onPage} />
  ) : null
}

function ContractView({
  contract,
  page,
  onPage,
}: {
  contract: PnrrContract
  page: number
  onPage: (page: number) => void
}) {
  const { t, f } = useI18n()
  const p = t.pnrr
  const pages = t.projects.page
  const { data: seap } = useSuspenseQuery(
    euSeapQuery({ kind: 'pnrr', id: contract.id, page }),
  )
  const measures = contract.lines.map((line) =>
    measureLabel(line.measure, line.measure_name),
  )
  const paid = paidSoFar(contract)
  const euShare =
    contract.total && contract.eu !== null ? contract.eu / contract.total : null
  const place = [contract.locality, contract.county].filter(Boolean).join(', ')
  const percent = (value: number | null) =>
    value === null ? t.common.notPublished : f.percent(value)

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
                <RouterLink to="/programe/pnrr">{p.name}</RouterLink>
              </Link>{' '}
              /{' '}
              {contract.number
                ? p.contractTitle(contract.number)
                : p.fallbackTitle}
            </>
          }
          eyebrow={pages.eyebrow(
            `${p.name} · ${measures.join(', ')}`,
            place || null,
          )}
          title={contract.title ?? p.fallbackTitle}
        />

        <FiguresCard
          figures={[
            {
              label: p.total,
              value:
                contract.total === null ? (
                  <DataState kind="notPublished" />
                ) : (
                  f.leiShort(contract.total)
                ),
              note: contract.signed_on
                ? p.signed(f.day(contract.signed_on))
                : undefined,
            },
            {
              label: p.eu,
              value:
                contract.eu === null ? (
                  <DataState kind="notPublished" />
                ) : (
                  f.leiShort(contract.eu)
                ),
              note: euShare === null ? undefined : f.percent(euShare),
            },
            paid
              ? {
                  label: p.paidSoFar,
                  value: paid.count ? f.leiShort(paid.amount) : p.noPayment,
                  note: paid.count
                    ? p.paidSoFarDetail(
                        paid.count,
                        f.count(paid.count),
                        paid.lastDay && f.day(paid.lastDay),
                      )
                    : undefined,
                }
              : {
                  label: p.paidOnContract,
                  value: p.cannotSay,
                  note: p.cannotSayDetail,
                },
            {
              label: p.progressReported,
              value: contract.measures_differ
                ? p.progressByMeasureShort
                : p.progressPhysicalShort(percent(contract.physical_progress)),
              note: contract.measures_differ
                ? p.reportedBy(contract.ministry)
                : p.progressFinancialNote(
                    percent(contract.financial_progress),
                    contract.ministry,
                  ),
            },
          ]}
          facts={[
            {
              label: pages.beneficiary,
              value: contract.beneficiary ? (
                <EntityLink
                  role={roleOfKind(contract.beneficiary.kind)}
                  cui={contract.beneficiary.cui}
                >
                  {contract.beneficiary.name}
                </EntityLink>
              ) : (
                <DataState kind="notPublished" />
              ),
            },
            contract.status
              ? {
                  label: pages.status,
                  value: <PnrrStatusBadge status={contract.status} />,
                }
              : null,
            contract.ends_on
              ? { label: pages.deadline, value: f.day(contract.ends_on) }
              : null,
            contract.number
              ? {
                  label: p.number,
                  value: <Code variant="ghost">{contract.number}</Code>,
                }
              : null,
          ]}
        />
        {/* Measures that disagree: each its own progress, as the ministry gives it. */}
        {contract.measures_differ ? <ProgressBars contract={contract} /> : null}

        <PnrrRoad contract={contract} seap={seap} />

        <PnrrPaymentsSection contract={contract} />

        <EuSeapSection
          of={{ kind: 'pnrr', id: contract.id, page }}
          beneficiary={contract.beneficiary?.cui ?? null}
          onPage={onPage}
        />

        <NotPublic title={pages.notPublicTitle} text={p.notPublic} />

        <SourceLine
          source={{
            ...contract.source,
            record:
              contract.source.record &&
              p.edition(contract.source.record, f.day(contract.edition)),
          }}
        />
      </Flex>
    </Container>
  )
}
