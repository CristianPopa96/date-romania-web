import { createFileRoute, notFound } from '@tanstack/react-router'

import { ProjectView } from '#/components/ProjectView'
import { messagesFor } from '#/i18n'
import { pageTitle } from '#/lib/copy'
import { programmeQuery, projectQuery } from '#/lib/queries'
import { idFromPath } from '#/lib/urls'

// One project of the programme, by the ministry's own id for it.
export const Route = createFileRoute('/programe/anghel-saligny/proiecte/$id')({
  loader: async ({ context, params }) => {
    const id = idFromPath(params.id)
    if (id === null) throw notFound()
    const [project] = await Promise.all([
      context.queryClient.ensureQueryData(projectQuery(id)),
      // The period whose contracts were searched is the programme's.
      context.queryClient.ensureQueryData(programmeQuery),
    ])
    if (!project) throw notFound()
    return { title: project.investment }
  },
  head: ({ loaderData, match }) => ({
    meta: [
      {
        title: pageTitle(
          loaderData?.title ??
            messagesFor(match.context.locale).programme.fallbackTitle,
        ),
      },
    ],
  }),
  component: ProjectPage,
})

function ProjectPage() {
  const { id } = Route.useParams()
  return <ProjectView id={Number(id)} />
}
