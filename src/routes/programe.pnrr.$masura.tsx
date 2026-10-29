import { useSuspenseQuery } from '@tanstack/react-query'
import {
  Link as RouterLink,
  createFileRoute,
  notFound,
  redirect,
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

import { PnrrContractList } from '#/features/pnrr/PnrrContractList'
import { Stat } from '#/features/programme/ProgrammeFigures'
import { SourceLine } from '#/components/SourceLine'
import { messagesFor } from '#/i18n'
import { useI18n } from '#/i18n/context'
import type { PnrrMeasure } from '#/features/pnrr/api'
import { pageTitle } from '#/lib/copy'
import {
  countyBySlug,
  measureBySlug,
  measureLabel,
  paidShare,
} from '#/features/pnrr/pnrr'
import {
  pnrrListQuery,
  pnrrMeasureQuery,
  pnrrOverviewQuery,
  pnrrQuery,
} from '#/features/pnrr/queries'
import { validatePnrrMeasureSearch } from '#/features/pnrr/list'
import type { PnrrListOf, PnrrListSearch } from '#/features/pnrr/list'
import { pageCount } from '#/lib/list'
import { pageFromParam } from '#/lib/urls'

// Whose list the contracts are: the measure's, in the counties it has contracts in.
function listOf(measure: PnrrMeasure): PnrrListOf {
  return { measure: measure.code, counties: measure.counties }
}

// One measure of the plan: its money and its contracts as a list of the DataTable pattern.
// The address is the measure's code in lower case ('/programe/pnrr/c10.i3'), found back in
// the programme's list: /programe/pnrr/c10.i3?judet=gorj&stare=finalizat&q=scoala.
export const Route = createFileRoute('/programe/pnrr/$masura')({
  validateSearch: (
    search: Record<string, unknown>,
  ): PnrrListSearch & { pagina?: number } => ({
    ...validatePnrrMeasureSearch(search),
    pagina: pageFromParam(search.pagina),
  }),
  loaderDeps: ({ search }) => search,
  loader: async ({ context, params, deps }) => {
    const programme = await context.queryClient.ensureQueryData(pnrrQuery)
    const found = programme && measureBySlug(programme.measures, params.masura)
    if (!found) throw notFound()
    const measure = await context.queryClient.ensureQueryData(
      pnrrMeasureQuery(found.code),
    )
    if (!measure) throw notFound()
    // A county the measure has no contract in: drop it rather than list everything under a
    // link that looks filtered.
    if (deps.judet && !countyBySlug(measure.counties, deps.judet)) {
      throw redirect({
        to: '/programe/pnrr/$masura',
        params,
        search: { ...deps, judet: undefined },
        replace: true,
      })
    }
    const [list] = await Promise.all([
      context.queryClient.ensureQueryData(pnrrListQuery(listOf(measure), deps)),
      context.queryClient.ensureQueryData(
        pnrrOverviewQuery(listOf(measure), deps),
      ),
    ])
    // A page past the end of the list goes to the last one that has rows.
    if (list !== 'failed') {
      const last = pageCount(list.total, deps.pe_pagina ?? 25)
      if ((deps.pagina ?? 1) > last) {
        throw redirect({
          to: '/programe/pnrr/$masura',
          params,
          search: { ...deps, pagina: last > 1 ? last : undefined },
        })
      }
    }
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
            {p.measureEyebrow(measure.ministry_name ?? measure.ministry)}{' '}
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

        <PnrrContractList
          of={listOf(measure)}
          edition={measure.edition}
          search={search}
          onSearch={(next) =>
            void navigate({ search: next, resetScroll: false })
          }
        />
      </Flex>
    </Container>
  )
}
