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

import { AboveLimitNote, PeriodNote, Unavailable } from '#/components/Notes'
import { SearchBox } from '#/components/SearchBox'
import { SourceLine } from '#/components/SourceLine'
import { count, lei, leiShort } from '#/lib/format'
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
  const apiUp = health?.status === 'ok'
  const summary = stats?.direct_purchases

  return (
    <Container size="3" px="5" py="9">
      <Flex direction="column" gap="6">
        <Flex direction="column" gap="2">
          <Heading size="8" weight="bold">
            Date România
          </Heading>
          <Text size="3" color="gray">
            Unde merg banii publici: achiziții, contracte și plăți, cu sursa
            fiecărei cifre.
          </Text>
        </Flex>

        <SearchBox />

        {stats && summary && summary.purchases > 0 ? (
          <Flex direction="column" gap="3">
            <Heading size="4">Achiziții directe</Heading>
            <Grid columns={{ initial: '2', sm: '4' }} gap="3">
              <Figure
                label="Valoare acceptată"
                value={leiShort(summary.value)}
                detail={lei(summary.value)}
              />
              <Figure
                label="Achiziții acceptate"
                value={count(summary.accepted)}
              />
              <Figure label="Instituții" value={count(stats.institutions)} />
              <Figure label="Furnizori" value={count(stats.suppliers)} />
            </Grid>
            <PeriodNote summary={summary} />
            <AboveLimitNote summary={summary} limit={stats.limit} />
            <Flex justify="between" align="center" gap="3" wrap="wrap">
              <SourceLine source={stats.source} />
              <Link asChild size="2">
                <RouterLink to="/clasamente">
                  <Flex align="center" gap="1">
                    Vezi clasamentele
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
                Starea sistemului
              </Text>
              <Text as="div" size="2" color="gray">
                Legătura dintre site, API și baza de date
              </Text>
            </Box>
            <Badge color={apiUp ? 'green' : 'red'} size="2">
              {apiUp
                ? `API ${health.version} · bază de date ${health.database}`
                : 'API indisponibil'}
            </Badge>
          </Flex>
        </Card>
      </Flex>
    </Container>
  )
}

function Figure({
  label,
  value,
  detail,
}: {
  label: string
  value: string
  detail?: string
}) {
  return (
    <Card>
      <Flex direction="column" gap="1">
        <Text size="2" color="gray">
          {label}
        </Text>
        <Text size="5" weight="bold">
          {value}
        </Text>
        {detail ? (
          <Text size="1" color="gray">
            {detail}
          </Text>
        ) : null}
      </Flex>
    </Card>
  )
}
