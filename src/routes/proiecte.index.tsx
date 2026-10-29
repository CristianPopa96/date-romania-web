import {
  Link as RouterLink,
  createFileRoute,
  redirect,
} from '@tanstack/react-router'
import { Container, Flex, Heading, Link, Text } from '@radix-ui/themes'

import { ProjectList } from '#/features/projects/ProjectList'
import { validateProjectListSearch } from '#/features/projects/list'
import {
  projectListQuery,
  projectsOverviewQuery,
} from '#/features/projects/queries'
import { messagesFor } from '#/i18n'
import { useI18n } from '#/i18n/context'
import { pageTitle } from '#/lib/copy'
import { pageCount } from '#/lib/list'

// Every project of every programme, one list (ScreenProjects, design D22): the first
// section of the top bar. The programme pages are its overviews, reached from here.
export const Route = createFileRoute('/proiecte/')({
  validateSearch: validateProjectListSearch,
  loaderDeps: ({ search }) => search,
  loader: async ({ context, deps }) => {
    const [list] = await Promise.all([
      context.queryClient.ensureQueryData(projectListQuery(deps)),
      context.queryClient.ensureQueryData(projectsOverviewQuery(deps)),
    ])
    // A page past the end of the list goes to the last one that has rows.
    if (list !== 'failed') {
      const last = pageCount(list.total, deps.pe_pagina ?? 25)
      if ((deps.pagina ?? 1) > last) {
        throw redirect({
          to: '/proiecte',
          search: { ...deps, pagina: last > 1 ? last : undefined },
        })
      }
    }
  },
  head: ({ match }) => ({
    meta: [
      { title: pageTitle(messagesFor(match.context.locale).projects.title) },
    ],
  }),
  component: ProjectsPage,
})

function ProjectsPage() {
  const { t } = useI18n()
  const p = t.projects
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  return (
    <Container size="4" px="5" py="7">
      <Flex direction="column" gap="6">
        <Flex direction="column" gap="2">
          <Text size="1" color="gray" weight="medium">
            {p.eyebrow}
          </Text>
          <Heading size="7">{p.title}</Heading>
          <Text size="3" color="gray" style={{ maxWidth: '70ch' }}>
            {p.lead}
          </Text>
          <Text size="2">
            <Link asChild>
              <RouterLink to="/programe">{p.programmesLink}</RouterLink>
            </Link>
          </Text>
        </Flex>
        <ProjectList
          title={p.listAll}
          search={search}
          // Choosing keeps the reader at the list, not back at the top. The address is
          // cleaned as a link's would be, so the router never rewrites it.
          onSearch={(next) =>
            void navigate({
              search: validateProjectListSearch(next),
              resetScroll: false,
            })
          }
        />
      </Flex>
    </Container>
  )
}
