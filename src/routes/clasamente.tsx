import { createFileRoute } from '@tanstack/react-router'
import { Container, Flex, Heading, Tabs, Text } from '@radix-ui/themes'

import {
  ContractRanking,
  DirectRankings,
  LargestContracts,
} from '#/components/Rankings'
import { messagesFor } from '#/i18n'
import { useI18n } from '#/i18n/context'
import { pageTitle } from '#/lib/copy'
import {
  contractRankingQuery,
  largestContractsQuery,
  rankingQuery,
  statsQuery,
} from '#/lib/queries'
import { RANKINGS, validateRankingSearch } from '#/lib/urls'
import type { RankingTab } from '#/lib/urls'

export const Route = createFileRoute('/clasamente')({
  validateSearch: validateRankingSearch,
  loaderDeps: ({ search }) => search,
  // Only the ranking the address asks for is read.
  loader: ({ context: { queryClient }, deps }) => {
    switch (deps.clasament) {
      case 'furnizori':
        return queryClient.ensureQueryData(
          contractRankingQuery(
            'suppliers',
            deps.castigate === 'asociere' ? 'association' : 'alone',
          ),
        )
      case 'institutii':
        return queryClient.ensureQueryData(contractRankingQuery('institutions'))
      case 'achizitii':
        return Promise.all([
          queryClient.ensureQueryData(statsQuery),
          queryClient.ensureQueryData(rankingQuery('suppliers')),
          queryClient.ensureQueryData(rankingQuery('institutions')),
        ])
      default:
        return queryClient.ensureQueryData(largestContractsQuery)
    }
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

  return (
    <Container size="4" px="5" py="7">
      <Flex direction="column" gap="5">
        <Flex direction="column" gap="2">
          <Heading size="6">{t.rankings.title}</Heading>
          <Text size="2" color="gray">
            {t.rankings.intro}
          </Text>
        </Flex>

        <Tabs.Root
          value={tab}
          onValueChange={(value) =>
            void navigate({
              search: { clasament: value as RankingTab },
              resetScroll: false,
            })
          }
        >
          <Tabs.List>
            {RANKINGS.map((name) => (
              <Tabs.Trigger key={name} value={name}>
                {t.rankings.tabs[name]}
              </Tabs.Trigger>
            ))}
          </Tabs.List>
        </Tabs.Root>

        {tab === 'contracte' ? <LargestContracts /> : null}
        {tab === 'furnizori' ? (
          <ContractRanking
            role="suppliers"
            won={search.castigate === 'asociere' ? 'association' : 'alone'}
            onWon={(won) =>
              void navigate({
                search: {
                  clasament: 'furnizori',
                  castigate: won === 'association' ? 'asociere' : undefined,
                },
                resetScroll: false,
              })
            }
          />
        ) : null}
        {tab === 'achizitii' ? <DirectRankings /> : null}
        {tab === 'institutii' ? <ContractRanking role="institutions" /> : null}
      </Flex>
    </Container>
  )
}
