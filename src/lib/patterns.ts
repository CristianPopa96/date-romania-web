// What the filters and the patterns show, kept out of the components so it can be tested.
import type { CpvDivision, NearLimitPattern } from '#/lib/api-patterns'

// "45 · Lucrari de constructii", SEAP's name untranslated, or the code alone when no row
// held gives the division's name.
export function cpvDivisionLabel(code: string, division?: CpvDivision) {
  return division?.name ? `${code} · ${division.name}` : code
}

// The share of its limit a purchase reaches, rounded down to a tenth of a percent: 0.981
// for 265,000 lei under 270,120. Down, so a value under the limit never reads "100 %".
export function shareOfLimit(value: number, limit: number) {
  return limit > 0 ? Math.floor((value / limit) * 1000) / 1000 : 0
}

// The limit for goods and services and the one for works, as the rule states them.
export function ruleLimits(pattern: NearLimitPattern) {
  return {
    goods: pattern.rule.limits['1'] ?? pattern.rule.limits['2'],
    works: pattern.rule.limits['3'],
  }
}
