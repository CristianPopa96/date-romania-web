import { createFileRoute, redirect } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Container, Flex, Heading, Text } from '@radix-ui/themes'

import { IncompleteContracts } from '#/components/Notes'
import { UrlTabs } from '#/components/UrlTabs'
import {
  ContractList,
  contractListQuery,
  contractOverviewQuery,
} from '#/features/contracts'
import { Patterns } from '#/features/patterns/Patterns'
import { cpvDivisionsQuery, nearLimitQuery } from '#/features/patterns/queries'
import {
  PurchaseList,
  purchaseListQuery,
  purchaseOverviewQuery,
} from '#/features/purchases'
import { RankingList } from '#/features/rankings/RankingList'
import { rankingListQuery, rankingTopQuery } from '#/features/rankings/queries'
import {
  RANKINGS,
  isRankingTab,
  keptAcrossTabs,
  validateClasamenteSearch,
} from '#/features/rankings/urls'
import type { ClasamenteSearch } from '#/features/rankings/urls'
import { messagesFor } from '#/i18n'
import { useI18n } from '#/i18n/context'
import { pageTitle } from '#/lib/copy'
import { pageCount } from '#/lib/list'
import { statsQuery } from '#/lib/queries'

// Clasamente (design round 14): the SEAP records and who they are with. "Contracte" and
// "Achiziții directe" are the lists of every contract and every accepted direct purchase,
// the largest first; "Furnizori" and "Instituții" rank the parties, by contracts or by
// direct purchases, never both; "Tipare" holds the patterns.
export const Route = createFileRoute('/clasamente')({
  validateSearch: validateClasamenteSearch,
  loaderDeps: ({ search }) => search,
  // Only the tab the address asks for is read, and the list behind its filters.
  loader: async ({ context: { queryClient }, deps }) => {
    // The rows of the list the tab pages through.
    const rows = async () => {
      switch (deps.clasament ?? 'contracte') {
        case 'contracte': {
          const [list] = await Promise.all([
            queryClient.ensureQueryData(
              contractListQuery('institutions', null, deps),
            ),
            queryClient.ensureQueryData(
              contractOverviewQuery('institutions', null, deps),
            ),
          ])
          return list === 'failed' ? null : list.total
        }
        case 'achizitii': {
          const [list] = await Promise.all([
            queryClient.ensureQueryData(
              purchaseListQuery('institutions', null, deps),
            ),
            queryClient.ensureQueryData(
              purchaseOverviewQuery('institutions', null, deps),
            ),
            queryClient.ensureQueryData(statsQuery),
          ])
          return list.total
        }
        case 'tipare': {
          const pattern = await queryClient.ensureQueryData(
            nearLimitQuery(deps),
          )
          return pattern === 'failed' || !pattern ? null : pattern.pairs
        }
        default: {
          const [, list] = await Promise.all([
            queryClient.ensureQueryData(statsQuery),
            queryClient.ensureQueryData(rankingListQuery(deps)),
            queryClient.ensureQueryData(rankingTopQuery(deps)),
          ])
          return list === 'failed' || !list ? null : list.total
        }
      }
    }
    const [total] = await Promise.all([
      rows(),
      queryClient.ensureQueryData(cpvDivisionsQuery),
    ])
    // A page past the end of the list goes to the last one that has rows.
    const last = total === null ? null : pageCount(total, deps.pe_pagina ?? 25)
    if (last !== null && (deps.pagina ?? 1) > last) {
      throw redirect({
        to: '/clasamente',
        search: { ...deps, pagina: last > 1 ? last : undefined },
      })
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
  const go = (next: ClasamenteSearch) =>
    void navigate({
      search: validateClasamenteSearch(next),
      resetScroll: false,
    })
  const records = t.rankings.records

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
          // The filters go with the reader from one tab to the next, where they apply.
          onChange={(value) =>
            go({
              clasament: value === 'contracte' ? undefined : value,
              ...keptAcrossTabs(search),
            } as ClasamenteSearch)
          }
        >
          {tab === 'contracte' ? (
            <Flex direction="column" gap="3">
              <Text size="2" color="gray">
                {records.contracts.lead}
              </Text>
              <ContractsPeriod />
              <ContractList
                role="institutions"
                cui={null}
                search={search}
                won={undefined}
                title={records.contracts.title}
                onSearch={go}
              />
            </Flex>
          ) : null}
          {tab === 'achizitii' ? <Purchases onSearch={go} /> : null}
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
        </UrlTabs>
      </Flex>
    </Container>
  )
}

// The callout every list of contracts carries: the contracts of a period are never complete.
function ContractsPeriod() {
  const search = Route.useSearch()
  const { data } = useSuspenseQuery(
    contractOverviewQuery('institutions', null, search),
  )
  return data && data !== 'failed' ? (
    <IncompleteContracts period={data.period} />
  ) : null
}

function Purchases({
  onSearch,
}: {
  onSearch: (next: ClasamenteSearch) => void
}) {
  const { t } = useI18n()
  const search = Route.useSearch()
  const { data: stats } = useSuspenseQuery(statsQuery)
  const records = t.rankings.records
  return (
    <Flex direction="column" gap="3">
      <Text size="2" color="gray">
        {records.purchases.lead}
      </Text>
      <PurchaseList
        role="institutions"
        cui={null}
        search={search}
        held={stats?.direct_purchases ?? null}
        title={records.purchases.title}
        onSearch={onSearch}
      />
    </Flex>
  )
}
