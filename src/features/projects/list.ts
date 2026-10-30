// The list of every project as its address holds it, and what it asks the API for:
// /proiecte?program=pnrr&judet=gorj&drum=firme&q=scoala. Every word is Romanian; the API's
// own names stay in the request.

import {
  PROJECT_KINDS,
  PROJECT_STATUSES,
  REACHES,
} from '#/features/projects/api'
import type { ProjectKind, ProjectStatus, Reach } from '#/features/projects/api'
import { countyCodeOfSlug } from '#/lib/counties'
import {
  numberFromParam,
  pageSizeFromParam,
  sortFromParam,
  sortToParam,
} from '#/lib/list'
import type { PageSize, Sort } from '#/lib/list'
import { cuiFromPath, pageFromParam, searchParam } from '#/lib/urls'

// The programmes as addresses name them; also the first part of a project's address.
export const KIND_PARAMS = {
  'anghel-saligny': 'anghel_saligny',
  pnrr: 'pnrr',
  'fonduri-europene': 'cohesion',
} as const satisfies Record<string, ProjectKind>
export type KindParam = keyof typeof KIND_PARAMS

const STATUS_PARAMS = {
  'in-implementare': 'in_progress',
  finalizat: 'finished',
  reziliat: 'terminated',
} as const satisfies Record<string, ProjectStatus>

const REACH_PARAMS = {
  beneficiar: 'beneficiary',
  plati: 'payments',
  achizitii: 'purchases',
  firme: 'companies',
} as const satisfies Record<string, Reach>

export type ProjectListSearch = {
  q?: string | number
  // Several values separated by commas: 'pnrr,fonduri-europene'.
  program?: string
  judet?: string
  beneficiar?: number
  // Shared with the list of direct purchases on an entity page, which writes its states
  // as numbers: each list reads only the words it knows.
  stare?: string | number
  drum?: string
  valoare_min?: number
  valoare_max?: number
  ordine?: string
  pe_pagina?: PageSize
  pagina?: number
  vedere?: 'tabel'
}

export const PROJECT_COLUMNS = { valoare: { api: 'value' } } as const

// The address's words of one kind, in the order of `all`; undefined when any word is not
// one of them, so a link with an unknown word lists everything rather than nothing.
function wordsFromParam<TValue extends string>(
  value: unknown,
  params: Record<string, TValue>,
  all: ReadonlyArray<TValue>,
): Array<TValue> | undefined {
  if (typeof value !== 'string' || !value) return undefined
  const words = value.split(',')
  if (!words.every((word) => Object.hasOwn(params, word))) return undefined
  const found = new Set(words.map((word) => params[word]))
  return all.filter((each) => found.has(each))
}

function wordsToParam<TValue extends string>(
  values: ReadonlyArray<TValue>,
  params: Record<string, TValue>,
  all: ReadonlyArray<TValue>,
): string | undefined {
  const words = Object.keys(params)
  return values.length
    ? all
        .filter((each) => values.includes(each))
        .map((each) => words.find((word) => params[word] === each))
        .join(',')
    : undefined
}

export const kindsFromParam = (value: unknown) =>
  wordsFromParam(value, KIND_PARAMS, PROJECT_KINDS)
export const kindsToParam = (values: ReadonlyArray<ProjectKind>) =>
  wordsToParam(values, KIND_PARAMS, PROJECT_KINDS)
export const statusesFromParam = (value: unknown) =>
  wordsFromParam(value, STATUS_PARAMS, PROJECT_STATUSES)
export const statusesToParam = (values: ReadonlyArray<ProjectStatus>) =>
  wordsToParam(values, STATUS_PARAMS, PROJECT_STATUSES)
export const reachesFromParam = (value: unknown) =>
  wordsFromParam(value, REACH_PARAMS, REACHES)
export const reachesToParam = (values: ReadonlyArray<Reach>) =>
  wordsToParam(values, REACH_PARAMS, REACHES)

// A programme's word in a project's address: /proiecte/fonduri-europene/326920.
export function kindParam(kind: ProjectKind): KindParam {
  return (Object.keys(KIND_PARAMS) as Array<KindParam>).find(
    (word) => KIND_PARAMS[word] === kind,
  ) as KindParam
}

