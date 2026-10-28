import { queryOptions } from '@tanstack/react-query'

import { getInstitutionBudget } from '#/features/budget/api'

export const budgetQuery = (cui: number) =>
  queryOptions({
    queryKey: ['institution-budget', cui],
    queryFn: () => getInstitutionBudget({ data: cui }),
  })
