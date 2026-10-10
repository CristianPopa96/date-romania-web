import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import {
  Badge,
  Card,
  Code,
  Container,
  Flex,
  Heading,
  Text,
} from '@radix-ui/themes'

import { EntityLink, roleOfKind } from '#/components/EntityLink'
import { SearchBox } from '#/components/SearchBox'
import { pageTitle } from '#/lib/copy'
import { searchQuery } from '#/lib/queries'

export const Route = createFileRoute('/cautare')({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search.q === 'string' ? search.q : '',
  }),
  loaderDeps: ({ search }) => ({ q: search.q }),
  loader: ({ context, deps }) =>
    context.queryClient.ensureQueryData(searchQuery(deps.q)),
  head: () => ({ meta: [{ title: pageTitle('Căutare') }] }),
  component: Search,
})

function Search() {
  const { q } = Route.useSearch()
  const { data: found } = useSuspenseQuery(searchQuery(q))

  return (
    <Container size="3" px="5" py="7">
      <Flex direction="column" gap="5">
        <Heading size="6">Căutare</Heading>
        {/* The key resets the box when the address changes, e.g. on Back. */}
        <SearchBox key={q} initial={q} />

        {q.trim().length < 2 ? (
          <Text size="2" color="gray">
            Scrie cel puțin două litere sau cifre.
          </Text>
        ) : found.length === 0 ? (
          <Text size="2" color="gray">
            Niciun rezultat pentru „{q}”. Căutăm doar printre instituțiile și
            firmele care apar în achizițiile directe preluate până acum.
          </Text>
        ) : (
          <Flex direction="column" gap="2">
            <Text size="2" color="gray">
              {found.length === 1 ? 'Un rezultat' : `${found.length} rezultate`}{' '}
              pentru „{q}”
            </Text>
            {found.map((entity) => (
              <Card key={entity.cui}>
                <Flex justify="between" align="center" gap="3">
                  <Flex direction="column" gap="1">
                    <Text size="3" weight="medium">
                      <EntityLink
                        role={roleOfKind(entity.kind)}
                        cui={entity.cui}
                      >
                        {entity.name}
                      </EntityLink>
                    </Text>
                    <Text size="1" color="gray">
                      CUI <Code variant="ghost">{entity.cui}</Code>
                    </Text>
                  </Flex>
                  <Badge color="gray">
                    {entity.kind === 'authority' ? 'Instituție' : 'Firmă'}
                  </Badge>
                </Flex>
              </Card>
            ))}
          </Flex>
        )}
      </Flex>
    </Container>
  )
}
