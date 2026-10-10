import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Card, Container, Flex, Grid, Heading, Text } from '@radix-ui/themes'

import { BarList } from '#/components/BarList'
import { PeriodNote, Unavailable } from '#/components/Notes'
import { SourceLine } from '#/components/SourceLine'
import type { Role } from '#/lib/api'
import { pageTitle } from '#/lib/copy'
import { rankingQuery, statsQuery } from '#/lib/queries'

export const Route = createFileRoute('/clasamente')({
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(statsQuery),
      context.queryClient.ensureQueryData(rankingQuery('suppliers')),
      context.queryClient.ensureQueryData(rankingQuery('institutions')),
    ]),
  head: () => ({ meta: [{ title: pageTitle('Clasamente') }] }),
  component: Rankings,
})

function Rankings() {
  const { data: stats } = useSuspenseQuery(statsQuery)

  return (
    <Container size="4" px="5" py="7">
      <Flex direction="column" gap="5">
        <Flex direction="column" gap="2">
          <Heading size="6">Clasamente</Heading>
          <Text size="2" color="gray">
            După valoarea achizițiilor directe acceptate. Un loc în clasament
            arată doar cât s-a cumpărat sau s-a vândut, nu spune nimic despre
            corectitudinea achizițiilor.
          </Text>
          {stats ? <PeriodNote summary={stats.direct_purchases} /> : null}
        </Flex>
        <Grid columns={{ initial: '1', md: '2' }} gap="5">
          <Ranking role="suppliers" title="Furnizori" />
          <Ranking role="institutions" title="Instituții" />
        </Grid>
      </Flex>
    </Container>
  )
}

function Ranking({ role, title }: { role: Role; title: string }) {
  const { data } = useSuspenseQuery(rankingQuery(role))

  return (
    <Flex direction="column" gap="3">
      <Heading size="4">{title}</Heading>
      {data && data.items.length > 0 ? (
        <>
          <Card>
            <BarList rows={data.items} role={role} numbered />
          </Card>
          <SourceLine source={data.source} />
        </>
      ) : (
        <Unavailable />
      )}
    </Flex>
  )
}
