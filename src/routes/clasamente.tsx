import { createFileRoute } from '@tanstack/react-router'
import { Container, Flex, Heading, Text } from '@radix-ui/themes'

import { Patterns } from '#/components/Patterns'
import { RankingFilters } from '#/components/RankingFilters'
import {
  ContractRanking,
  DirectRankings,
  LargestContracts,
} from '#/components/Rankings'
import { UrlTabs } from '#/components/UrlTabs'
import { messagesFor } from '#/i18n'
import { useI18n } from '#/i18n/context'
import { pageTitle } from '#/lib/copy'
import {
  contractRankingQuery,
  cpvDivisionsQuery,
  largestContractsQuery,
  nearLimitQuery,
  rankingQuery,
  statsQuery,
} from '#/lib/queries'
import {
  RANKINGS,
  isContractTab,
  rankingFilter,
  validateRankingSearch,
} from '#/lib/urls'
import type { RankingSearch } from '#/lib/urls'

export const Route = createFileRoute('/clasamente')({
  validateSearch: validateRankingSearch,
  loaderDeps: ({ search }) => search,
  // Only the ranking the address asks for is read, and the list behind the filters.
  loader: ({ context: { queryClient }, deps }) => {
    const filter = rankingFilter(deps)
    const ranking = () => {
      switch (deps.clasament) {
        case 'furnizori':
          return queryClient.ensureQueryData(
            contractRankingQuery(
              'suppliers',
              filter,
              deps.castigate === 'asociere' ? 'association' : 'alone',
            ),
          )
        case 'institutii':
          return queryClient.ensureQueryData(
            contractRankingQuery('institutions', filter),
          )
        case 'achizitii':
          return Promise.all([
            queryClient.ensureQueryData(statsQuery),
            queryClient.ensureQueryData(rankingQuery('suppliers', filter.cpv)),
            queryClient.ensureQueryData(
              rankingQuery('institutions', filter.cpv),
            ),
          ])
        case 'tipare':
          return queryClient.ensureQueryData(nearLimitQuery(filter.cpv))
        default:
          return queryClient.ensureQueryData(largestContractsQuery(filter))
      }
    }
    return Promise.all([
      ranking(),
      queryClient.ensureQueryData(cpvDivisionsQuery),
    ])
  },
  head: ({ match }) => ({
    meta: [
      { title: pageTitle(messagesFor(match.context.locale).rankings.title) },
    ],
  }),
  component: Rankings,
})

function Rankings() {
  const { t } = useI18n()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const tab = search.clasament ?? 'contracte'
  const filter = rankingFilter(search)
  const go = (next: RankingSearch) =>
    void navigate({ search: validateRankingSearch(next), resetScroll: false })

  return (
    <Container size="4" px="5" py="7">
      <Flex direction="column" gap="5">
        <Flex direction="column" gap="2">
          <Heading size="6">{t.rankings.title}</Heading>
          <Text size="2" color="gray">
            {t.rankings.intro}
          </Text>
        </Flex>

        <UrlTabs
          value={tab}
          tabs={RANKINGS.map((name) => ({
            value: name,
            label: t.rankings.tabs[name],
          }))}
          // The filters stay with the reader from one ranking to the next, where they apply.
          onChange={(value) =>
            go({ clasament: value, cpv: search.cpv, ue: search.ue })
          }
        >
          <RankingFilters
            search={search}
            contracts={isContractTab(tab)}
            onSearch={(filters) => go({ ...search, ...filters })}
          />
          {tab === 'contracte' ? <LargestContracts filter={filter} /> : null}
          {tab === 'furnizori' ? (
            <ContractRanking
              role="suppliers"
              filter={filter}
              won={search.castigate === 'asociere' ? 'association' : 'alone'}
              onWon={(won) =>
                go({
                  ...search,
                  castigate: won === 'association' ? 'asociere' : undefined,
                })
              }
            />
          ) : null}
          {tab === 'achizitii' ? <DirectRankings cpv={filter.cpv} /> : null}
          {tab === 'institutii' ? (
            <ContractRanking role="institutions" filter={filter} />
          ) : null}
          {tab === 'tipare' ? <Patterns cpv={filter.cpv} /> : null}
        </UrlTabs>
      </Flex>
    </Container>
  )
}
