import { createFileRoute, notFound } from '@tanstack/react-router'

import { EuProjectView } from '#/components/EuProjectView'
import { messagesFor } from '#/i18n'
import { pageTitle } from '#/lib/copy'
import { euProjectQuery } from '#/lib/queries'
import { idFromPath } from '#/lib/urls'

// One EU cohesion project, by its SMIS code.
export const Route = createFileRoute(
  '/programe/fonduri-europene/proiecte/$smis',
)({
  loader: async ({ context, params }) => {
    const smis = idFromPath(params.smis)
    if (smis === null) throw notFound()
    const project = await context.queryClient.ensureQueryData(
      euProjectQuery(smis),
    )
    if (!project) throw notFound()
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
  return <EuProjectView smis={Number(smis)} />
}
