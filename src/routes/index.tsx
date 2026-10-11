import { useSuspenseQuery } from '@tanstack/react-query'
import { Link as RouterLink, createFileRoute } from '@tanstack/react-router'
import { ArrowRightIcon } from '@radix-ui/react-icons'
import {
  Badge,
  Box,
  Card,
  Container,
  Flex,
  Grid,
  Heading,
  Link,
  Text,
} from '@radix-ui/themes'

import { Figure } from '#/components/Figure'
import { AboveLimitNote, PeriodNote, Unavailable } from '#/components/Notes'
import { SearchBox } from '#/components/SearchBox'
import { SourceLine } from '#/components/SourceLine'
import { useI18n } from '#/i18n/context'
import { SITE_NAME } from '#/lib/copy'
import { healthQuery, statsQuery } from '#/lib/queries'

export const Route = createFileRoute('/')({
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(healthQuery),
      context.queryClient.ensureQueryData(statsQuery),
    ]),
  component: Home,
})

function Home() {
  const { data: health } = useSuspenseQuery(healthQuery)
  const { data: stats } = useSuspenseQuery(statsQuery)
  const { t, f } = useI18n()
  const apiUp = health?.status === 'ok'
  const summary = stats?.direct_purchases

  return (
    <Container size="3" px="5" py="9">
      <Flex direction="column" gap="6">
        <Flex direction="column" gap="2">
          <Heading size="8" weight="bold">
            {SITE_NAME}
          </Heading>
          <Text size="3" color="gray">
            {t.site.tagline}
          </Text>
        </Flex>

        <SearchBox />

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

        <Card>
          <Flex justify="between" align="center" gap="3">
            <Box>
              <Text as="div" size="2" weight="bold">
                {t.home.systemStatus}
              </Text>
              <Text as="div" size="2" color="gray">
                {t.home.systemStatusHint}
              </Text>
            </Box>
            <Badge color={apiUp ? 'green' : 'red'} size="2">
              {apiUp
                ? t.home.apiUp(health.version, health.database)
                : t.home.apiDown}
            </Badge>
          </Flex>
        </Card>
      </Flex>
    </Container>
  )
}
