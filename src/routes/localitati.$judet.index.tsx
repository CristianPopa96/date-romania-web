import { useSuspenseQuery } from '@tanstack/react-query'
import {
  Link as RouterLink,
  createFileRoute,
  notFound,
} from '@tanstack/react-router'
import { Container, Flex, Grid, Heading, Link, Text } from '@radix-ui/themes'

import { EntityLink } from '#/components/EntityLink'
import { PlaceOverview } from '#/features/places/PlaceOverview'
import { PlaceProjects } from '#/features/places/PlaceProjects'
import {
  projectListQuery,
  projectsOverviewQuery,
  validateProjectListSearch,
} from '#/features/projects'
import { countyCodeOfSlug } from '#/lib/counties'
import { UatsTable } from '#/features/places/PlaceLists'
import { WinnersCard } from '#/features/places/WinnersCard'
import { messagesFor } from '#/i18n'
import { useI18n } from '#/i18n/context'
import { pageTitle } from '#/lib/copy'
import { countyQuery } from '#/features/places/queries'

// A county (flow 6): the figures of its UATs and its council, each with its period, and
// a table of its UATs to go on to (design round 8).
export const Route = createFileRoute('/localitati/$judet/')({
  // The list of projects landing in the county: its county is the page's.
  validateSearch: (search: Record<string, unknown>) => {
    const { judet: _county, ...projects } = validateProjectListSearch(search)
    return projects
  },
  loaderDeps: ({ search }) => search,
  loader: async ({ context, params, deps }) => {
    const county = await context.queryClient.ensureQueryData(
      countyQuery(params.judet),
    )
    if (!county) throw notFound()
    const scope = { area: areaOf(params.judet) }
    await Promise.all([
      context.queryClient.ensureQueryData(projectListQuery(deps, scope)),
      context.queryClient.ensureQueryData(projectsOverviewQuery(deps, scope)),
    ])
    return { name: county.place.name }
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
  component: CountyPage,
})

// The projects of a county are those its programme names it for (`/v1/projects?county=`).
function areaOf(judet: string) {
  return { county: countyCodeOfSlug(judet) ?? '' }
}

function CountyPage() {
  const { t, f } = useI18n()
  const p = t.places
  const { judet } = Route.useParams()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const { data: county } = useSuspenseQuery(countyQuery(judet))
  if (!county) return null
  const { figures } = county
  const days = f.span(
    figures.contracts.period.first_day,
    figures.contracts.period.last_day,
  )

  return (
    <Container size="4" px="5" py="7">
      <Flex direction="column" gap="6">
        <Flex direction="column" gap="2">
          <Text size="2" color="gray">
            <Link asChild>
              <RouterLink to="/localitati">{p.title}</RouterLink>
            </Link>{' '}
            / {county.place.name}
          </Text>
          <Text size="2" color="gray">
            {[
              p.kinds.county,
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
          <Heading size="7">{county.place.name}</Heading>
          {county.council ? (
            <Text size="2">
              {p.council}:{' '}
              <EntityLink role="institutions" cui={county.council.cui}>
                {county.council.name}
              </EntityLink>
            </Text>
          ) : null}
          <Text size="3" color="gray" style={{ maxWidth: '70ch' }}>
            {p.leadCounty}
          </Text>
        </Flex>

        <PlaceOverview figures={figures} county />

        <Grid columns={{ initial: '1', md: '2' }} gap="4">
          <WinnersCard winners={figures.top_winners} />
        </Grid>

        <PlaceProjects
          area={areaOf(judet)}
          own={county.council}
          search={search}
          onSearch={(next) =>
            void navigate({ search: next, resetScroll: false })
          }
        />

        <UatsTable
          uats={county.uats}
          range={days ? t.period.range(days.from, days.to) : null}
          year={county.capital_year}
        />
      </Flex>
    </Container>
  )
}
