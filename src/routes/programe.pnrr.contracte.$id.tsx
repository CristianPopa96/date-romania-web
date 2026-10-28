import { createFileRoute, notFound, redirect } from '@tanstack/react-router'

import { PnrrContractView } from '#/features/pnrr/PnrrContractView'
import { messagesFor } from '#/i18n'
import { PAGE_SIZE } from '#/lib/api'
import { pageCount } from '#/lib/list'
import { pageTitle } from '#/lib/copy'
import { euSeapQuery } from '#/features/eu-projects/queries'
import { pnrrContractQuery } from '#/features/pnrr/queries'
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
    const seap = await context.queryClient.ensureQueryData(
      euSeapQuery({ kind: 'pnrr', id: id, page: deps.page }),
    )
    // A page past the end of the SEAP contracts goes to the last one that has rows.
    if (typeof seap === 'object' && seap !== null) {
      const last = pageCount(seap.contracts_total, PAGE_SIZE)
      if (deps.page > last) {
        throw redirect({
          to: '/programe/pnrr/contracte/$id',
          params,
          search: { pagina: last > 1 ? last : undefined },
        })
      }
    }
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
