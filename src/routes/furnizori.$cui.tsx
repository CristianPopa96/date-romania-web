import { createFileRoute, notFound } from '@tanstack/react-router'

import { EntityView } from '#/components/EntityView'
import { messagesFor } from '#/i18n'
import { pageTitle } from '#/lib/copy'
import { loadEntityPage } from '#/lib/queries'
import { cuiFromPath, validateEntitySearch } from '#/lib/urls'

export const Route = createFileRoute('/furnizori/$cui')({
  validateSearch: validateEntitySearch,
  loaderDeps: ({ search }) => search,
  loader: async ({ context, params, deps }) => {
    const cui = cuiFromPath(params.cui)
    if (cui === null) throw notFound()
    const page = await loadEntityPage(
      context.queryClient,
      'suppliers',
      cui,
      deps,
    )
    if (!page) throw notFound()
    return { name: page.entity.name }
  },
  head: ({ loaderData, match }) => ({
    meta: [
      {
        title: pageTitle(
          loaderData?.name ?? messagesFor(match.context.locale).common.supplier,
        ),
      },
    ],
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
      // Changing list, page or order keeps the reader at the table, not back at the top.
      onSearch={(next) => void navigate({ search: next, resetScroll: false })}
    />
  )
}
