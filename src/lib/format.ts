// Numbers, amounts and dates in the format of one language. In Romanian: "6.120.000 lei",
// "48,2 mil. lei", "06.10.2026".

import { LOCALES, messagesFor } from '#/i18n'
import type { Locale } from '#/i18n'

export type Format = ReturnType<typeof build>

const formats = new Map<Locale, Format>()

export function formatFor(locale: Locale): Format {
  let format = formats.get(locale)
  if (!format) {
    format = build(locale)
    formats.set(locale, format)
  }
  return format
}

function build(locale: Locale) {
  const { tag } = LOCALES[locale]
  const { money } = messagesFor(locale)
  const whole = new Intl.NumberFormat(tag, { maximumFractionDigits: 0 })
  const oneDecimal = new Intl.NumberFormat(tag, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })
  // Days are Romanian days in every language: the data is Romanian.
  const dayFormat = new Intl.DateTimeFormat(tag, {
    timeZone: 'Europe/Bucharest',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

  function count(value: number) {
    return whole.format(value)
  }

  const shares = [0, 1, 2].map(
    (digits) =>
      new Intl.NumberFormat(tag, {
        style: 'percent',
        maximumFractionDigits: digits,
      }),
  )

  // A share as a percentage: 0.913 is "91 %", and with two digits 0.8334 is "83,34 %".
  function percent(value: number, digits: 0 | 1 | 2 = 0) {
    return shares[digits].format(value)
  }

  function lei(value: number) {
    return money.lei(whole.format(value))
  }

  // For headline figures: "1,5 mld. lei", "48,2 mil. lei". Small amounts stay whole.
  function leiShort(value: number) {
    if (value >= 1e9) return money.billion(oneDecimal.format(value / 1e9))
    if (value >= 1e6) return money.million(oneDecimal.format(value / 1e6))
    return lei(value)
  }

  // Accepts a day ("2026-10-06") or a full timestamp; the day shown is the Romanian one.
  function day(value: string) {
    return dayFormat.format(instant(value))
  }

  const dayOfYearFormat = new Intl.DateTimeFormat(tag, {
    timeZone: 'Europe/Bucharest',
    day: '2-digit',
    month: '2-digit',
  })

  function instant(value: string) {
    return new Date(value.length === 10 ? `${value}T12:00:00Z` : value)
  }

  // The two ends of a period, for "01.09–10.10.2026" and "între 01.09 și 10.10.2026":
  // the first day drops its year when it is the year of the last.
  function span(first: string | null, last: string | null) {
    if (!first || !last) return null
    const sameYear = first.slice(0, 4) === last.slice(0, 4)
    return {
      from: sameYear ? dayOfYearFormat.format(instant(first)) : day(first),
      to: day(last),
    }
  }

  const listFormat = new Intl.ListFormat(tag, { type: 'conjunction' })

  // "un contract obișnuit, un acord-cadru și un contract subsecvent"
  function list(parts: Array<string>) {
    return listFormat.format(parts)
  }

  function period(first: string | null, last: string | null) {
    if (!first || !last) return null
    return first === last ? day(first) : `${day(first)} – ${day(last)}`
  }

  return { count, percent, lei, leiShort, day, period, span, list }
}
