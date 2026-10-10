import { createFileRoute, notFound } from '@tanstack/react-router'

import { EntityView } from '#/components/EntityView'
import { entityQuery, purchasesQuery } from '#/lib/queries'
import { cuiFromPath, validateEntitySearch } from '#/lib/urls'

export const Route = createFileRoute('/institutii/$cui')({
  validateSearch: validateEntitySearch,
  loaderDeps: ({ search }) => search,
  loader: async ({ context, params, deps }) => {
    const cui = cuiFromPath(params.cui)
    if (cui === null) throw notFound()
    const [page] = await Promise.all([
      context.queryClient.ensureQueryData(entityQuery('institutions', cui)),
      context.queryClient.ensureQueryData(
        purchasesQuery(
          'institutions',
          cui,
          deps.pagina ?? 1,
          deps.ordine === 'valoare',
        ),
      ),
    ])
    if (!page) throw notFound()
    return { name: page.entity.name }
  },
  head: ({ loaderData }) => ({
    meta: [{ title: `${loaderData?.name ?? 'Instituție'} · Date România` }],
  }),
  component: Institution,
})

function Institution() {
  const { cui } = Route.useParams()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  return (
    <EntityView
      role="institutions"
      cui={Number(cui)}
      search={search}
      // Paging and sorting keep the reader at the table, not back at the top.
      onSearch={(next) => void navigate({ search: next, resetScroll: false })}
    />
  )
}
