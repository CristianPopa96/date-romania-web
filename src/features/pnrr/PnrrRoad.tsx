import { Link as RouterLink } from '@tanstack/react-router'
import { Code, Link } from '@radix-ui/themes'

import { DataState } from '#/components/DataState'
import { EntityLink, roleOfKind } from '#/components/EntityLink'
import type { TraceHop, TraceLink } from '#/components/TraceChain'
import { MoneyRoad } from '#/components/project/ProjectFrame'
import { seapHops } from '#/features/eu-projects'
import type { EuSeapLinks } from '#/features/eu-projects'
import { useI18n } from '#/i18n/context'
import { rich } from '#/i18n/rich'
import type { PnrrContract } from '#/features/pnrr/api'
import {
  measureLabel,
  measureSlug,
  paidSoFar,
  paymentsCase,
} from '#/features/pnrr/pnrr'

// "Drumul banilor" of a PNRR contract: the EU → the measure (with the ministry that runs
// it) → the financing contract → the beneficiary → its payments → the SEAP records that
// cite the contract → the companies. When the beneficiary has several contracts on a
// measure, the payments are a step we cannot follow ("Nu putem spune"): the road goes on to
// the records, which are tied another way.
export function PnrrRoad({
  contract,
  seap,
}: {
  contract: PnrrContract
  seap: EuSeapLinks | null | 'failed'
}) {
  const { t, f } = useI18n()
  const p = t.pnrr
  const page = t.projects.page
  const legend: Record<TraceLink, string> = page.legend
  const by = (kind: TraceLink) => ({ kind, label: legend[kind] })
  const first = contract.lines.at(0)
  const others = new Set(contract.lines.map((line) => line.measure)).size - 1
  const fundings = [
    ...new Set(contract.lines.map((line) => line.funding).filter(Boolean)),
  ]
    .map((each) => (each && p.fundings[each]) ?? each)
    .join(', ')

  const hops: Array<TraceHop> = [
    { role: p.roadFunder, name: p.roadEu, note: p.roadFacility },
    {
      role: p.roadMeasure,
      name: first ? (
        <>
          <Link asChild>
            <RouterLink
              to="/programe/pnrr/$masura"
              params={{ masura: measureSlug(first.measure) }}
            >
              {measureLabel(first.measure, first.measure_name)}
            </RouterLink>
          </Link>
          {others > 0 ? ` ${p.andMore(others)}` : null}
        </>
      ) : (
        <DataState kind="notPublished" />
      ),
      note: [p.coordinatedBy(contract.ministry), fundings]
        .filter(Boolean)
        .join(' · '),
      link: by('published'),
    },
    {
      role: p.roadContract,
      name: contract.number ? (
        rich(p.roadNumber, {
          number: (
            <Code key="number" variant="ghost">
              {contract.number}
            </Code>
          ),
        })
      ) : (
        <DataState kind="notPublished" />
      ),
      figure: contract.total === null ? undefined : f.leiShort(contract.total),
      note: contract.signed_on
        ? p.signed(f.day(contract.signed_on))
        : undefined,
      link: by('published'),
    },
    {
      role: page.beneficiary,
      name: contract.beneficiary ? (
        <EntityLink
          role={roleOfKind(contract.beneficiary.kind)}
          cui={contract.beneficiary.cui}
        >
          {contract.beneficiary.name}
        </EntityLink>
      ) : (
        <DataState kind="notPublished" />
      ),
      note: contract.beneficiary
        ? rich(t.common.cui, {
            cui: (
              <Code key="cui" variant="ghost">
                {contract.beneficiary.cui}
              </Code>
            ),
          })
        : undefined,
      link: by('published'),
    },
    paymentsHop(),
    ...seapHops(seap, 'pnrr', by, t, f),
  ]

  function paymentsHop(): TraceHop {
    const paid = paidSoFar(contract)
    if (paid && paid.count) {
      return {
        role: p.roadPayments,
        name: p.paymentsCount(paid.count, f.count(paid.count)),
        figure: f.leiShort(paid.amount),
        note: paid.lastDay ? p.roadLastPaid(f.day(paid.lastDay)) : undefined,
        link: by('published'),
      }
    }
    const shared = contract.payments.filter(
      (each) => paymentsCase(each) === 'several',
    )
    if (shared.length) {
      const sum = shared.reduce((total, each) => total + each.paid, 0)
      const contracts = Math.max(...shared.map((each) => each.contracts))
      return {
        role: p.roadPayments,
        name: p.cannotSay,
        figure: p.roadShared(f.leiShort(sum)),
        note: p.roadSharedNote(contracts, f.count(contracts)),
        link: by('unknown'),
        missing: 'step',
      }
    }
    return {
      role: p.roadPayments,
      name: p.noPayment,
      note: p.roadNoPayment,
      link: by('unknown'),
      missing: 'step',
    }
  }

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
