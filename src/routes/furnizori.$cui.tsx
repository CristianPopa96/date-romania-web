import { createFileRoute, notFound } from '@tanstack/react-router'

import {
  EntityView,
  parseCui,
  validateEntitySearch,
} from '#/components/EntityView'
import { entityQuery, purchasesQuery } from '#/lib/queries'

export const Route = createFileRoute('/furnizori/$cui')({
  validateSearch: validateEntitySearch,
  loaderDeps: ({ search }) => search,
  loader: async ({ context, params, deps }) => {
    const cui = parseCui(params.cui)
    if (cui === null) throw notFound()
    const [page] = await Promise.all([
      context.queryClient.ensureQueryData(entityQuery('suppliers', cui)),
      context.queryClient.ensureQueryData(
        purchasesQuery(
          'suppliers',
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
    meta: [{ title: `${loaderData?.name ?? 'Furnizor'} · Date România` }],
  }),
  component: Supplier,
})

function Supplier() {
  const { cui } = Route.useParams()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  return (
    <EntityView
      role="suppliers"
      cui={Number(cui)}
      search={search}
      // Paging and sorting keep the reader at the table, not back at the top.
      onSearch={(next) => void navigate({ search: next, resetScroll: false })}
    />
  )
}
