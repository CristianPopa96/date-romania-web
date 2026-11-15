import { useSuspenseQuery } from '@tanstack/react-query'
import { Link as RouterLink, createFileRoute } from '@tanstack/react-router'
import { Badge, Container, Flex, Heading, Text } from '@radix-ui/themes'

import { Unavailable } from '#/components/Notes'
import { SearchBox } from '#/components/SearchBox'
import {
  BudgetCard,
  CheckTable,
  DomainsCard,
  TraceableCard,
  nationalQuery,
} from '#/features/national'
import { useI18n } from '#/i18n/context'

// The home page (ScreenHome, design round 18): the search at the top, then the country's
// budget against what our data shows. Four blocks: the budget, the part of it we can
// follow, the official figures checked against ours, and spending by purpose.
export const Route = createFileRoute('/')({
  loader: ({ context }) => context.queryClient.ensureQueryData(nationalQuery),
  component: Home,
})

function Home() {
  const { data: national } = useSuspenseQuery(nationalQuery)
  const { t } = useI18n()

  return (
    <Container size="3" px="5" py="9">
      <Flex direction="column" gap="7">
        <Flex direction="column" gap="4">
          <Heading size="8" weight="bold">
            {t.home.headline}
          </Heading>
          <Text size="3" color="gray" style={{ maxWidth: '62ch' }}>
            {t.home.lead}
          </Text>
          <SearchBox />
          <Flex gap="2" align="center" wrap="wrap">
            <Text size="1" color="gray">
              {t.home.examples}
            </Text>
            {t.home.exampleSearches.map((example) => (
              <Badge key={example} color="gray" asChild>
                <RouterLink to="/cautare" search={{ q: example }}>
                  {example}
                </RouterLink>
              </Badge>
            ))}
          </Flex>
        </Flex>

        {national === 'failed' ? (
          <Unavailable />
        ) : (
          <>
            <BudgetCard budget={national.budget ?? null} />
            <TraceableCard budget={national.budget ?? null} />
            {national.checks.length > 0 ? (
              <CheckTable checks={national.checks} />
            ) : null}
            <DomainsCard domains={national.domains ?? null} />
          </>
        )}
      </Flex>
    </Container>
  )
}
