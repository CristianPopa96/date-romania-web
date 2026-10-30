import { validateContractListSearch } from '#/features/contracts'
import type { ContractListSearch } from '#/features/contracts'
import { validateProjectListSearch } from '#/features/projects'
import type { ProjectListSearch } from '#/features/projects'
import { validatePurchaseListSearch } from '#/features/purchases'
import type { PurchaseListSearch } from '#/features/purchases'
import { pageFromParam } from '#/lib/urls'

// Search params shared by the institution and the supplier page.
// `lista` picks one of the lists: contracts, direct purchases, and the projects of every
// programme (D22). Left out, the page opens on its contracts when it has any, else on its
// direct purchases.
export const ENTITY_LISTS = ['contracte', 'achizitii', 'proiecte'] as const

// The two lists the projects tab replaced, and the programme each opens it on.
const OLD_LISTS: Record<string, string | undefined> = {
  coeziune: 'fonduri-europene',
  pnrr: 'pnrr',
}

export type EntityList = (typeof ENTITY_LISTS)[number]

// The lists of contracts and of direct purchases add their filters, order and page size
// (`ContractListSearch`, `PurchaseListSearch`). The names they share mean the same, and a
// change of tab clears them.
export type EntitySearch = ContractListSearch &
  PurchaseListSearch &
  ProjectListSearch & {
    lista?: EntityList
    pagina?: number
  }

export function validateEntitySearch(
  search: Record<string, unknown>,
): EntitySearch {
  // An old link to the EU lists opens the projects tab with that programme chosen.
  const old =
    typeof search.lista === 'string' && Object.hasOwn(OLD_LISTS, search.lista)
      ? OLD_LISTS[search.lista]
      : undefined
  if (old) search = { ...search, lista: 'proiecte', program: old }
  return {
    lista: ENTITY_LISTS.find((list) => list === search.lista),
    pagina: pageFromParam(search.pagina),
    // A name two lists share (`stare`) keeps the value of the list that reads it: one
    // list's undefined never erases another's.
    ...defined(validateContractListSearch(search)),
    ...defined(validatePurchaseListSearch(search)),
    ...defined(validateProjectListSearch(search)),
  }
}

// The list an entity page shows. Contracts come first, but most institutions and
// companies have none signed in the period, and an empty list is a poor way in.
// The projects tab is there only when the entity has projects: an address asking for it
// otherwise opens the default.
export function entityList(
  search: EntitySearch,
  hasContracts: boolean,
  hasProjects = false,
): EntityList {
  const asked = search.lista
  if (asked && (asked !== 'proiecte' || hasProjects)) return asked
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
