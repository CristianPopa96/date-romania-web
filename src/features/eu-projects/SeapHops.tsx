import { ConfidenceBadge } from '#/components/ConfidenceBadge'
import { EntityLink, roleOfKind } from '#/components/EntityLink'
import type { TraceHop, TraceLink } from '#/components/TraceChain'
import type { EuSeapLinks, EuSeapOf } from '#/features/eu-projects/api'
import type { useI18n } from '#/i18n/context'

// The last two steps of an EU project's road ("Drumul banilor"): the SEAP records whose
// text cites it, and the companies that won or sold them. The tie into the records is
// ours, from the buyer's text, so it is never more than probable; the companies are
// published with their records. Nothing cited: the road stops at the records. SEAP not
// read: a step we cannot follow, never "nothing cites it". No answer at all (no such
// endpoint): no SEAP steps.
export function seapHops(
  seap: EuSeapLinks | null | 'failed',
  kind: EuSeapOf['kind'],
  by: (kind: TraceLink) => { kind: TraceLink; label: string },
  t: ReturnType<typeof useI18n>['t'],
  f: ReturnType<typeof useI18n>['f'],
): Array<TraceHop> {
  const s = t.eu.seap
  if (seap === null) return []
  if (seap === 'failed') {
    return [
      {
        role: s.hopRecords,
        name: s.hopFailed,
        note: s.hopFailedNote,
        link: by('unknown'),
        missing: 'step',
      },
    ]
  }
  const records = seap.notices + seap.purchases.length
  if (records === 0) {
    return [
      {
        role: s.hopRecords,
        name: s.hopNone,
        note: s.hopNoneNote[kind],
        link: by('gap'),
        missing: true,
      },
    ]
  }
  const parts = [
    seap.notices ? s.hopNotices(seap.notices, f.count(seap.notices)) : null,
    seap.purchases.length
      ? s.hopPurchases(seap.purchases.length, f.count(seap.purchases.length))
      : null,
  ].filter((part) => part !== null)
  // How the first record was tied and what its text cites, for the badge's words.
  const first = seap.contracts.at(0) ?? seap.purchases.at(0)
  const hops: Array<TraceHop> = [
    {
      role: s.hopRecords,
      name: parts.join(' · '),
      note: s.hopCited[kind],
      badge: (
        <ConfidenceBadge
          level="probable"
          label={s.probable}
          help={first ? s.help[first.method](first.cited) : undefined}
        />
      ),
      link: by('probable'),
    },
  ]
  if (seap.largest) {
    const others = seap.companies - 1
    hops.push({
      role: s.hopCompanies,
      name: (
        <>
          {seap.largest.entity ? (
            <EntityLink
              role={roleOfKind(seap.largest.entity.kind)}
              cui={seap.largest.entity.cui}
            >
              {seap.largest.name}
            </EntityLink>
          ) : (
            seap.largest.name
          )}
          {others > 0 ? ` ${s.andMore(others)}` : null}
        </>
      ),
      // Why this one: the most value, contracts and direct purchases added together.
      note: s.hopCompaniesNote,
      link: by('published'),
    })
  }
  return hops
}
