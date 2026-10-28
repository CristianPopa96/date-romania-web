import { useSuspenseQuery } from '@tanstack/react-query'
import {
  Link as RouterLink,
  createFileRoute,
  notFound,
} from '@tanstack/react-router'
import { ExclamationTriangleIcon } from '@radix-ui/react-icons'
import {
  Callout,
  Card,
  Container,
  Flex,
  Grid,
  Heading,
  Link,
  Text,
} from '@radix-ui/themes'

import { AmountBars } from '#/components/AmountBars'
import { EntityLink } from '#/components/EntityLink'
import { PlaceEuFunds } from '#/components/PlaceEuFunds'
import { PlaceOverview } from '#/components/PlaceOverview'
import { InstitutionsTable, ProjectsTable } from '#/components/PlaceLists'
import { WinnersCard } from '#/components/WinnersCard'
import { SourceLine } from '#/components/SourceLine'
import { messagesFor } from '#/i18n'
import { useI18n } from '#/i18n/context'
import type { Locality } from '#/lib/api-places'
import { pageTitle } from '#/lib/copy'
import {
  placeLink,
  topRevenue,
  validateLocalitySearch,
  villageOf,
} from '#/lib/places'
import { euBeneficiaryQuery, localityQuery } from '#/lib/queries'

// One UAT (flow 6, ScreenLocality): a commune, town, municipality or Bucharest sector.
// Every figure names its own period and none is added to another (design round 8).
export const Route = createFileRoute('/localitati/$judet/$uat')({
  validateSearch: validateLocalitySearch,
  loader: async ({ context, params }) => {
    const found = await context.queryClient.ensureQueryData(
      localityQuery(params.judet, params.uat),
    )
    if (!found) throw notFound()
    if (found.town_hall) {
      await context.queryClient.ensureQueryData(
        euBeneficiaryQuery(found.town_hall.cui),
      )
    }
    return { name: found.place.name }
  },
  head: ({ loaderData, match }) => ({
    meta: [
      {
        title: pageTitle(
          loaderData?.name ?? messagesFor(match.context.locale).places.title,
        ),
      },
    ],
  }),
  component: LocalityPage,
})

function LocalityPage() {
  const { t, f } = useI18n()
  const p = t.places
  const { judet, uat } = Route.useParams()
  const { sat } = Route.useSearch()
  const { data: locality } = useSuspenseQuery(localityQuery(judet, uat))
  if (!locality) return null
  const { figures, place } = locality
  const days = f.span(
    figures.contracts.period.first_day,
    figures.contracts.period.last_day,
  )
  const range = days ? t.period.range(days.from, days.to) : null
  const village = villageOf(sat, locality.localities)

  return (
    <Container size="4" px="5" py="7">
      <Flex direction="column" gap="6">
        <Flex direction="column" gap="2">
          <Text size="2" color="gray">
            <Link asChild>
              <RouterLink to="/localitati">{p.title}</RouterLink>
            </Link>{' '}
            /{' '}
            <Link asChild>
              <RouterLink to="/localitati/$judet" params={{ judet }}>
                {place.county}
              </RouterLink>
            </Link>{' '}
            / {place.name}
          </Text>
          <Text size="2" color="gray">
            {[
              p.kinds[place.kind],
              p.eyebrowCounty(place.county),
              figures.population
                ? p.peopleOn(
                    f.count(figures.population.people),
                    figures.population.on.slice(0, 4),
                  )
                : null,
            ]
              .filter(Boolean)
              .join(' · ')}
          </Text>
          <Heading size="7">{place.name}</Heading>
          {village ? (
            <Text size="3">{p.village(village, place.name)}</Text>
          ) : null}
          <Text size="3" color="gray" style={{ maxWidth: '70ch' }}>
            {p.lead}
          </Text>
          {locality.parts.length > 0 ? (
            <Flex gap="3" wrap="wrap" align="center">
              <Text size="2" color="gray">
                {p.sectors}:
              </Text>
              {locality.parts.map((part) => (
                <Link key={part.siruta} asChild size="2">
                  <RouterLink {...placeLink(part)}>{part.name}</RouterLink>
                </Link>
              ))}
            </Flex>
          ) : null}
        </Flex>

        <PlaceOverview figures={figures} sectors={locality.parts.length > 0} />

        <Grid columns={{ initial: '1', md: '2' }} gap="4">
          {locality.budget ? <BudgetCard locality={locality} /> : null}
          <WinnersCard winners={figures.top_winners} />
        </Grid>

        <Flex direction="column" gap="5">
          <ProjectsTable projects={locality.projects} />
          {locality.town_hall ? (
            <PlaceEuFunds entity={locality.town_hall} />
          ) : null}
        </Flex>

        <Flex direction="column" gap="2">
          <Heading as="h2" size="5">
            {p.payments}
          </Heading>
          <Callout.Root color="amber" variant="surface">
            <Callout.Icon>
              <ExclamationTriangleIcon />
            </Callout.Icon>
            <Callout.Text>
              <Text weight="bold">{p.paymentsTitle}</Text> {p.paymentsBody}
            </Callout.Text>
          </Callout.Root>
        </Flex>

        <InstitutionsTable
          institutions={locality.institutions}
          range={range}
          capital={
            locality.budget
              ? { amount: locality.budget.capital, year: locality.budget.year }
              : null
          }
        />
      </Flex>
    </Container>
  )
}

// The town hall's revenue, its largest lines; the whole budget is on its own page.
function BudgetCard({ locality }: { locality: Locality }) {
  const { t, f } = useI18n()
  const budget = locality.budget
  if (!budget) return null
  return (
    <Card size="2">
      <Flex direction="column" gap="3">
        <Flex justify="between" align="baseline" gap="3" wrap="wrap">
          <Heading as="h3" size="4">
            {t.places.budgetCard(String(budget.year))}
          </Heading>
          <Text size="1" color="gray">
            {t.budget.executed(f.day(budget.executed_on))}
          </Text>
        </Flex>
        <AmountBars
          rows={topRevenue(budget).map((row) => ({
            key: row.line,
            label: t.budget.lines[row.line],
            value: row.amount,
          }))}
        />
        {locality.town_hall ? (
          <EntityLink role="institutions" cui={locality.town_hall.cui}>
            {t.places.budgetMore}
          </EntityLink>
        ) : null}
        <SourceLine source={budget.source} />
      </Flex>
    </Card>
  )
}
