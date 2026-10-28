// The list pattern (DataTable in the design system), the parts that are logic: sorting,
// the pager, the period presets, the marks of the search words. A list declares its
// filters and charts; these work for any of them.

export type SortDir = 'asc' | 'desc'
export type Sort = { column: string; dir: SortDir }
// The columns of a list that sort, by name; a text column sorts A to Z first.
export type SortColumns = Record<
  string,
  { readonly text?: boolean; readonly api?: string }
>

// A column header, clicked: descending first (largest, newest), A to Z first for text,
// then the other way, then back to the list's own order (null).
export function nextSort(
  current: Sort | null,
  column: string,
  text = false,
): Sort | null {
  const first: SortDir = text ? 'asc' : 'desc'
  if (!current || current.column !== column) return { column, dir: first }
  if (current.dir === first) return { column, dir: text ? 'desc' : 'asc' }
  return null
}

// The sort in an address: "valoare" (the column's first direction) or "valoare-cresc".
export function sortFromParam(
  value: unknown,
  columns: SortColumns,
): Sort | null {
  if (typeof value !== 'string') return null
  const [column, dir] = value.split('-') as [string, string | undefined]
  if (!(column in columns)) return null
  const first: SortDir = columns[column].text ? 'asc' : 'desc'
  if (dir === undefined) return { column, dir: first }
  if (dir === 'cresc') return { column, dir: 'asc' }
  if (dir === 'desc') return { column, dir: 'desc' }
  return null
}

export function sortToParam(
  sort: Sort | null,
  columns: SortColumns,
): string | undefined {
  if (!sort) return undefined
  const text = sort.column in columns && columns[sort.column].text
  const first: SortDir = text ? 'asc' : 'desc'
  if (sort.dir === first) return sort.column
  return `${sort.column}-${sort.dir === 'asc' ? 'cresc' : 'desc'}`
}

export const PAGE_SIZES = [25, 50, 100] as const
export type PageSize = (typeof PAGE_SIZES)[number]

export function pageSizeFromParam(value: unknown): PageSize | undefined {
  return PAGE_SIZES.find((size) => size === Number(value) && size !== 25)
}

// The page numbers a pager shows: the first, the last and two around the current one,
// a gap as null. 1 … 4 5 [6] 7 8 … 20
export function pageItems(page: number, pages: number): Array<number | null> {
  const shown = new Set([1, pages])
  for (let near = page - 2; near <= page + 2; near++) {
    if (near >= 1 && near <= pages) shown.add(near)
  }
  const sorted = [...shown].sort((a, b) => a - b)
  const items: Array<number | null> = []
  for (const number of sorted) {
    const last = items.at(-1)
    if (typeof last === 'number' && number - last > 1) items.push(null)
    items.push(number)
  }
  return items
}

// "1–25 din 46": the rows a page shows.
export function pageRange(page: number, size: number, total: number) {
  if (total === 0) return { first: 0, last: 0 }
  return {
    first: (page - 1) * size + 1,
    last: Math.min(page * size, total),
  }
}

// A day as an address keeps it.
export const DAY = /^\d{4}-\d{2}-\d{2}$/

export function dayFromParam(value: unknown): string | undefined {
  return typeof value === 'string' && DAY.test(value) ? value : undefined
}

// A whole number of at most `digits` digits, from an address (which may give it as a
// number or as text).
export function numberFromParam(
  value: unknown,
  digits = 12,
): number | undefined {
  const text = typeof value === 'number' ? String(value) : value
  if (
    typeof text !== 'string' ||
    !new RegExp(`^\\d{1,${digits}}$`).test(text)
  ) {
    return undefined
  }
  return Number(text)
}

// "7,3" in an address: the values of a choice, in the order given, each once.
export function choiceFromParam(value: unknown): Array<number> | undefined {
  const text = typeof value === 'number' ? String(value) : value
  if (typeof text !== 'string' || !/^\d{1,3}(,\d{1,3})*$/.test(text)) {
    return undefined
  }
  return [...new Set(text.split(',').map(Number))]
}

export function choiceToParam(values: Array<number>): string | undefined {
  return values.length ? values.join(',') : undefined
}

function iso(date: Date) {
  return date.toISOString().slice(0, 10)
}

function utcDay(day: string) {
  return new Date(`${day}T00:00:00Z`)
}

