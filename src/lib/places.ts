// Reading the locality and county pages: the small decisions they share, kept out of the
// components so they can be tested.

import type { LocalBudget } from '#/lib/api-budget'
import type { PlaceFigures, PlaceRef } from '#/lib/api-places'

// The address of a county or a UAT: /localitati/alba, /localitati/alba/comuna-albac.
export function placeLink(place: PlaceRef) {
  if (place.kind === 'county') {
    return { to: '/localitati/$judet' as const, params: { judet: place.slug } }
  }
  return {
    to: '/localitati/$judet/$uat' as const,
    params: { judet: place.county_slug, uat: place.slug },
  }
}

// What share of the contract value went to suppliers in the county, and to associations
// with members in and out of it. Null with no contract: a share of nothing is not 0 %.
export function countyShares(figures: PlaceFigures) {
  const { value } = figures.contracts
  if (value <= 0) return null
  const { local, mixed } = figures.supplier_counties
  return { local: local / value, mixed: mixed / value }
}

// The largest revenue lines of a town hall's budget, for its card on the locality page;
// the institution page shows them all.
export function topRevenue(budget: LocalBudget, shown = 4) {
  return [...budget.revenue_lines]
    .filter((row) => row.amount > 0)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, shown)
}

// A locality page can be reached from a village: /localitati/alba/comuna-albac?sat=Bărăști
// says which village the reader searched for.
export type LocalitySearch = { sat?: string }

export function validateLocalitySearch(
  search: Record<string, unknown>,
): LocalitySearch {
  const sat =
    typeof search.sat === 'string' ? search.sat.trim().slice(0, 80) : ''
  return { sat: sat.length >= 2 ? sat : undefined }
}
