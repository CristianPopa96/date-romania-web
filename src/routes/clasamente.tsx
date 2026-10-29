import { createFileRoute } from '@tanstack/react-router'
import { Container, Flex, Heading, Text } from '@radix-ui/themes'

import { Patterns } from '#/features/patterns/Patterns'
import { RankingFilters } from '#/features/rankings/RankingFilters'
import { RankingList } from '#/features/rankings/RankingList'
import { LargestContracts } from '#/features/rankings/Rankings'
import { UrlTabs } from '#/components/UrlTabs'
import { messagesFor } from '#/i18n'
import { useI18n } from '#/i18n/context'
import { pageTitle } from '#/lib/copy'
import {
  largestContractsQuery,
  rankingListQuery,
  rankingTopQuery,
} from '#/features/rankings/queries'
import { cpvDivisionsQuery, nearLimitQuery } from '#/features/patterns/queries'
import { statsQuery } from '#/lib/queries'
import {
  RANKINGS,
  isContractTab,
  isRankingTab,
  rankingFilter,
  validateRankingSearch,
} from '#/features/rankings/urls'
import type { RankingSearch } from '#/features/rankings/urls'

export const Route = createFileRoute('/clasamente')({
  validateSearch: validateRankingSearch,
  loaderDeps: ({ search }) => search,
  // Only the ranking the address asks for is read, and the list behind the filters.
  loader: ({ context: { queryClient }, deps }) => {
    const filter = rankingFilter(deps)
    const ranking = () => {
      switch (deps.clasament) {
        case 'furnizori':
        case 'institutii':
        case 'achizitii':
          return Promise.all([
            queryClient.ensureQueryData(statsQuery),
            queryClient.ensureQueryData(rankingListQuery(deps)),
            queryClient.ensureQueryData(rankingTopQuery(deps)),
          ])
        case 'tipare':
          return queryClient.ensureQueryData(nearLimitQuery(deps))
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
          {isRankingTab(tab) ? (
            // A ranking declares its filters to its own bar, as the pattern's list does.
            <RankingList tab={tab} search={search} onSearch={go} />
          ) : null}
          {tab === 'tipare' ? (
            <Patterns
              search={search}
              onApply={(patch) => go({ ...search, ...patch })}
            />
          ) : null}
          {tab === 'contracte' ? (
            <>
              <RankingFilters
                search={search}
                contracts={isContractTab(tab)}
                onSearch={(filters) => go({ ...search, ...filters })}
              />
              <LargestContracts filter={filter} />
            </>
          ) : null}
        </UrlTabs>
      </Flex>
    </Container>
  )
}
