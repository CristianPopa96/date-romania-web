import { createFileRoute } from '@tanstack/react-router'

import { getFile } from '#/lib/api'
import { csvFilterFromSearch } from '#/features/contracts/urls'

// The contracts of one institution or one company, or of the whole period, as a CSV
// file. The site passes on what the API writes, so the browser never calls the API.
export const Route = createFileRoute('/contracte.csv')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const filter = csvFilterFromSearch(new URL(request.url).searchParams)
        if (!filter) return new Response('Not found', { status: 404 })
        const cui = filter.buyer ?? filter.supplier
        const file = await getFile('/v1/award-contracts', {
          buyer: filter.buyer,
          supplier: filter.supplier,
          // One entity's contracts read best by date; the whole period, largest first.
          sort: cui === undefined ? 'value' : 'newest',
          cpv: filter.cpv,
          eu_funded: filter.eu === undefined ? undefined : String(filter.eu),
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
