import { createFileRoute, notFound } from '@tanstack/react-router'

import { PurchaseView } from '#/components/PurchaseView'
import { messagesFor } from '#/i18n'
import { pageTitle } from '#/lib/copy'
import { pairSummaryQuery, purchaseQuery } from '#/lib/queries'
import { idFromPath } from '#/lib/urls'

// One direct purchase, by SEAP's own id.
export const Route = createFileRoute('/achizitii-directe/$id')({
  loader: async ({ context, params }) => {
    const id = idFromPath(params.id)
    if (id === null) throw notFound()
    const purchase = await context.queryClient.ensureQueryData(
      purchaseQuery(id),
    )
    if (!purchase) throw notFound()
    if (purchase.buyer && purchase.supplier) {
      await context.queryClient.ensureQueryData(
        pairSummaryQuery(purchase.buyer.cui, purchase.supplier.cui),
      )
    }
    return { title: purchase.name }
  },
  head: ({ loaderData, match }) => ({
    meta: [
      {
        title: pageTitle(
          loaderData?.title ??
            messagesFor(match.context.locale).purchase.fallbackTitle,
        ),
      },
    ],
  }),
  component: Purchase,
})

function Purchase() {
  const { id } = Route.useParams()
  return <PurchaseView id={Number(id)} />
}
