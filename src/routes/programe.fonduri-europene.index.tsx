import { useSuspenseQuery } from '@tanstack/react-query'
import {
  Link as RouterLink,
  createFileRoute,
  notFound,
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
import { EuProjectFinder } from '#/components/EuProjectFinder'
import { SourceLine } from '#/components/SourceLine'
import { messagesFor } from '#/i18n'
import { useI18n } from '#/i18n/context'
import type { EuFunds, EuProjectFilter } from '#/lib/api-eu'
import { pageTitle } from '#/lib/copy'
import { periodLabel, programmeBySlug } from '#/lib/eu'
import { euFundsQuery, euProjectsQuery } from '#/lib/queries'
import { euStatusOfParam, validateEuSearch } from '#/lib/urls-programmes'
import type { EuSearch } from '#/lib/urls-programmes'

// What the address asks of the list of projects, in the API's words. A programme not
// held is dropped rather than listing everything under a link that looks filtered.
function filterOf(funds: EuFunds, search: EuSearch): EuProjectFilter {
  return {
    programme: programmeBySlug(funds.programmes, search.program)?.code,
    status: euStatusOfParam(search.stare),
    q: search.q,
    page: search.pagina ?? 1,
  }
}

// The EU cohesion programmes held, each from its own list, and their projects.
export const Route = createFileRoute('/programe/fonduri-europene/')({
  validateSearch: validateEuSearch,
  loaderDeps: ({ search }) => search,
  loader: async ({ context, deps }) => {
    const funds = await context.queryClient.ensureQueryData(euFundsQuery)
    if (!funds) throw notFound()
    await context.queryClient.ensureQueryData(
      euProjectsQuery(filterOf(funds, deps)),
    )
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
  const { data: projects } = useSuspenseQuery(
    euProjectsQuery(filterOf(funds, search)),
  )
  const money = (value: number | null) =>
    value === null ? <DataState kind="notPublished" /> : f.leiShort(value)

  return (
    <Container size="4" px="5" py="7">
      <Flex direction="column" gap="6">
        <Flex direction="column" gap="2">
          <Text size="2" color="gray">
            <Link asChild color="gray">
              <RouterLink to="/programe">{e.crumb}</RouterLink>
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
          <Flex align="center" gap="2" wrap="wrap">
            <Text size="2" color="gray">
              {e.notCollectedRegional}
            </Text>
            <DataState kind="notCollected" />
          </Flex>
          <SourceLine source={funds.source} />
        </Flex>

        <EuProjectFinder
          key={search.q ?? ''}
          programmes={funds.programmes}
          projects={projects}
          search={search}
          onSearch={(next) =>
            void navigate({ search: next, resetScroll: false })
          }
        />
      </Flex>
    </Container>
  )
}
