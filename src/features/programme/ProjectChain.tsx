import { Link as RouterLink } from '@tanstack/react-router'
import { Code, Flex, Link, Text } from '@radix-ui/themes'

import { DataState } from '#/components/DataState'
import { EntityLink } from '#/components/EntityLink'
import { TraceChain, TraceLegend } from '#/features/programme/TraceChain'
import type { TraceHop, TraceLink } from '#/features/programme/TraceChain'
import { useI18n } from '#/i18n/context'
import { rich } from '#/i18n/rich'
import type { Project, TraceBuilder } from '#/features/programme/api'
import {
  chainEnd,
  progressShare,
  weakest,
} from '#/features/programme/programme'

// The money of one project, hop by hop, for one of its builders: ministry, town hall,
// project, builder, and the SEAP contract when one was found. The first links are
// published together in a payment file; the one to the contract is ours, and never sure.
export function ProjectChain({
  project,
  builder,
  searched,
}: {
  project: Project
  builder: TraceBuilder
  // The two ends of the period whose contracts were searched.
  searched: { from: string; to: string } | null
}) {
  const { t, f } = useI18n()
  const p = t.programme
  const isCounty = /^jude[tț]ul/i.test(project.town_hall)
  const cui = (value: number) =>
    rich(t.common.cui, {
      cui: (
        <Code key="cui" variant="ghost">
          {value}
        </Code>
      ),
    })
  const share = progressShare(project.progress)
  // What each line of this chain means, in the words of the legend under it.
  const labels: Record<TraceLink, string> = {
    published: p.linkPublished,
    probable: p.linkProbable,
    possible: p.linkPossible,
    gap: p.linkNone,
  }
  const by = (kind: TraceLink) => ({ kind, label: labels[kind] })

  const hops: Array<TraceHop> = [
    {
      role: p.ministry,
      name: p.ministryName,
      note: p.matchAmount(
        p.payments(builder.payments, f.count(builder.payments)),
        f.leiShort(builder.amount),
      ),
    },
    {
      role: isCounty ? p.countyCouncil : p.townHall,
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
      role: p.project,
      name: p.projectHop(String(project.id)),
      note:
        share !== null
          ? p.progress(f.percent(share, 2))
          : project.progress
            ? p.progressAsWritten(project.progress)
            : undefined,
      link: by('published'),
    },
    {
      role: p.builder,
      name:
        builder.name === null ? (
          <DataState kind="notPublished" />
        ) : builder.entity && builder.cui ? (
          <EntityLink role="suppliers" cui={builder.cui}>
            {builder.name}
          </EntityLink>
        ) : (
          builder.name
        ),
      note: builder.cui ? cui(builder.cui) : p.noTaxId,
      link: by('published'),
    },
    ...contractHops(),
  ]

  function contractHops(): Array<TraceHop> {
    const end = chainEnd(builder)
    if (end.kind === 'none' || end.kind === 'unnamed') {
      return [
        {
          role: p.contractHop,
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
    const tie = by(weakest(builder.contracts) ?? 'probable')
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
          role: p.contractHop,
          name: p.severalHop(notices.size, f.count(notices.size)),
          note: p.severalNote,
          link: tie,
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
        role: p.contractHop,
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
        note:
          end.kind === 'notice'
            ? p.contractsOfNotice(
                builder.contracts.length,
                f.count(builder.contracts.length),
              )
            : contract.value_ron === null
              ? undefined
              : contract.is_framework
                ? // A ceiling is not compared with what the project costs.
                  p.ceiling(f.leiShort(contract.value_ron))
                : contract.ratio !== null
                  ? p.contractValue(
                      f.leiShort(contract.value_ron),
                      f.percent(contract.ratio),
                    )
                  : f.leiShort(contract.value_ron),
        link: tie,
      },
      subcontractors,
    ]
  }

  const drawn = new Set(hops.map((hop) => hop.link?.kind))
  return (
    <Flex direction="column" gap="3">
      <TraceChain hops={hops} label={p.chainOf(builder.name ?? p.builder)} />
      <TraceLegend
        title={p.links}
        items={(['published', 'probable', 'possible', 'gap'] as const)
          .filter((kind) => drawn.has(kind))
          .map(by)}
      />
      {builder.cui ? (
        <Text size="1">
          <Link asChild>
            <RouterLink
              to="/programe/anghel-saligny"
              search={{ firma: builder.cui }}
            >
              {p.otherProjects}
            </RouterLink>
          </Link>
        </Text>
      ) : null}
    </Flex>
  )
}
