import { createFileRoute } from '@tanstack/react-router'

import { getFile } from '#/lib/api'
import {
  purchaseApiSort,
  purchaseFilter,
  validatePurchaseListSearch,
} from '#/features/purchases/list'
import { cuiFromPath } from '#/lib/urls'

// The direct purchases of one institution or one company as a CSV file, with the filters
// and the order of the list it was asked from; or every accepted purchase under the
// filters of Clasamente (?toate=da&judet=gorj), the largest first. The site passes on what
// the API writes, so the browser never calls the API.
export const Route = createFileRoute('/achizitii-directe.csv')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const params = new URL(request.url).searchParams
        const every = params.get('toate') === 'da'
        const buyer = cuiFromPath(params.get('cumparator') ?? '')
        const supplier = cuiFromPath(params.get('vanzator') ?? '')
        const cui = every ? null : (buyer ?? supplier)
        if (!every && cui === null) {
          return new Response('Not found', { status: 404 })
        }
        const role = buyer !== null ? 'institutions' : 'suppliers'
        const search = validatePurchaseListSearch(
          Object.fromEntries(params),
          every,
        )
        const file = await getFile('/v1/direct-purchases', {
          ...purchaseFilter(role, cui, search),
          ...purchaseApiSort(search, every),
          format: 'csv',
        })
        const name = every ? 'achizitii-directe' : `achizitii-directe-${cui}`
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
