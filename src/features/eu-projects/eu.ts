// The EU project pages' logic: how a beneficiary's tie is marked, how a programme is
// named in an address, and what share of a project the EU pays. Kept here so it can be
// tested.

import type {
  EuBeneficiary,
  EuBeneficiaryFunds,
  EuProgramme,
} from '#/features/eu-projects/api'
import type { EuLists } from '#/features/entities'

// How the tie between a project and its beneficiary is marked (the ConfidenceBadge of the
// design system): 'sure' when the list gives the CUI, 'probable' when we tied it by name.
// `label` names the evidence: 'cui', 'administration' (the town hall or council of the
// place an administration's name governs), 'namePlace' or 'companyName'.
export type BeneficiaryTie = {
  level: 'sure' | 'probable' | 'none'
  label: 'cui' | 'administration' | 'namePlace' | 'companyName' | 'none'
}

// The words for each way we tie by name; a way added later reads as name and place.
const PROBABLE_LABELS: Partial<Record<string, BeneficiaryTie['label']>> = {
  'administration-name+place': 'administration',
  'name+place': 'namePlace',
  'company-name': 'companyName',
}

export function beneficiaryTie(beneficiary: EuBeneficiary): BeneficiaryTie {
  if (!beneficiary.entity) return { level: 'none', label: 'none' }
  if (beneficiary.confidence === 'sure') return { level: 'sure', label: 'cui' }
  return {
    level: 'probable',
    label: PROBABLE_LABELS[beneficiary.method ?? ''] ?? 'namePlace',
  }
}

// A programme in the address: its code in lower case and the first year of its period,
// '?program=poids-2021'. The code alone is not enough: POAT (2014-2020) and PoAT
// (2021-2027) differ only in case.
export function programmeSlug(programme: {
  code: string
  period: string
}): string {
  return `${programme.code.toLowerCase()}-${programme.period.slice(0, 4)}`
}

export function programmeBySlug(
  programmes: ReadonlyArray<EuProgramme>,
  slug: string | undefined,
): EuProgramme | null {
  if (!slug) return null
  return (
    programmes.find((each) => programmeSlug(each) === slug.toLowerCase()) ??
    null
  )
}

// The EU's share of a project's value; null when either is missing or the value is zero.
export function euShare(
  eu: number | null,
  total: number | null,
): number | null {
  return eu !== null && total ? eu / total : null
}

// '2021-2027' as the site writes a span of years, with an en dash.
export function periodLabel(period: string): string {
  return period.replace('-', '–')
}

// What an entity holds of EU money, as its page counts it: its cohesion projects (every
// programme's, a count only) and how many of them we tied by name, its PNRR contracts,
// and whether it was paid from PNRR (it can be, on a measure with no contract held).
// Nothing when the answer is missing.
export function euCounts(funds: EuBeneficiaryFunds | null | 'failed') {
  if (!funds || funds === 'failed') {
    return { cohesion: 0, byName: 0, pnrr: 0, pnrrPaid: false }
  }
  return {
    cohesion: funds.cohesion.reduce((n, row) => n + row.projects, 0),
    byName: funds.cohesion.reduce((n, row) => n + row.by_name, 0),
    pnrr: funds.pnrr?.contracts ?? 0,
    pnrrPaid: (funds.pnrr?.payments ?? 0) > 0,
  }
}

// The EU lists an entity page offers: one per kind it has. PNRR counts a payment with no
// contract too: the money was received, and the page says on what.
export function euLists(funds: EuBeneficiaryFunds | null | 'failed'): EuLists {
  const counts = euCounts(funds)
  return {
    coeziune: counts.cohesion > 0,
    pnrr: counts.pnrr > 0 || counts.pnrrPaid,
  }
}
