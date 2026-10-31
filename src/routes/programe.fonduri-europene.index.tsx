import { useSuspenseQuery } from '@tanstack/react-query'
import {
  Link as RouterLink,
  createFileRoute,
  notFound,
  redirect,
} from '@tanstack/react-router'
import {
  Card,
  Container,
  Flex,
  Heading,
  Link,
  Table,
  Text,
} from '@radix-ui/themes'

import { DataState } from '#/components/DataState'
import { ProjectList } from '#/features/projects/ProjectList'
import { SourceLine } from '#/components/SourceLine'
import { messagesFor } from '#/i18n'
import { useI18n } from '#/i18n/context'
import type { EuFunds } from '#/features/eu-projects/api'
import { pageTitle } from '#/lib/copy'
import { pageCount } from '#/lib/list'
import { periodLabel, programmeCodes } from '#/features/eu-projects/eu'
import { euFundsQuery } from '#/features/eu-projects/queries'
import { validateProjectListSearch } from '#/features/projects/list'
import type { ProjectListSearch } from '#/features/projects/list'
import {
  projectListQuery,
  projectsOverviewQuery,
} from '#/features/projects/queries'

// The address's programmes, as slugs: 'por-2014,peo-2021'.
const SLUGS = /^[a-z]{2,10}-\d{4}(,[a-z]{2,10}-\d{4})*$/i

// The list's address, with `program` holding the slugs of cohesion programmes.
function validateFundsSearch(
  search: Record<string, unknown>,
): ProjectListSearch {
  return {
    ...validateProjectListSearch({ ...search, program: undefined }),
    program:
      typeof search.program === 'string' && SLUGS.test(search.program)
        ? search.program.toLowerCase()
        : undefined,
  }
}

// The EU cohesion programmes held, each from its own list, an overview (ScreenProgramme,
// design D22); its list is the list of every project fixed to cohesion, with its
// programmes as a filter: /programe/fonduri-europene?program=por-2014&stare=reziliat&q=drum.
export const Route = createFileRoute('/programe/fonduri-europene/')({
  validateSearch: validateFundsSearch,
  loaderDeps: ({ search }) => search,
  loader: async ({ context, deps }) => {
    const funds = await context.queryClient.ensureQueryData(euFundsQuery)
    if (!funds) throw notFound()
    // A programme not held names no code, and the list is not filtered by it.
    const codes = programmeCodes(funds.programmes, deps.program)
    const [list] = await Promise.all([
      context.queryClient.ensureQueryData(
        projectListQuery(deps, { kind: 'cohesion', codes }),
      ),
      context.queryClient.ensureQueryData(
        projectsOverviewQuery(deps, { kind: 'cohesion', codes }),
      ),
    ])
    // A page past the end of the list goes to the last one that has rows.
    if (list !== 'failed') {
      const last = pageCount(list.total, deps.pe_pagina ?? 25)
      if ((deps.pagina ?? 1) > last) {
        throw redirect({
          to: '/programe/fonduri-europene',
          search: { ...deps, pagina: last > 1 ? last : undefined },
        })
      }
    }
  },
  head: ({ match }) => ({
    meta: [{ title: pageTitle(messagesFor(match.context.locale).eu.title) }],
  }),
  component: EuFundsPage,
})

function EuFundsPage() {
  const { data: funds } = useSuspenseQuery(euFundsQuery)
  // The loader made sure it exists.
  return funds ? <EuFundsView funds={funds} /> : null
}

function EuFundsView({ funds }: { funds: EuFunds }) {
  const { t, f } = useI18n()
  const e = t.eu
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const money = (value: number | null) =>
    value === null ? <DataState kind="notPublished" /> : f.leiShort(value)

  return (
    <Container size="4" px="5" py="7">
      <Flex direction="column" gap="6">
        <Flex direction="column" gap="2">
          <Text size="2" color="gray">
            <Link asChild color="gray">
              <RouterLink to="/proiecte">{t.projects.crumb}</RouterLink>
            </Link>{' '}
            / {e.name}
          </Text>
          <Text size="1" color="gray" weight="medium">
            {e.eyebrow}
          </Text>
          <Heading size="7">{e.title}</Heading>
          <Text size="3" color="gray" style={{ maxWidth: 720 }}>
            {e.lead}
          </Text>
        </Flex>

        <Flex direction="column" gap="3">
          <Heading as="h2" size="5">
            {e.programmesTitle}
          </Heading>
          <Card size="1" style={{ padding: 0 }}>
            <Table.Root size="1">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeaderCell>{e.programme}</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>{e.period}</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell justify="end">
                    {e.projects}
                  </Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell justify="end">
                    {e.value}
                  </Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell justify="end">
                    {e.paid}
                  </Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>{e.cutOff}</Table.ColumnHeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {funds.programmes.map((programme) => (
                  <Table.Row key={programme.code}>
                    <Table.RowHeaderCell>
                      {programme.name}
                      <Text as="div" size="1" color="gray">
                        {programme.code}
                      </Text>
                    </Table.RowHeaderCell>
                    <Table.Cell>{periodLabel(programme.period)}</Table.Cell>
                    <Table.Cell justify="end">
                      {f.count(programme.projects)}
                    </Table.Cell>
                    <Table.Cell justify="end">
                      {money(programme.total)}
                    </Table.Cell>
                    <Table.Cell justify="end">
                      {money(programme.paid)}
                      {programme.paid_as === 'validated' && (
                        <Text as="div" size="1" color="gray">
                          {e.paidValidated}
                        </Text>
                      )}
                    </Table.Cell>
                    <Table.Cell>
                      {programme.cut_off ? (
                        f.day(programme.cut_off)
                      ) : (
                        <DataState kind="notPublished" />
                      )}
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Card>
          <Text size="2" color="gray">
            {e.programmesNote}
          </Text>
          <Text size="2" color="gray">
            {e.mapNote}
          </Text>
          <SourceLine source={funds.source} />
        </Flex>

        <ProjectList
          title={t.projects.listTitle}
          fixed="cohesion"
          cohesion={{
            held: funds.programmes,
            codes: programmeCodes(funds.programmes, search.program),
          }}
          search={search}
          // The address is cleaned as a link's would be, so the router never rewrites it.
          onSearch={(next) =>
            void navigate({
              search: validateFundsSearch(next),
              resetScroll: false,
            })
          }
        />
      </Flex>
    </Container>
  )
}
