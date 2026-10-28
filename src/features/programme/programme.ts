// Reading the Anghel Saligny programme: the small decisions its pages share, kept out
// of the components so they can be tested.

import type {
  Confidence,
  Match,
  MatchCounts,
  TraceBuilder,
  TraceContract,
} from '#/features/programme/api'

// A county in an address: "bistrita-nasaud" for the API's "BISTRITA NASAUD".
export function countySlug(key: string) {
  return key.toLowerCase().replace(/ /g, '-')
}

export function countyKey(slug: string) {
  return slug.toUpperCase().replace(/-/g, ' ')
}

// The match states as addresses name them: /programe/anghel-saligny?legatura=mai-multe.
export const MATCH_PARAMS = {
  'un-contract': 'one',
  'mai-multe': 'several',
  niciunul: 'none',
  'fara-cui': 'unnamed',
} as const satisfies Record<string, Match>
export type MatchParam = keyof typeof MATCH_PARAMS

// True for a name the address may carry. `in` would also say yes to "toString".
export function isMatchParam(value: unknown): value is MatchParam {
  return typeof value === 'string' && Object.hasOwn(MATCH_PARAMS, value)
}

export function matchParam(match: Match) {
  const names = Object.keys(MATCH_PARAMS) as Array<MatchParam>
  return names.find((name) => MATCH_PARAMS[name] === match)
}

// How much was tied, probably, to the contracts of one award notice, out of what could
// be tied at all. Only payments that name the builder by tax ID can be tied, so the share
// is of those, never of every payment: the older files give names only. Left out of what
// counts as tied, and counted apart:
//   several   payments with several possible notices: we do not know which one is paid
//   possible  payments tied to one notice by a link that is only possible
export function tiedShare(match: MatchCounts, possible: MatchCounts) {
  const named = {
    count: match.one.count + match.several.count + match.none.count,
    amount: match.one.amount + match.several.amount + match.none.amount,
  }
  if (named.count === 0 || named.amount === 0) return null
  return {
    named: named.count,
    several: match.several.count,
    possible: possible.one.count,
    ofCount: (match.one.count - possible.one.count) / named.count,
    ofAmount: (match.one.amount - possible.one.amount) / named.amount,
  }
}

// The weakest link among contracts: one possible link makes the whole possible.
export function weakest(
  contracts: Array<Pick<TraceContract, 'confidence'>>,
): Confidence | null {
  if (contracts.length === 0) return null
  return contracts.some((each) => each.confidence === 'possible')
    ? 'possible'
    : 'probable'
}

// The other winners of a contract by name, or by tax ID where SEAP gives no name.
export function partnerNames(contract: TraceContract) {
  return contract.partners
    .map((partner) => partner.name ?? partner.cui?.toString() ?? null)
    .filter((name) => name !== null)
}

// The progress of the works as a share, from what a town hall typed: "83,34", "64%",
// "69,57 %", "100". Null for anything else ("PT RECEPTIONAT SI APROBAT"), which is
// shown as written.
export function progressShare(text: string | null) {
  const found = /^\s*(\d{1,3}(?:[.,]\d+)?)\s*%?\s*$/.exec(text ?? '')
  if (!found) return null
  const percent = Number(found[1].replace(',', '.'))
  return percent <= 100 ? percent / 100 : null
}

export function isAssociation(contract: TraceContract) {
  return contract.partners.length > 0
}

// What the last hop of a builder's chain shows.
//   contract  one notice with one contract: its number and value stand in the chain
//   notice    one notice with several contracts (lots): the list under the chain has them
//   several   more than one notice: the files do not say which
//   none      no contract found; the chain stops at the builder
//   unnamed   the builder has no tax ID in the files; the chain stops at the builder
export type ChainEnd =
  | { kind: 'contract' | 'notice'; contract: TraceContract }
  | { kind: 'several' | 'none' | 'unnamed' }

export function chainEnd(builder: TraceBuilder): ChainEnd {
  const first = builder.contracts.at(0)
  if (builder.match === 'one') {
    // A match of one notice comes with its contracts; without them the chain stops, as
    // it does when nothing was found.
    if (!first) return { kind: 'none' }
    return {
      kind: builder.contracts.length === 1 ? 'contract' : 'notice',
      contract: first,
    }
  }
  return { kind: builder.match }
}
