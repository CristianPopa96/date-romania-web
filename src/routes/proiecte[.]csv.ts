import { createFileRoute } from '@tanstack/react-router'

import { getFile } from '#/lib/api'
import { cuiFromPath } from '#/lib/urls'
import {
  codesFromParam,
  projectApiOrder,
  projectFilter,
  validateProjectListSearch,
} from '#/features/projects/list'

// A company's CUI in a file's address (`firma`), for the list of an entity page.
function companyFromParam(value: string | null) {
  const cui = value === null ? null : cuiFromPath(value)
  return cui === null ? undefined : { company: cui }
}

// A place page's UAT in a file's address (`loc`), by its SIRUTA code.
function placeFromParam(value: string | null) {
  return value !== null && /^\d{1,6}$/.test(value)
    ? { place: Number(value) }
    : undefined
}

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
          ...projectFilter(search, {
            codes: codesFromParam(params.get('cod')),
            party: companyFromParam(params.get('firma')),
            area: placeFromParam(params.get('loc')),
          }),
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
