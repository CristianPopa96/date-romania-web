import { createFileRoute } from '@tanstack/react-router'

import { getFile } from '#/lib/api'
import {
  purchaseApiSort,
  purchaseFilter,
  validatePurchaseListSearch,
} from '#/lib/purchase-list'
import { cuiFromPath } from '#/lib/urls'

// The direct purchases of one institution or one company as a CSV file, with the filters
// and the order of the list it was asked from. The site passes on what the API writes,
// so the browser never calls the API.
export const Route = createFileRoute('/achizitii-directe.csv')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const params = new URL(request.url).searchParams
        const buyer = cuiFromPath(params.get('cumparator') ?? '')
        const supplier = cuiFromPath(params.get('vanzator') ?? '')
        const cui = buyer ?? supplier
        if (cui === null) return new Response('Not found', { status: 404 })
        const role = buyer !== null ? 'institutions' : 'suppliers'
        const search = validatePurchaseListSearch(Object.fromEntries(params))
        const file = await getFile('/v1/direct-purchases', {
          ...purchaseFilter(role, cui, search),
          ...purchaseApiSort(search),
          format: 'csv',
        })
        return new Response(file, {
          headers: {
            'content-type': 'text/csv; charset=utf-8',
            'content-disposition': `attachment; filename="achizitii-directe-${cui}.csv"`,
          },
        })
      },
    },
  },
})
