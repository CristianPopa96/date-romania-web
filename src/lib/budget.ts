// Reading an institution's budget: the small decisions the pages share, kept out of the
// components so they can be tested.

import type { InstitutionBudget, LocalBudget } from '#/lib/api-budget'

// The revenue lines with money in them, in the order the API gives (the design's).
export function revenueRows(budget: LocalBudget) {
  return budget.revenue_lines
    .filter((row) => row.amount > 0)
    .map((row) => ({ key: row.line, value: row.amount }))
}

// The chapters with money in them, largest first, as the API gives them.
export function chapterRows(budget: LocalBudget) {
  return budget.chapters
    .filter((row) => row.amount > 0)
    .map((row) => ({ key: row.chapter, value: row.amount }))
}

// A county council is paid as such; anything else that has payments is a town hall.
export function paidAs(answer: InstitutionBudget): 'county' | 'townHall' {
  return answer.place?.kind === 'county' ? 'county' : 'townHall'
}

// Why an institution's budget is missing: it is not a town hall or a county council, or
// it is one whose budget is not held yet (a year not collected, a name not matched).
export function missingBudget(
  answer: InstitutionBudget | null,
): 'other' | 'townHall' | 'county' {
  return answer?.place ? paidAs(answer) : 'other'
}

// What the gap panel holds beside the contracts. While any of it is held, the cells
// cover different periods (the budget's year, the contracts' days, the payment files),
// so the panel names each period and draws no bars.
export function gapEnds(answer: InstitutionBudget | null) {
  const spent = answer?.budget
    ? { value: answer.budget.capital, year: answer.budget.year }
    : null
  const paid = answer?.programme_payments ?? null
  return { spent, paid, periodsDiffer: spent !== null || paid !== null }
}

export type GapEnds = ReturnType<typeof gapEnds>