export function validateProjectListSearch(
  search: Record<string, unknown>,
): ProjectListSearch {
  const q =
    typeof search.q === 'string' || typeof search.q === 'number'
      ? String(search.q).trim().slice(0, 100)
      : ''
  const kinds = kindsFromParam(search.program)
  const statuses = statusesFromParam(search.stare)
  const reaches = reachesFromParam(search.drum)
  const sort = sortFromParam(search.ordine, PROJECT_COLUMNS)
  return {
    // The API reads words of two letters or more, a SMIS code or a contract number.
    q: q.length >= 2 ? searchParam(q) : undefined,
    program: kinds && kindsToParam(kinds),
    judet:
      countyCodeOfSlug(search.judet) === undefined
        ? undefined
        : (search.judet as string),
    beneficiar:
      typeof search.beneficiar === 'string' ||
      typeof search.beneficiar === 'number'
        ? (cuiFromPath(String(search.beneficiar)) ?? undefined)
        : undefined,
    stare: statuses && statusesToParam(statuses),
    drum: reaches && reachesToParam(reaches),
    valoare_min: numberFromParam(search.valoare_min),
    valoare_max: numberFromParam(search.valoare_max),
    // The list's own order (largest first) is left out of the address.
    ordine:
      sort && !(sort.column === 'valoare' && sort.dir === 'desc')
        ? sortToParam(sort, PROJECT_COLUMNS)
        : undefined,
    pe_pagina: pageSizeFromParam(search.pe_pagina),
    pagina: pageFromParam(search.pagina),
    vedere: search.vedere === 'tabel' ? 'tabel' : undefined,
  }
}

export function projectSort(search: ProjectListSearch): Sort {
  return (
    sortFromParam(search.ordine, PROJECT_COLUMNS) ?? {
      column: 'valoare',
      dir: 'desc',
    }
  )
}

export type ProjectFilter = {
  kind?: Array<ProjectKind>
  // Programmes by the API's code: the cohesion programmes of the EU funds page.
  programme?: Array<string>
  // An entity page's: its projects as the beneficiary, or a company's, paid through too.
  company?: number
  county?: string
  beneficiary?: number
  status?: Array<ProjectStatus>
  reach?: Array<Reach>
  q?: string
  value_min?: number
  value_max?: number
}

// What a page fixes of its list, whatever its address says: a programme's page its kind
// (`kind`), the EU funds page the cohesion programmes its address names, by code
// (`codes`, since there `program` holds their slugs), an entity page its institution
// (`party.beneficiary`) or its company (`party.company`, the projects it was paid through
// too).
export type ProjectParty = { beneficiary: number } | { company: number }
export type ProjectScope = {
  kind?: ProjectKind
  codes?: Array<string>
  party?: ProjectParty
}

export function projectFilter(
  search: ProjectListSearch,
  scope: ProjectScope = {},
): ProjectFilter {
  const { kind, codes, party } = scope
  return {
    kind: kind ? [kind] : kindsFromParam(search.program),
    programme: codes,
    county: countyCodeOfSlug(search.judet),
    beneficiary:
      party && 'beneficiary' in party ? party.beneficiary : search.beneficiar,
    company: party && 'company' in party ? party.company : undefined,
    status: statusesFromParam(search.stare),
    reach: reachesFromParam(search.drum),
    q:
      search.q !== undefined && String(search.q).length >= 2
        ? String(search.q)
        : undefined,
    value_min: search.valoare_min,
    value_max: search.valoare_max,
  }
}

// The file of the list, with its filters and order: the site's own address, which the
// file's route reads as the list's (`/proiecte.csv?program=pnrr&judet=gorj`). The EU
// funds page's programmes go by code (`cod=POR,PEO`), an entity's company as `firma`.
export function projectsCsvPath(
  search: ProjectListSearch,
  scope: ProjectScope = {},
): string {
  const params = new URLSearchParams()
  const { kind, codes, party } = scope
  const kept = {
    ...search,
    program: kind ? kindsToParam([kind]) : search.program,
    cod: codes?.join(','),
    beneficiar:
      party && 'beneficiary' in party ? party.beneficiary : search.beneficiar,
    firma: party && 'company' in party ? party.company : undefined,
    pe_pagina: undefined,
    pagina: undefined,
    vedere: undefined,
  }
  for (const [key, value] of Object.entries(kept)) {
    if (value !== undefined) params.set(key, String(value))
  }
  const query = params.toString()
  return query ? `/proiecte.csv?${query}` : '/proiecte.csv'
}

// The programme codes of a file's address: 'POR,PoIDS'.
export function codesFromParam(
  value: string | null,
): Array<string> | undefined {
  if (!value || !/^[A-Za-z]{2,10}(,[A-Za-z]{2,10})*$/.test(value)) {
    return undefined
  }
  return value.split(',')
}

export function projectApiOrder(search: ProjectListSearch): 'asc' | 'desc' {
  return projectSort(search).dir
}

export const PROJECT_FILTER_PARAMS = {
  q: ['q'],
  program: ['program'],
  judet: ['judet'],
  beneficiar: ['beneficiar'],
  stare: ['stare'],
  drum: ['drum'],
  valoare: ['valoare_min', 'valoare_max'],
} as const satisfies Record<string, ReadonlyArray<keyof ProjectListSearch>>
export type ProjectFilterKey = keyof typeof PROJECT_FILTER_PARAMS

export const PROJECT_BY_API_PARAM: Record<string, ProjectFilterKey> = {
  q: 'q',
  kind: 'program',
  county: 'judet',
  beneficiary: 'beneficiar',
  status: 'stare',
  reach: 'drum',
  value_min: 'valoare',
  value_max: 'valoare',
}
