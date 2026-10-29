import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { Container, Flex, Heading, Text } from '@radix-ui/themes'

import { Unavailable } from '#/components/Notes'
import { ProgrammeFigures } from '#/features/programme/ProgrammeFigures'
import { ProgrammeMatch } from '#/features/programme/ProgrammeMatch'
import { ProjectList } from '#/features/programme/ProjectList'
import { messagesFor } from '#/i18n'
import { useI18n } from '#/i18n/context'
import { pageTitle } from '#/lib/copy'
import { pageCount } from '#/lib/list'
import { validateProjectListSearch } from '#/features/programme/list'
import {
  programmeQuery,
  projectListQuery,
  projectOverviewQuery,
} from '#/features/programme/queries'

// The Anghel Saligny programme: what the ministry paid, its projects as a list of the
// DataTable pattern, and how its payments were tied to SEAP contracts.
export const Route = createFileRoute('/programe/anghel-saligny/')({
  validateSearch: validateProjectListSearch,
  loaderDeps: ({ search }) => search,
  loader: async ({ context, deps }) => {
    const programme = await context.queryClient.ensureQueryData(programmeQuery)
    // The kinds of works the address may name come with the programme.
    const categories = programme?.categories ?? []
    const [list] = await Promise.all([
      context.queryClient.ensureQueryData(projectListQuery(deps, categories)),
      context.queryClient.ensureQueryData(
        projectOverviewQuery(deps, categories),
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
            <ProjectList
              categories={programme.categories}
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
