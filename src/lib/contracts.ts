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

// The amount a contract row shows. SEAP gives some contracts no value in lei, only the
// value the contract states; that one is published, so it is shown, in its own currency.
//   null                       no value published at all
//   { currency: null }         lei
//   { currency: 'EUR' }        another currency, with no lei value from SEAP
export function shownValue(contract: Contract) {
  if (contract.value !== null) {
    return { amount: contract.value, currency: null }
  }
  if (contract.original_value === null || contract.currency === null) {
    return null
  }
  return {
    amount: contract.original_value,
    currency: contract.currency === 'RON' ? null : contract.currency,
  }
}

// How many pages a list of `total` rows has; a list with no rows still has one.
export function pageCount(total: number, size: number) {
  return Math.max(Math.ceil(total / size), 1)
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
    documents: new Set(contracts.map((contract) => contract.source.document_id))
      .size,
  }
}
