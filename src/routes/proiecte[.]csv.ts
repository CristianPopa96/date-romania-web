import { createFileRoute } from '@tanstack/react-router'

import { getFile } from '#/lib/api'
import {
  projectApiOrder,
  projectFilter,
  validateProjectListSearch,
} from '#/features/projects/list'

// Every project of the list as a CSV file, with the filters and the order of the list it
// was asked from. The site passes on what the API writes, so the browser never calls the
// API.
export const Route = createFileRoute('/proiecte.csv')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const params = new URL(request.url).searchParams
        const search = validateProjectListSearch(Object.fromEntries(params))
        const file = await getFile('/v1/projects', {
          ...projectFilter(search),
          sort: 'value',
          order: projectApiOrder(search),
          format: 'csv',
        })
        return new Response(file, {
          headers: {
            'content-type': 'text/csv; charset=utf-8',
            'content-disposition': 'attachment; filename="proiecte.csv"',
          },
        })
      },
    },
  },
})
