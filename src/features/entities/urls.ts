import { validateContractListSearch } from '#/features/contracts'
import type { ContractListSearch } from '#/features/contracts'
import { validateEuProjectListSearch } from '#/features/eu-projects'
import type { EuProjectListSearch } from '#/features/eu-projects'
import { validatePurchaseListSearch } from '#/features/purchases'
import type { PurchaseListSearch } from '#/features/purchases'
import { pageFromParam } from '#/lib/urls'

// Search params shared by the institution and the supplier page.
// `lista` picks one of the lists: contracts, direct purchases, and the EU projects and
// PNRR contracts it is the beneficiary of. Left out, the page opens on its contracts when
// it has any, else on its direct purchases.
export const ENTITY_LISTS = [
  'contracte',
  'achizitii',
  'coeziune',
  'pnrr',
] as const

export type EntityList = (typeof ENTITY_LISTS)[number]

// The lists of contracts and of direct purchases add their filters, order and page size
// (`ContractListSearch`, `PurchaseListSearch`). The names they share mean the same, and a
// change of tab clears them.
export type EntitySearch = ContractListSearch &
  PurchaseListSearch &
  EuProjectListSearch & {
    lista?: EntityList
    pagina?: number
  }

export function validateEntitySearch(
  search: Record<string, unknown>,
): EntitySearch {
  return {
    lista: ENTITY_LISTS.find((list) => list === search.lista),
    pagina: pageFromParam(search.pagina),
    // A name two lists share (`stare`) keeps the value of the list that reads it: one
    // list's undefined never erases another's.
    ...defined(validateContractListSearch(search)),
    ...defined(validatePurchaseListSearch(search)),
    ...defined(validateEuProjectListSearch(search)),
  }
}

// The list an entity page shows. Contracts come first, but most institutions and
// companies have none signed in the period, and an empty list is a poor way in.
// The EU lists an entity has: an address asking for one it has not opens the default.
export type EuLists = { coeziune: boolean; pnrr: boolean }

export function entityList(
  search: EntitySearch,
  hasContracts: boolean,
  eu: EuLists = { coeziune: false, pnrr: false },
): EntityList {
  const asked = search.lista
  if (asked && (asked === 'contracte' || asked === 'achizitii' || eu[asked])) {
    return asked
  }
  return hasContracts ? 'contracte' : 'achizitii'
}

// The address of a list on an entity page; the list shown by default is left out.
export function entityListSearch(
  list: EntityList,
  hasContracts: boolean,
): EntitySearch {
  return { lista: list === entityList({}, hasContracts) ? undefined : list }
}

function defined<T extends Record<string, unknown>>(search: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(search).filter(([, value]) => value !== undefined),
  ) as Partial<T>
}
