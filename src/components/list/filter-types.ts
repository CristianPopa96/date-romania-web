import type { Period } from '#/lib/list'

// How a list declares one filter to the FilterBar. The list knows its address and its
// API; the bar only draws the chip and the panel, and hands back the address change the
// panel asks for (`Patch`), so several panels closed at once make one change.
export type Patch = Record<string, unknown>

type Base = {
  key: string
  label: string
  // The value on the chip once chosen ("2026", "acceptate"); null when not chosen.
  chip: string | null
  clear: Patch
}

export type ChoiceOption = { value: number; label: string; count: number }
export type LookupOption = {
  value: string
  label: string
  sub?: string
  count: number
}

export type PeriodFilter = Base & {
  kind: 'period'
  value: Period
  held: { first: string; last: string } | null
  patch: (period: Period) => Patch
}

export type RangeFilter = Base & {
  kind: 'range'
  value: { min?: number; max?: number }
  bands: Array<{ start: number; end: number | null; count: number }>
  presets: Array<{ label: string; min?: number; max?: number }>
  patch: (range: { min?: number; max?: number }) => Patch
}

export type ChoiceFilter = Base & {
  kind: 'choice'
  value: Array<number>
  options: Array<ChoiceOption>
  patch: (values: Array<number>) => Patch
}

export type LookupFilter = Base & {
  kind: 'entity' | 'code'
  value: string | undefined
  lookup: (find: string) => Promise<Array<LookupOption>>
  patch: (value: string | undefined) => Patch
}

export type FilterDecl =
  PeriodFilter | RangeFilter | ChoiceFilter | LookupFilter
