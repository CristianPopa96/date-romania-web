import { createFileRoute, redirect } from '@tanstack/react-router'

import { validatePageSearch } from '#/lib/urls'

// The old address of the page: it is now under /proiecte, with its page of SEAP contracts.
export const Route = createFileRoute('/programe/pnrr/contracte/$id')({
  validateSearch: validatePageSearch,
  beforeLoad: ({ params, search }) => {
    throw redirect({
      to: '/proiecte/pnrr/$id',
      params,
      search,
      replace: true,
      statusCode: 301,
    })
  },
})
