import { useSuspenseQuery } from '@tanstack/react-query'
import {
  Link as RouterLink,
  createFileRoute,
  redirect,
} from '@tanstack/react-router'
import { Container, Flex, Heading, Link, Text } from '@radix-ui/themes'

import { Unavailable } from '#/components/Notes'
import { ProgrammeFigures } from '#/features/programme/ProgrammeFigures'
import { ProgrammeMatch } from '#/features/programme/ProgrammeMatch'
import { ProjectList } from '#/features/projects/ProjectList'
import { messagesFor } from '#/i18n'
import { useI18n } from '#/i18n/context'
import { pageTitle } from '#/lib/copy'
import { pageCount } from '#/lib/list'
import { validateProjectListSearch } from '#/features/projects/list'
import { programmeQuery } from '#/features/programme/queries'
import {
  projectListQuery,
  projectsOverviewQuery,
} from '#/features/projects/queries'

// The Anghel Saligny programme, an overview (ScreenProgramme, design D22): what the
// ministry paid and how its payments were tied to SEAP contracts. Its list is the list of
// every project (ScreenProjects) fixed to the programme.
export const Route = createFileRoute('/programe/anghel-saligny/')({
  validateSearch: validateProjectListSearch,
  loaderDeps: ({ search }) => search,
  loader: async ({ context, deps }) => {
    const [, list] = await Promise.all([
      context.queryClient.ensureQueryData(programmeQuery),
      context.queryClient.ensureQueryData(
        projectListQuery(deps, 'anghel_saligny'),
      ),
      context.queryClient.ensureQueryData(
        projectsOverviewQuery(deps, 'anghel_saligny'),
      ),
    ])
    // A page past the end of the list goes to the last one that has rows.
    if (list !== 'failed') {
      const last = pageCount(list.total, deps.pe_pagina ?? 25)
      if ((deps.pagina ?? 1) > last) {
        throw redirect({
          to: '/programe/anghel-saligny',
          search: { ...deps, pagina: last > 1 ? last : undefined },
        })
      }
    }
  },
  head: ({ match }) => ({
    meta: [
      { title: pageTitle(messagesFor(match.context.locale).programme.title) },
    ],
  }),
  component: ProgrammePage,
})

function ProgrammePage() {
  const { t } = useI18n()
  const p = t.programme
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const { data: programme } = useSuspenseQuery(programmeQuery)

  return (
    <Container size="4" px="5" py="7">
      <Flex direction="column" gap="6">
        <Flex direction="column" gap="2">
          <Text size="2" color="gray">
            <Link asChild>
              <RouterLink to="/proiecte">{t.projects.crumb}</RouterLink>
            </Link>{' '}
            / {p.name}
          </Text>
          <Text size="1" color="gray" weight="medium">
            {p.eyebrow}
          </Text>
          <Heading size="7">{p.title}</Heading>
          <Text size="3" color="gray" style={{ maxWidth: '70ch' }}>
            {p.lead}
          </Text>
        </Flex>

        {!programme || programme.payments === 0 ? (
          <Unavailable />
        ) : (
          <>
            <ProgrammeFigures programme={programme} />
            <ProjectList
              title={t.projects.listTitle}
              fixed="anghel_saligny"
              search={search}
              // Choosing keeps the reader at the list, not back at the top. The address
              // is cleaned as a link's would be, so the router never rewrites it.
              onSearch={(next) =>
                void navigate({
                  search: validateProjectListSearch(next),
                  resetScroll: false,
                })
              }
            />
            <ProgrammeMatch programme={programme} />
          </>
        )}
      </Flex>
    </Container>
  )
}
