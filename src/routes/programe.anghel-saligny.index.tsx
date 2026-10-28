import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Container, Flex, Heading, Text } from '@radix-ui/themes'

import { Unavailable } from '#/components/Notes'
import { ProgrammeFigures } from '#/features/programme/ProgrammeFigures'
import { ProgrammeMatch } from '#/features/programme/ProgrammeMatch'
import { ProjectFinder } from '#/features/programme/ProjectFinder'
import { messagesFor } from '#/i18n'
import { useI18n } from '#/i18n/context'
import type { ProjectFilter } from '#/features/programme/api'
import { pageTitle } from '#/lib/copy'
import { MATCH_PARAMS, countyKey } from '#/features/programme/programme'
import { programmeQuery, projectsQuery } from '#/features/programme/queries'
import { validateProgrammeSearch } from '#/features/programme/urls'
import type { ProgrammeSearch } from '#/features/programme/urls'

// What the address asks of the list of projects, in the API's words.
function filterOf(search: ProgrammeSearch): ProjectFilter {
  return {
    county: search.judet ? countyKey(search.judet) : undefined,
    q: search.q,
    match: search.legatura ? MATCH_PARAMS[search.legatura] : undefined,
    builder: search.firma,
    page: search.pagina ?? 1,
  }
}

// The Anghel Saligny programme: what the ministry paid, a way to find one project, and
// how its payments were tied to SEAP contracts.
export const Route = createFileRoute('/programe/anghel-saligny/')({
  validateSearch: validateProgrammeSearch,
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) =>
    Promise.all([
      context.queryClient.ensureQueryData(programmeQuery),
      context.queryClient.ensureQueryData(projectsQuery(filterOf(deps))),
    ]),
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
  const { data: projects } = useSuspenseQuery(projectsQuery(filterOf(search)))

  return (
    <Container size="4" px="5" py="7">
      <Flex direction="column" gap="6">
        <Flex direction="column" gap="2">
          <Text size="2" color="gray">
            {p.crumb} / {p.name}
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
            <ProjectFinder
              // A new address gives the search field its words again.
              key={search.q ?? ''}
              programme={programme}
              projects={projects}
              search={search}
              // Choosing keeps the reader at the list, not back at the top.
              onSearch={(next) =>
                void navigate({ search: next, resetScroll: false })
              }
            />
            <ProgrammeMatch programme={programme} />
          </>
        )}
      </Flex>
    </Container>
  )
}
