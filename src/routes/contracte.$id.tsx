import { createFileRoute, notFound } from '@tanstack/react-router'

import { NoticeView } from '#/components/NoticeView'
import { messagesFor } from '#/i18n'
import { pageTitle } from '#/lib/copy'
import { noticeContractsQuery, noticeQuery } from '#/lib/queries'
import { idFromPath, validatePageSearch } from '#/lib/urls'

// One award notice, by SEAP's own id. A notice is not a contract: it holds one or many.
export const Route = createFileRoute('/contracte/$id')({
  validateSearch: validatePageSearch,
  loaderDeps: ({ search }) => search,
  loader: async ({ context, params, deps }) => {
    const id = idFromPath(params.id)
    if (id === null) throw notFound()
    const notice = await context.queryClient.ensureQueryData(noticeQuery(id))
    if (!notice) throw notFound()
    await context.queryClient.ensureQueryData(
      noticeContractsQuery(id, deps.pagina ?? 1),
    )
    return { title: notice.title }
  },
  head: ({ loaderData, match }) => ({
    meta: [
      {
        title: pageTitle(
          loaderData?.title ??
            messagesFor(match.context.locale).notice.fallbackTitle,
        ),
      },
    ],
  }),
  component: Notice,
})

function Notice() {
  const { id } = Route.useParams()
  const { pagina } = Route.useSearch()
  const navigate = Route.useNavigate()
  return (
    <NoticeView
      id={Number(id)}
      page={pagina ?? 1}
      // Paging keeps the reader at the table, not back at the top.
      onPage={(page) =>
        void navigate({
          search: { pagina: page > 1 ? page : undefined },
          resetScroll: false,
        })
      }
    />
  )
}
