import { createFileRoute, redirect } from '@tanstack/react-router'

import { validatePageSearch } from '#/lib/urls'

// The old address of the page: it is now under /proiecte, with its page of SEAP contracts.
export const Route = createFileRoute(
  '/programe/fonduri-europene/proiecte/$smis',
)({
  validateSearch: validatePageSearch,
  beforeLoad: ({ params, search }) => {
    throw redirect({
      to: '/proiecte/fonduri-europene/$smis',
      params,
      search,
      replace: true,
      statusCode: 301,
    })
  },
})
