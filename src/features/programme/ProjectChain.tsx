import { Link as RouterLink } from '@tanstack/react-router'
import { Code, Link } from '@radix-ui/themes'

import { ConfidenceBadge } from '#/components/ConfidenceBadge'
import { DataState } from '#/components/DataState'
import { EntityLink } from '#/components/EntityLink'
import type { TraceHop, TraceLink } from '#/components/TraceChain'
import { MoneyRoad } from '#/components/project/ProjectFrame'
import { useI18n } from '#/i18n/context'
import { rich } from '#/i18n/rich'
import type { Project, TraceBuilder } from '#/features/programme/api'
import { chainEnd, paymentFiles, weakest } from '#/features/programme/programme'

// "Drumul banilor" of an Anghel Saligny project: MDLPA (funder and programme in one hop)
// → financing contract → town hall → payments → the builder named in the payment file →
// the SEAP contract found from the builder → subcontractors, never published. The first
// links are published together in a payment file; the one to the contract is ours, and
// never sure. Several builders: the hop names the one with the most payments and counts
// the rest; the tables under the chain list them all.
export function ProjectChain({
  project,
  searched,
}: {
  project: Project
  // The two ends of the period whose contracts were searched.
  searched: { from: string; to: string } | null
}) {
  const { t, f } = useI18n()
  const p = t.programme
  const page = t.projects.page
  const isCounty = /^jude[tț]ul/i.test(project.town_hall)
  const cui = (value: number) =>
    rich(t.common.cui, {
      cui: (
        <Code key="cui" variant="ghost">
          {value}
        </Code>
      ),
    })
  const legend: Record<TraceLink, string> = {
    published: p.linkPublished,
    probable: page.legend.probable,
    possible: page.legend.possible,
    unknown: page.legend.unknown,
    gap: page.legend.gap,
  }
  const by = (kind: TraceLink) => ({ kind, label: legend[kind] })
  const builders = [...project.builders].sort((a, b) => b.payments - a.payments)
  const first = builders.at(0)
  const files = paymentFiles(project.items)
  const filesSpan = f.span(files.first, files.last)

  const hops: Array<TraceHop> = [
    {
      role: p.funderProgramme,
      name: p.funderName,
      note: p.funderNote,
    },
    {
      role: p.financingContract,
      name: project.ministry_contract_no ? (
        p.financingNo(project.ministry_contract_no)
      ) : (
        <DataState kind="notPublished" />
      ),
      figure:
        project.total_value !== null
          ? f.leiShort(project.total_value)
          : undefined,
      note: project.ministry_contract_date
        ? p.signedOn(f.day(project.ministry_contract_date))
        : undefined,
      link: by('published'),
    },
    {
      role: page.beneficiary,
      name: project.town_hall_entity ? (
        <EntityLink role="institutions" cui={project.town_hall_entity.cui}>
          {isCounty ? project.county_name : project.town_hall}
        </EntityLink>
      ) : isCounty ? (
        project.county_name
      ) : (
        project.town_hall
      ),
      note: project.town_hall_entity
        ? cui(project.town_hall_entity.cui)
        : p.countyOf(project.county_name),
      link: by('published'),
    },
    {
      role: p.paymentsHop,
      name: p.payments(project.payments, f.count(project.payments)),
      figure: f.leiShort(project.paid),
      note: filesSpan
        ? p.inFiles(
            files.count,
            f.count(files.count),
            `${filesSpan.from}–${filesSpan.to}`,
          )
        : undefined,
      link: by('published'),
    },
    builderHop(),
    ...contractHops(),
  ]

  function builderHop(): TraceHop {
    const others = builders.length - 1
    return {
      role: p.companiesHop,
      name:
        !first || first.name === null ? (
          <DataState kind="notPublished" />
        ) : (
          <>
            {first.entity && first.cui ? (
              <EntityLink role="suppliers" cui={first.cui}>
                {first.name}
              </EntityLink>
            ) : (
              first.name
            )}
            {others > 0 ? ` ${p.andMore(others)}` : null}
          </>
        ),
      note: first?.cui
        ? rich(p.namedInFile, {
            cui: (
              <Code key="cui" variant="ghost">
                {first.cui}
              </Code>
            ),
          })
        : p.noTaxId,
      link: by('published'),
    }
  }

  function contractHops(): Array<TraceHop> {
    // The builder whose payments reach a contract, if one does.
    const builder: TraceBuilder | undefined =
      builders.find((each) => each.contracts.length > 0) ?? first
    const end = builder ? chainEnd(builder) : { kind: 'unnamed' as const }
    if (!builder || end.kind === 'none' || end.kind === 'unnamed') {
      return [
        {
          role: p.purchasesHop,
          name: end.kind === 'none' ? p.noneHop : p.unnamedHop,
          note:
            end.kind === 'unnamed'
              ? p.unnamedNote
              : searched
                ? p.noneNote(searched.from, searched.to)
                : undefined,
          link: by('gap'),
          missing: true,
        },
      ]
    }
    const level = weakest(builder.contracts) ?? 'probable'
    const badge = (
      <ConfidenceBadge
        level={level === 'possible' ? 'none' : 'probable'}
        label={p.confidenceShort[level]}
        help={p.confidence[level]}
      />
    )
    const subcontractors: TraceHop = {
      role: p.subcontractors,
      name: <DataState kind="notPublished" />,
      note: p.subcontractorsNote,
      link: by('gap'),
      missing: true,
    }
    // Several notices: none is picked, so the hop names how many there are.
    if (!('contract' in end)) {
      const notices = new Set(builder.contracts.map((each) => each.notice_no))
      return [
        {
          role: p.purchasesHop,
          name: p.severalHop(notices.size, f.count(notices.size)),
          note: p.severalNote,
          badge,
          link: by(level),
        },
        subcontractors,
      ]
    }
    const { contract } = end
    const number =
      contract.notice_no === null ? (
        <DataState kind="notPublished" />
      ) : (
        <Code variant="ghost">{contract.notice_no}</Code>
      )
    return [
      {
        role: p.purchasesHop,
        name:
          contract.notice_id !== null ? (
            <Link asChild>
              <RouterLink
                to="/contracte/$id"
                params={{ id: String(contract.notice_id) }}
              >
                {number}
              </RouterLink>
            </Link>
          ) : (
            number
          ),
        figure:
          contract.value_ron === null
            ? undefined
            : contract.is_framework
              ? // A ceiling is not compared with what the project costs.
                p.ceiling(f.leiShort(contract.value_ron))
              : f.leiShort(contract.value_ron),
        note:
          end.kind === 'notice'
            ? p.contractsOfNotice(
                builder.contracts.length,
                f.count(builder.contracts.length),
              )
            : contract.ratio !== null && !contract.is_framework
              ? p.ofProjectValue(f.percent(contract.ratio))
              : undefined,
        badge,
        link: by(level),
      },
      subcontractors,
    ]
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
