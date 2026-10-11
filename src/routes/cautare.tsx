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
import { messagesFor } from '#/i18n'
import { useI18n } from '#/i18n/context'
import { rich } from '#/i18n/rich'
import { pageTitle } from '#/lib/copy'
import { searchQuery } from '#/lib/queries'

export const Route = createFileRoute('/cautare')({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search.q === 'string' ? search.q : '',
  }),
  loaderDeps: ({ search }) => ({ q: search.q }),
  loader: ({ context, deps }) =>
    context.queryClient.ensureQueryData(searchQuery(deps.q)),
  head: ({ match }) => ({
    meta: [
      { title: pageTitle(messagesFor(match.context.locale).search.title) },
    ],
  }),
  component: Search,
})

function Search() {
  const { q } = Route.useSearch()
  const { t, f } = useI18n()
  const { data: found } = useSuspenseQuery(searchQuery(q))

  return (
    <Container size="3" px="5" py="7">
      <Flex direction="column" gap="5">
        <Heading size="6">{t.search.title}</Heading>
        {/* The key resets the box when the address changes, e.g. on Back. */}
        <SearchBox key={q} initial={q} />

        {q.trim().length < 2 ? (
          <Text size="2" color="gray">
            {t.search.tooShort}
          </Text>
        ) : found.length === 0 ? (
          <Text size="2" color="gray">
            {t.search.none(q)}
          </Text>
        ) : (
          <Flex direction="column" gap="2">
            <Text size="2" color="gray">
              {t.search.found(found.length, f.count(found.length), q)}
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
                      {rich(t.common.cui, {
                        cui: (
                          <Code key="cui" variant="ghost">
                            {entity.cui}
                          </Code>
                        ),
                      })}
                    </Text>
                  </Flex>
                  <Badge color="gray">
                    {entity.kind === 'authority'
                      ? t.common.institution
                      : t.common.company}
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
