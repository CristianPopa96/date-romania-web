import { createFileRoute, notFound, redirect } from '@tanstack/react-router'

import { NoticeView } from '#/features/contracts/NoticeView'
import { NOTICE_PAGE_SIZE } from '#/features/contracts/api'
import { pageCount } from '#/lib/list'
import { messagesFor } from '#/i18n'
import { pageTitle } from '#/lib/copy'
import { noticeContractsQuery, noticeQuery } from '#/features/contracts/queries'
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
    const page = deps.pagina ?? 1
    const contracts = await context.queryClient.ensureQueryData(
      noticeContractsQuery(id, page),
    )
    // A page past the end of the list goes to the last one that has rows.
    const last = pageCount(contracts.total, NOTICE_PAGE_SIZE)
    if (page > last) {
      throw redirect({
        to: '/contracte/$id',
        params,
        search: { pagina: last > 1 ? last : undefined },
      })
    }
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
