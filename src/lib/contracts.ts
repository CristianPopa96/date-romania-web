// Reading a notice and its contracts: the small decisions the pages share, kept out of
// the components so they can be tested.

import type { Source } from '#/lib/api'
import type {
  Contract,
  EntityContracts,
  Notice,
  Winner,
} from '#/lib/api-contracts'

// How many members of an association a row names before folding the rest.
export const WINNERS_SHOWN = 3

export function isAssociation(contract: Contract) {
  return contract.winners.length > 1
}

// The winners a row shows, and how many it leaves behind "+ încă N membri".
export function foldWinners(winners: Array<Winner>, open: boolean) {
  if (open || winners.length <= WINNERS_SHOWN) {
    return { shown: winners, hidden: 0 }
  }
  return {
    shown: winners.slice(0, WINNERS_SHOWN),
    hidden: winners.length - WINNERS_SHOWN,
  }
}

// What the page can say about when a notice was published.
//   'unknown'  the versions are not collected yet: we know only the copy we hold
//   'once'     SEAP lists one publication
//   'again'    published, then republished: two dates
export function publication(notice: Notice) {
  if (notice.versions === null) return 'unknown' as const
  return notice.versions > 1 ? ('again' as const) : ('once' as const)
}

// What the page can say about how a notice is financed.
//   'notCollected'  the detail is not collected yet
//   'notPublished'  the detail says nothing about financing
//   a list          SEAP's own words: financing types, then the programmes named
export function financing(notice: Notice) {
  if (notice.detail === null) return 'notCollected' as const
  const parts = [...notice.detail.financing_types, ...notice.detail.eu_funds]
  return parts.length > 0 ? parts : ('notPublished' as const)
}

// How many contracts of the period name this entity. Counts may be added (a contract is
// won alone or in an association, never both); the values of the two never are.
export function contractCount(totals: EntityContracts) {
  return totals.role === 'institutions'
    ? totals.awarded.contracts
    : totals.alone.contracts + totals.association.contracts
}

// The source of a list of contracts read from many notices: the publisher they share,
// and the last time any of them was fetched. Each row links to its own notice.
export function listSource(contracts: Array<Contract>): Source | null {
  if (contracts.length === 0) return null
  const fetched = contracts
    .map((contract) => contract.source.fetched_at)
    .filter((at) => at !== null)
    .sort()
  return {
    publisher: contracts[0].source.publisher,
    record: null,
    url: null,
    fetched_at: fetched.at(-1) ?? null,
    document_id: null,
  }
}
