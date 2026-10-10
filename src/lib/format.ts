// Romanian formats for everything the site shows: "6.120.000 lei", "48,2 mil. lei",
// "06.10.2026".

const whole = new Intl.NumberFormat('ro-RO', { maximumFractionDigits: 0 })
const oneDecimal = new Intl.NumberFormat('ro-RO', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})
const dayFormat = new Intl.DateTimeFormat('ro-RO', {
  timeZone: 'Europe/Bucharest',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

export function count(value: number) {
  return whole.format(value)
}

export function lei(value: number) {
  return `${whole.format(value)} lei`
}

// For headline figures: "1,5 mld. lei", "48,2 mil. lei". Small amounts stay whole.
export function leiShort(value: number) {
  if (value >= 1e9) return `${oneDecimal.format(value / 1e9)} mld. lei`
  if (value >= 1e6) return `${oneDecimal.format(value / 1e6)} mil. lei`
  return lei(value)
}

// Accepts a day ("2026-10-06") or a full timestamp; the day shown is the Romanian one.
export function day(value: string) {
  const date = new Date(value.length === 10 ? `${value}T12:00:00Z` : value)
  return dayFormat.format(date)
}

export function period(first: string | null, last: string | null) {
  if (!first || !last) return null
  return first === last ? day(first) : `${day(first)} – ${day(last)}`
}
