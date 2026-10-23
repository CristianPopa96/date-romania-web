import { createFileRoute, notFound } from '@tanstack/react-router'

import { PnrrContractView } from '#/components/PnrrContractView'
import { messagesFor } from '#/i18n'
import { pageTitle } from '#/lib/copy'
import { pnrrContractQuery } from '#/lib/queries'
import { idFromPath } from '#/lib/urls'

// One PNRR financing contract, by MIPE's commitment id (the contract number is not unique).
// A natural person's contract has no page: the API answers "not found".
export const Route = createFileRoute('/programe/pnrr/contracte/$id')({
  loader: async ({ context, params }) => {
    const id = idFromPath(params.id)
    if (id === null) throw notFound()
    const contract = await context.queryClient.ensureQueryData(
      pnrrContractQuery(id),
    )
    if (!contract) throw notFound()
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
  return <PnrrContractView id={Number(id)} />
}
