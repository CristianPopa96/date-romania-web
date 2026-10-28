import { createFileRoute, notFound } from '@tanstack/react-router'

import { EuProjectView } from '#/components/EuProjectView'
import { messagesFor } from '#/i18n'
import { pageTitle } from '#/lib/copy'
import { euSeapQuery, euProjectQuery } from '#/lib/queries'
import { idFromPath, validatePageSearch } from '#/lib/urls'

// One EU cohesion project, by its SMIS code.
export const Route = createFileRoute(
  '/programe/fonduri-europene/proiecte/$smis',
)({
  validateSearch: validatePageSearch,
  loaderDeps: ({ search }) => ({ page: search.pagina ?? 1 }),
  loader: async ({ context, params, deps }) => {
    const smis = idFromPath(params.smis)
    if (smis === null) throw notFound()
    const project = await context.queryClient.ensureQueryData(
      euProjectQuery(smis),
    )
    if (!project) throw notFound()
    await context.queryClient.ensureQueryData(
      euSeapQuery({ kind: 'smis', id: smis, page: deps.page }),
    )
    return { title: project.title }
  },
  head: ({ loaderData, match }) => ({
    meta: [
      {
        title: pageTitle(
          loaderData?.title ??
            messagesFor(match.context.locale).eu.fallbackTitle,
        ),
      },
    ],
  }),
  component: ProjectPage,
})

function ProjectPage() {
  const { smis } = Route.useParams()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  return (
    <EuProjectView
      smis={Number(smis)}
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
