// Reading a notice and its contracts: the small decisions the pages share, kept out of
// the components so they can be tested.

import type { Contract, Notice, Winner } from '#/lib/api-contracts'

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
