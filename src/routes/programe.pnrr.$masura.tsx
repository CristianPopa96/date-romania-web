import { useSuspenseQuery } from '@tanstack/react-query'
import {
  Link as RouterLink,
  createFileRoute,
  notFound,
} from '@tanstack/react-router'
import {
  Card,
  Code,
  Container,
  Flex,
  Grid,
  Heading,
  Link,
  Text,
} from '@radix-ui/themes'

import { PnrrContractFinder } from '#/components/PnrrContractFinder'
import { Stat } from '#/components/ProgrammeFigures'
import { SourceLine } from '#/components/SourceLine'
import { messagesFor } from '#/i18n'
import { useI18n } from '#/i18n/context'
import type { PnrrContractFilter, PnrrMeasure } from '#/lib/api-pnrr'
import { pageTitle } from '#/lib/copy'
import {
  countyBySlug,
  measureBySlug,
  measureLabel,
  paidShare,
} from '#/lib/pnrr'
import { pnrrContractsQuery, pnrrMeasureQuery, pnrrQuery } from '#/lib/queries'
import { statusOfParam, validatePnrrSearch } from '#/lib/urls-programmes'
import type { PnrrSearch } from '#/lib/urls-programmes'

// What the address asks of the list of contracts, in the API's words.
function filterOf(
  measure: PnrrMeasure,
  search: PnrrSearch,
): PnrrContractFilter {
  return {
    measure: measure.code,
    county: countyBySlug(measure.counties, search.judet),
    status: statusOfParam(search.stare),
    q: search.q,
    page: search.pagina ?? 1,
  }
}

// One measure of the plan: its money and its contracts. The address is the measure's code
// in lower case ('/programe/pnrr/c10.i3'), found back in the programme's list.
export const Route = createFileRoute('/programe/pnrr/$masura')({
  validateSearch: validatePnrrSearch,
  loaderDeps: ({ search }) => search,
  loader: async ({ context, params, deps }) => {
    const programme = await context.queryClient.ensureQueryData(pnrrQuery)
    const found = programme && measureBySlug(programme.measures, params.masura)
    if (!found) throw notFound()
    const measure = await context.queryClient.ensureQueryData(
      pnrrMeasureQuery(found.code),
    )
    if (!measure) throw notFound()
    await context.queryClient.ensureQueryData(
      pnrrContractsQuery(filterOf(measure, deps)),
    )
    return {
      code: measure.code,
      title: measureLabel(measure.code, measure.name),
    }
  },
  head: ({ loaderData, match }) => ({
    meta: [
      {
        title: pageTitle(
          loaderData?.title ?? messagesFor(match.context.locale).pnrr.name,
        ),
      },
    ],
  }),
  component: MeasurePage,
})

function MeasurePage() {
  const { code } = Route.useLoaderData()
  const { data: measure } = useSuspenseQuery(pnrrMeasureQuery(code))
  // The loader made sure it exists.
  return measure ? <MeasureView measure={measure} /> : null
}

function MeasureView({ measure }: { measure: PnrrMeasure }) {
  const { t, f } = useI18n()
  const p = t.pnrr
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const { data: contracts } = useSuspenseQuery(
    pnrrContractsQuery(filterOf(measure, search)),
  )
  const share = paidShare(measure.paid_eur, measure.allocated_eur)

  return (
    <Container size="4" px="5" py="7">
      <Flex direction="column" gap="6">
        <Flex direction="column" gap="2">
          <Text size="2" color="gray">
            {p.crumb} /{' '}
            <Link asChild color="gray">
              <RouterLink to="/programe/pnrr">{p.name}</RouterLink>
            </Link>{' '}
            / {measureLabel(measure.code, measure.name)}
          </Text>
          <Text size="1" color="gray" weight="medium">
            {p.measureEyebrow(measure.ministry_name ?? measure.ministry ?? '')}{' '}
            <Code variant="ghost">{measure.code}</Code>
          </Text>
          <Heading size="7">{measure.name ?? measure.code}</Heading>
        </Flex>

        <Card size="3">
          <Flex direction="column" gap="4">
            <Grid columns={{ initial: '1', sm: '3' }} gap="5">
              <Stat
                label={p.allocated}
                value={
                  measure.allocated_eur === null
                    ? t.common.notPublished
                    : f.euroShort(measure.allocated_eur)
                }
                detail={[p.allocatedDetail]}
              />
              <Stat
                label={p.contracted}
                value={
                  measure.contracted_ron === null
                    ? t.common.notPublished
                    : f.leiShort(measure.contracted_ron)
                }
                detail={[
                  p.contractedDetail,
                  p.contracts(measure.contracts, f.count(measure.contracts)),
                ]}
              />
              <Stat
                label={p.paid}
                value={
                  measure.paid_eur === null
                    ? t.common.notPublished
                    : f.euroShort(measure.paid_eur)
                }
                detail={[
                  ...(share === null ? [] : [p.paidDetail(f.percent(share))]),
                  ...(measure.payments_without_contract > 0
                    ? [
                        p.paidWithoutContract(
                          f.leiShort(measure.paid_without_contract),
                          measure.payments_without_contract,
                          f.count(measure.payments_without_contract),
                        ),
                      ]
                    : []),
                ]}
                share={share ?? undefined}
              />
            </Grid>
            {measure.natural_persons > 0 ? (
              <Text size="2" color="gray">
                {p.naturalPersons(
                  measure.natural_persons,
                  f.count(measure.natural_persons),
                )}
              </Text>
            ) : null}
            <SourceLine
              source={{
                ...measure.source,
                record:
                  measure.source.record &&
                  p.edition(measure.source.record, f.day(measure.edition)),
              }}
            />
          </Flex>
        </Card>

        <PnrrContractFinder
          key={search.q ?? ''}
          measure={measure}
          contracts={contracts}
          search={search}
          onSearch={(next) =>
            void navigate({ search: next, resetScroll: false })
          }
        />
      </Flex>
    </Container>
  )
}
