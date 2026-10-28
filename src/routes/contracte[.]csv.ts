import { createFileRoute } from '@tanstack/react-router'

import { contractsCsvQuery } from '#/features/contracts/urls'
import { getFile } from '#/lib/api'

// The contracts of one institution or one company, with the filters and the order of the
// list it was asked from, or of the whole period, as a CSV file. The site passes on what
// the API writes, so the browser never calls the API.
export const Route = createFileRoute('/contracte.csv')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const query = contractsCsvQuery(new URL(request.url).searchParams)
        if (!query) return new Response('Not found', { status: 404 })
        const cui = query.buyer ?? query.supplier
        const file = await getFile('/v1/award-contracts', {
          ...query,
          format: 'csv',
        })
        const name = cui === undefined ? 'contracte' : `contracte-${cui}`
        return new Response(file, {
          headers: {
            'content-type': 'text/csv; charset=utf-8',
            'content-disposition': `attachment; filename="${name}.csv"`,
          },
        })
      },
    },
  },
})
