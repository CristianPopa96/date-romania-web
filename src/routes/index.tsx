import { useSuspenseQuery } from '@tanstack/react-query'
import { Link as RouterLink, createFileRoute } from '@tanstack/react-router'
import { ArrowRightIcon } from '@radix-ui/react-icons'
import {
  Badge,
  Container,
  Flex,
  Grid,
  Heading,
  Link,
  Text,
} from '@radix-ui/themes'

import { DatasetTable } from '#/components/DatasetTable'
import { Figure } from '#/components/Figure'
import { AboveLimitNote, PeriodNote, Unavailable } from '#/components/Notes'
import { SearchBox } from '#/components/SearchBox'
import { SourceLine } from '#/components/SourceLine'
import { useI18n } from '#/i18n/context'
import { datasetsQuery, statsQuery } from '#/lib/queries'

export const Route = createFileRoute('/')({
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(statsQuery),
      context.queryClient.ensureQueryData(datasetsQuery),
    ]),
  component: Home,
})

function Home() {
  const { data: stats } = useSuspenseQuery(statsQuery)
  const { data: datasets } = useSuspenseQuery(datasetsQuery)
  const { t, f } = useI18n()
  const summary = stats?.direct_purchases

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

        {stats && summary && summary.purchases > 0 ? (
          <Flex direction="column" gap="3">
            <Heading size="4">{t.home.directPurchases}</Heading>
            <Grid columns={{ initial: '2', sm: '4' }} gap="3">
              <Figure
                size="5"
                label={t.home.acceptedValue}
                value={f.leiShort(summary.value)}
                detail={f.lei(summary.value)}
              />
              <Figure
                size="5"
                label={t.home.acceptedPurchases}
                value={f.count(summary.accepted)}
              />
              <Figure
                size="5"
                label={t.home.institutions}
                value={f.count(stats.institutions)}
              />
              <Figure
                size="5"
                label={t.home.suppliers}
                value={f.count(stats.suppliers)}
              />
            </Grid>
            <PeriodNote summary={summary} />
            <AboveLimitNote summary={summary} />
            <Flex justify="between" align="center" gap="3" wrap="wrap">
              <SourceLine source={stats.source} />
              <Link asChild size="2">
                <RouterLink to="/clasamente">
                  <Flex align="center" gap="1">
                    {t.home.seeRankings}
                    <ArrowRightIcon />
                  </Flex>
                </RouterLink>
              </Link>
            </Flex>
          </Flex>
        ) : (
          <Unavailable />
        )}

        <DatasetTable datasets={datasets} />
      </Flex>
    </Container>
  )
}
