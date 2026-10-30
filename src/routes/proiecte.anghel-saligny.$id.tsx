import { createFileRoute, notFound } from '@tanstack/react-router'

import { ProjectView } from '#/features/programme/ProjectView'
import { messagesFor } from '#/i18n'
import { pageTitle } from '#/lib/copy'
import { programmeQuery, projectQuery } from '#/features/programme/queries'
import { idFromPath } from '#/lib/urls'

// One Anghel Saligny project, by the ministry's own id for it (ScreenProject).
export const Route = createFileRoute('/proiecte/anghel-saligny/$id')({
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
