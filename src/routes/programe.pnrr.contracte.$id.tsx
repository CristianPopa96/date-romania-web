import { createFileRoute, notFound } from '@tanstack/react-router'

import { PnrrContractView } from '#/components/PnrrContractView'
import { messagesFor } from '#/i18n'
import { pageTitle } from '#/lib/copy'
import { euSeapQuery, pnrrContractQuery } from '#/lib/queries'
import { idFromPath, validatePageSearch } from '#/lib/urls'

// One PNRR financing contract, by MIPE's commitment id (the contract number is not unique).
// A natural person's contract has no page: the API answers "not found".
export const Route = createFileRoute('/programe/pnrr/contracte/$id')({
  validateSearch: validatePageSearch,
  loaderDeps: ({ search }) => ({ page: search.pagina ?? 1 }),
  loader: async ({ context, params, deps }) => {
    const id = idFromPath(params.id)
    if (id === null) throw notFound()
    const contract = await context.queryClient.ensureQueryData(
      pnrrContractQuery(id),
    )
    if (!contract) throw notFound()
    await context.queryClient.ensureQueryData(
      euSeapQuery({ kind: 'pnrr', id: id, page: deps.page }),
    )
    return { title: contract.title }
  },
  head: ({ loaderData, match }) => ({
    meta: [
      {
        title: pageTitle(
          loaderData?.title ??
            messagesFor(match.context.locale).pnrr.fallbackTitle,
        ),
      },
    ],
  }),
  component: ContractPage,
})

function ContractPage() {
  const { id } = Route.useParams()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  return (
    <PnrrContractView
      id={Number(id)}
      page={search.pagina ?? 1}
      onPage={(page) =>
        void navigate({
          search: { pagina: page > 1 ? page : undefined },
          resetScroll: false,
        })
      }
    />
  )
}
