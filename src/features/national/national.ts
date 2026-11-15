// Reading the national budget answer: the small decisions the home page makes, kept out
// of the components so they can be tested.

import type { Check, CheckFigure } from '#/features/national/api'
import type { Format } from '#/lib/format'

// A period as the page writes it: a whole calendar year as "2024", any other as
// "01.01–30.09.2026".
export function periodText(
  f: Format,
  start: string | null | undefined,
  end: string | null | undefined,
  span: (from: string, to: string) => string,
) {
  if (!start || !end) return null
  if (
    start.endsWith('-01-01') &&
    end.endsWith('-12-31') &&
    start.slice(0, 4) === end.slice(0, 4)
  ) {
    return start.slice(0, 4)
  }
  const ends = f.span(start, end)
  return ends ? span(ends.from, ends.to) : null
}

// The month a cumulative execution reaches: "decembrie 2024".
export function monthOf(f: Format, day: string) {
  return f.month(`${day.slice(0, 7)}-01`)
}

// What the "Diferența" cell holds. Only a comparable check has a figure there: a plan
// against its payments as a share (`over` when the payments pass the credits), any other
// as ours minus the official, with its sign and its percent of the official figure. Two
// different measures never compare; the rest do not compare yet.
export type DifferenceCell =
  | { kind: 'paid'; share: number; over: boolean }
  | { kind: 'difference'; amount: number; share: number | null }
  | { kind: 'differentMeasures' }
  | { kind: 'notYet' }

export function differenceCell(check: Check): DifferenceCell {
  if (check.state === 'different_measures') return { kind: 'differentMeasures' }
  if (check.state !== 'comparable') return { kind: 'notYet' }
  if (check.paid_share != null) {
    return { kind: 'paid', share: check.paid_share, over: check.paid_share > 1 }
  }
  if (check.difference != null) {
    return {
      kind: 'difference',
      amount: check.difference,
      share: check.difference_share ?? null,
    }
  }
  return { kind: 'notYet' }
}

// The period both sides of a check cover: the official one when they are comparable;
// when they are not, each source line names its own, and the column takes the
// official's.
export function checkPeriod(
  f: Format,
  check: Check,
  span: (from: string, to: string) => string,
) {
  return periodText(
    f,
    check.official.period_start,
    check.official.period_end,
    span,
  )
}

// Our side of a check, as it is written: an amount, a count in its own unit, or a state.
export type OursCell =
  | { kind: 'amount'; amount: number }
  | { kind: 'count'; count: number }
  | { kind: 'notCollected' }

export function oursCell(figure: CheckFigure): OursCell {
  if (!figure.collected) return { kind: 'notCollected' }
  if (figure.unit === 'contracts' && figure.count != null) {
    return { kind: 'count', count: figure.count }
  }
  if (figure.amount != null) return { kind: 'amount', amount: figure.amount }
  return { kind: 'notCollected' }
}

// The darker part of a division's bar: local government's share, from COFOG itself.
export function localWidth(share: number) {
  return `${Math.min(Math.max(share, 0), 1) * 100}%`
}
