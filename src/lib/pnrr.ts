// The PNRR pages' logic: how a measure is named and addressed, how the measures group by
// component, and which case a contract's payments are in. Kept here so it can be tested.

import type { PnrrContract, PnrrMeasureRow, PnrrPayments } from '#/lib/api-pnrr'

// A measure's address: its code in lower case, '/programe/pnrr/c10.i3'. The page finds the
// measure back in the programme's list, so a sub-measure's own case ('C5.I1.a') is kept.
export function measureSlug(code: string): string {
  return code.toLowerCase()
}

export function measureBySlug<T extends { code: string }>(
  measures: ReadonlyArray<T>,
  slug: string,
): T | null {
  return (
    measures.find((each) => measureSlug(each.code) === slug.toLowerCase()) ??
    null
  )
}

// 'Investiția 3', 'Reforma 1', 'Investiția 4.a' from the measure's name, which starts with
// it ('Investiția 3. Renovarea energetică...'); else its code without the component.
export function measureShort(
  code: string,
  name: string | null | undefined,
): string {
  const found =
    /^\s*((?:Investiția|Investitia|Reforma)\s*\d+(?:\s*\.?\s*[a-z]\b)?)/i.exec(
      name ?? '',
    )
  if (found) return found[1].replace(/\s+/g, ' ').trim()
  return code.split('.').slice(1).join('.') || code
}

// 'C10 · Investiția 3'.
export function measureLabel(
  code: string,
  name: string | null | undefined,
): string {
  return `${code.split('.')[0]} · ${measureShort(code, name)}`
}

// The components in the plan's own order (C1, C2 ... C16), each with its measures.
export function byComponent(
  measures: ReadonlyArray<PnrrMeasureRow>,
): Array<{ component: string; measures: Array<PnrrMeasureRow> }> {
  const groups = new Map<string, Array<PnrrMeasureRow>>()
  for (const measure of measures) {
    const group = groups.get(measure.component) ?? []
    group.push(measure)
    groups.set(measure.component, group)
  }
  const order = (component: string) => Number(/\d+/.exec(component)?.[0] ?? 999)
  return [...groups.entries()]
    .sort(([a], [b]) => order(a) - order(b) || a.localeCompare(b))
    .map(([component, list]) => ({ component, measures: list }))
}

// What was paid of what was allocated, both in euro; null when either is missing. Nothing
// paid yet is 0 %, not a missing figure.
export function paidShare(
  paidEur: number | null | undefined,
  allocatedEur: number | null | undefined,
): number | null {
  if (paidEur == null || !allocatedEur) return null
  return paidEur / allocatedEur
}

// The payments to a contract's beneficiary on one measure tell three different things:
//   own      the contract is the beneficiary's one there, so the payments are its own
//   several  the beneficiary has several contracts there: they belong to none of them
//   none     nothing was paid to the beneficiary on the measure
export type PaymentsCase = 'own' | 'several' | 'none'

export function paymentsCase(payments: PnrrPayments): PaymentsCase {
  if (payments.contracts > 1) return 'several'
  return payments.count > 0 ? 'own' : 'none'
}

// "Plătit până acum" on the figures card: the contract's own payments, added up over its
// measures, only when every measure's are its own or none; else nothing can be said.
export function paidSoFar(
  contract: PnrrContract,
): { amount: number; count: number; lastDay: string | null } | null {
  if (contract.payments.some((each) => paymentsCase(each) === 'several'))
    return null
  const own = contract.payments.filter((each) => paymentsCase(each) === 'own')
  const days = own
    .map((each) => each.last_day)
    .filter((day): day is string => !!day)
  return {
    amount: own.reduce((sum, each) => sum + each.paid, 0),
    count: own.reduce((sum, each) => sum + each.count, 0),
    lastDay: days.length ? (days.sort().at(-1) ?? null) : null,
  }
}

// The address's county ('mures') against the dashboard's own spelling ('MUREȘ').
export function countySlug(county: string): string {
  return county
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function countyBySlug(
  counties: ReadonlyArray<string>,
  slug: string | undefined,
): string | undefined {
  if (!slug) return undefined
  return counties.find((county) => countySlug(county) === slug)
}
