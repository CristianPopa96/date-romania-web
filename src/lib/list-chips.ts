// The words on a chosen filter's chip that every list says the same way: a period and a
// value range.

import type { Messages } from '#/i18n'
import type { Format } from '#/lib/format'
import { periodYear } from '#/lib/list'
import type { Period } from '#/lib/list'

// "2026", or "01.03–30.06.2026", or one end: "de la 01.03.2026".
export function periodChip(
  period: Period,
  t: Messages,
  f: Format,
): string | null {
  const { from, to } = period
  if (!from && !to) return null
  const year = periodYear(period)
  if (year) return String(year)
  if (from && to) {
    const days = f.span(from, to)
    return days ? `${days.from}–${days.to}` : null
  }
  return from
    ? t.list.period.since(f.day(from))
    : t.list.period.until(f.day(to as string))
}

// "50.000–270.120 lei", "de la 100.000 lei", "sub 10.000 lei".
export function rangeChip(
  min: number | undefined,
  max: number | undefined,
  t: Messages,
  f: Format,
): string | null {
  if (min === undefined && max === undefined) return null
  if (min !== undefined && max !== undefined) {
    return t.money.lei(t.list.range.between(f.count(min), f.count(max)))
  }
  return min !== undefined
    ? t.list.range.from(f.lei(min))
    : t.list.range.under(f.lei(max as number))
}
