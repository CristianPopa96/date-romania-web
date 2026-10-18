import { useSuspenseQuery } from '@tanstack/react-query'
import { Link as RouterLink, createFileRoute } from '@tanstack/react-router'
import { Container, Flex, Heading, Link, Table, Text } from '@radix-ui/themes'

import { DataState } from '#/components/DataState'
import { messagesFor } from '#/i18n'
import { useI18n } from '#/i18n/context'
import { pageTitle } from '#/lib/copy'
import { placeLink } from '#/lib/places'
import { countiesQuery } from '#/lib/queries'

// The 42 counties, Bucharest among them, as a list: the way in to a locality until the
// county map exists (design round 8).
export const Route = createFileRoute('/localitati/')({
  loader: ({ context }) => context.queryClient.ensureQueryData(countiesQuery),
  head: ({ match }) => ({
    meta: [
      { title: pageTitle(messagesFor(match.context.locale).places.title) },
    ],
  }),
  component: Counties,
})

function Counties() {
  const { t, f } = useI18n()
  const p = t.places
  const { data } = useSuspenseQuery(countiesQuery)

  return (
    <Container size="3" px="5" py="7">
      <Flex direction="column" gap="5">
        <Flex direction="column" gap="2">
          <Heading size="7">{p.title}</Heading>
          <Text size="3" color="gray" style={{ maxWidth: '70ch' }}>
            {p.intro}
          </Text>
        </Flex>
        <Table.Root variant="surface" size="1">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>{p.county}</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell justify="end">
                {p.uats}
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell justify="end">
                {p.people}
              </Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {data.items.map((row) => (
              <Table.Row key={row.place.siruta}>
                <Table.Cell>
                  <Link asChild>
                    <RouterLink {...placeLink(row.place)}>
                      {row.place.name}
                    </RouterLink>
                  </Link>
                </Table.Cell>
                <Table.Cell justify="end">{f.count(row.uats)}</Table.Cell>
                <Table.Cell justify="end">
                  {row.population === null ? (
                    <DataState kind="notCollected" />
                  ) : (
                    f.count(row.population)
                  )}
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Flex>
    </Container>
  )
}
