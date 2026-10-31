// The road of the data (the "Drumul datelor" tab): which public sources feed which tables,
// which rules tie them, and which pages show them. A lane is one family of sources; the
// tab lights up a lane's path through the five steps. Kept here so it can be tested.

import type { DataRoad, Dataset } from '#/features/sources/api'

export type Lane = 'seap' | 'anghelSaligny' | 'pnrr' | 'eu' | 'register'
export const LANES: ReadonlyArray<Lane> = [
  'seap',
  'anghelSaligny',
  'pnrr',
  'eu',
  'register',
]

// The pages of the site, by what they show.
export type Page = 'projects' | 'rankings' | 'entities' | 'places' | 'records'
export const PAGES: ReadonlyArray<Page> = [
  'projects',
  'rankings',
  'entities',
  'places',
  'records',
]

type Path = {
  sources: ReadonlyArray<string>
  tables: ReadonlyArray<string>
  rules: ReadonlyArray<string>
  pages: ReadonlyArray<Page>
}

// Each lane's path, by the API's names: dataset keys, tables, link rules.
const PATHS: Record<Lane, Path> = {
  seap: {
    sources: ['seap-direct', 'seap-awards'],
    tables: [
      'direct_purchase',
      'direct_purchase_detail',
      'award_notice',
      'award_contract',
    ],
    rules: ['eu-seap', 'entity-place'],
    pages: ['rankings', 'entities', 'records', 'projects'],
  },
  anghelSaligny: {
    sources: ['pnias-payments', 'seap-exports'],
    tables: ['pnias_payment', 'export_contract'],
    rules: ['anghel-saligny-contract'],
    pages: ['projects', 'places'],
  },
  pnrr: {
    sources: ['pnrr'],
    tables: ['pnrr_contract', 'pnrr_payment'],
    rules: ['pnrr-payment-contract', 'eu-seap'],
    pages: ['projects', 'entities'],
  },
  eu: {
    sources: ['eu-projects', 'eu-map'],
    tables: ['eu_project', 'eu_project_payment'],
    rules: ['eu-beneficiary', 'eu-seap'],
    pages: ['projects', 'entities', 'places'],
  },
  register: {
    sources: ['siruta', 'public-entities', 'local-budgets', 'anaf', 'onrc'],
    tables: [
      'place',
      'public_entity',
      'local_budget',
      'anaf_record',
      'register_company',
    ],
    rules: ['entity-place', 'eu-beneficiary', 'anghel-saligny-contract'],
    pages: ['entities', 'places'],
  },
}

// Whether a step's item is on the lane chosen; every item is when none is.
export function onLane(
  lane: Lane | null,
  kind: 'sources' | 'tables' | 'rules' | 'pages',
  key: string,
): boolean {
  return (
    lane === null || (PATHS[lane][kind] as ReadonlyArray<string>).includes(key)
  )
}

// The sources held, in the order of the lanes: a source no lane names comes last.
export function laneSources(datasets: ReadonlyArray<Dataset>): Array<Dataset> {
  const order = LANES.flatMap((lane) => PATHS[lane].sources)
  const rank = (key: string) => {
    const at = order.indexOf(key)
    return at === -1 ? order.length : at
  }
  return [...datasets].sort((a, b) => rank(a.key) - rank(b.key))
}

export type Confidence = 'sure' | 'probable' | 'possible'

// One rule's links, as many as each confidence has, and the facts it records (a
// payment's contract, an entity's place) where it states no confidence.
export type RuleCount = {
  rule: string
  byConfidence: Partial<Record<Confidence, number>>
  facts: number
  methods: Array<{ method: string; confidence: string | null; count: number }>
}

export function ruleCounts(links: DataRoad['links']): Array<RuleCount> {
  const rules = new Map<string, RuleCount>()
  for (const link of links) {
    const found = rules.get(link.rule) ?? {
      rule: link.rule,
      byConfidence: {},
      facts: 0,
      methods: [],
    }
    found.methods.push({
      method: link.method,
      confidence: link.confidence,
      count: link.count,
    })
    const level = link.confidence as Confidence | null
    if (level === 'sure' || level === 'probable' || level === 'possible') {
      found.byConfidence[level] = (found.byConfidence[level] ?? 0) + link.count
    } else {
      found.facts += link.count
    }
    rules.set(link.rule, found)
  }
  return [...rules.values()]
}

// Bytes as gigabytes, to one decimal: "8,1 GB".
export function gigabytes(bytes: number): number {
  return Math.round(bytes / 1e8) / 10
}
