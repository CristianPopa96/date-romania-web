import { createFileRoute } from '@tanstack/react-router'

import { getFile } from '#/lib/api'
import { patternCsvFilterFromSearch } from '#/features/patterns/urls'

// The purchases of the "just under the limit" pattern, one line each with its pair, as a
// CSV file. The site passes on what the API writes, so the browser never calls the API.
export const Route = createFileRoute('/tipare.csv')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const filter = patternCsvFilterFromSearch(
          new URL(request.url).searchParams,
        )
        if (!filter) return new Response('Not found', { status: 404 })
        const file = await getFile('/v1/patterns/near-limit', {
          cpv: filter.cpv,
          contract_type: filter.contract_type,
          format: 'csv',
        })
        return new Response(file, {
          headers: {
            'content-type': 'text/csv; charset=utf-8',
            'content-disposition':
              'attachment; filename="tipare-sub-plafon.csv"',
          },
        })
      },
    },
  },
})