export function addDays(day: string, days: number) {
  const date = utcDay(day)
  date.setUTCDate(date.getUTCDate() + days)
  return iso(date)
}

// The first and last day of the month a day is in.
export function monthOf(day: string) {
  const date = utcDay(day)
  const first = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1))
  const last = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0),
  )
  return { from: iso(first), to: iso(last) }
}

export type Period = { from?: string; to?: string }
export type PeriodPreset = {
  key: 'last30' | 'lastMonth' | 'year' | 'all'
  year?: number
  period: Period
}

// The presets of a period filter, counted back from the newest day held, never from today:
// "Ultimele 30 de zile", "Luna trecută", each year held, "Tot ce avem".
export function periodPresets(
  first: string,
  last: string,
): Array<PeriodPreset> {
  const previous = monthOf(addDays(monthOf(last).from, -1))
  const presets: Array<PeriodPreset> = [
    { key: 'last30', period: { from: addDays(last, -29), to: last } },
    { key: 'lastMonth', period: previous },
  ]
  for (
    let year = Number(last.slice(0, 4));
    year >= Number(first.slice(0, 4));
    year--
  ) {
    presets.push({
      key: 'year',
      year,
      period: { from: `${year}-01-01`, to: `${year}-12-31` },
    })
  }
  presets.push({ key: 'all', period: {} })
  return presets
}

// A period that is one whole year, said as the year: "2026".
export function periodYear(period: Period): number | null {
  const { from, to } = period
  if (!from || !to || from.slice(0, 4) !== to.slice(0, 4)) return null
  const year = from.slice(0, 4)
  return from === `${year}-01-01` && to === `${year}-12-31`
    ? Number(year)
    : null
}

// The days of a chart: every month (or day) from the first point to the last, with the
// ones that have nothing as zero, so the gaps show.
export function fillSteps<TPoint extends { start: string }>(
  points: Array<TPoint>,
  step: 'month' | 'day',
  empty: (start: string) => TPoint,
): Array<TPoint> {
  if (points.length === 0) return []
  const byStart = new Map(points.map((point) => [point.start, point]))
  const filled: Array<TPoint> = []
  const last = points[points.length - 1].start
  for (let start = points[0].start; start <= last;) {
    filled.push(byStart.get(start) ?? empty(start))
    start = step === 'day' ? addDays(start, 1) : addDays(monthOf(start).to, 1)
  }
  return filled
}

// A month or day not over on the newest day held: drawn outlined, not solid.
export function isOpen(
  start: string,
  step: 'month' | 'day',
  lastHeld: string | null,
) {
  if (!lastHeld) return false
  const end = step === 'day' ? start : monthOf(start).to
  return end > lastHeld
}

// The axis of a chart: at most three ticks, round numbers from zero.
export function ticks(largest: number): Array<number> {
  if (largest <= 0) return [0]
  const rough = largest / 2
  const power = 10 ** Math.floor(Math.log10(rough))
  const step =
    [1, 2, 2.5, 5, 10].map((m) => m * power).find((s) => s >= rough) ?? rough
  return [0, step, step * 2].filter((tick) => tick <= largest * 1.0001)
}

// Text as search compares it: lower case, no diacritics.
export function plain(text: string) {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

// A text cut where the search words are found, to mark them (`dr-mark`).
export function marks(
  text: string,
  q: string | undefined,
): Array<{ text: string; mark: boolean }> {
  const words = plain(q ?? '')
    .split(/\s+/)
    .filter(Boolean)
  if (words.length === 0) return [{ text, mark: false }]
  // Composed, a Romanian letter is one code unit with or without its diacritic, so the
  // positions found in the plain text are those of the text shown.
  text = text.normalize('NFC')
  const flat = plain(text)
  const marked = new Array<boolean>(text.length).fill(false)
  for (const word of words) {
    for (
      let at = flat.indexOf(word);
      at >= 0;
      at = flat.indexOf(word, at + 1)
    ) {
      marked.fill(true, at, at + word.length)
    }
  }
  const parts: Array<{ text: string; mark: boolean }> = []
  for (let i = 0; i < text.length; i++) {
    const last = parts.at(-1)
    if (last && last.mark === marked[i]) last.text += text[i]
    else parts.push({ text: text[i], mark: marked[i] })
  }
  return parts
}
