import { useSuspenseQuery } from '@tanstack/react-query'
import { DownloadIcon } from '@radix-ui/react-icons'
import {
  Button,
  Card,
  Flex,
  Grid,
  Heading,
  SegmentedControl,
  Text,
} from '@radix-ui/themes'

import { BarList } from '#/features/rankings/BarList'
import {
  ContractTable,
  listSource,
  contractsCsvPath,
} from '#/features/contracts'
import {
  IncompleteContracts,
  PeriodNote,
  Unavailable,
} from '#/components/Notes'
import { SourceLine } from '#/components/SourceLine'
import { useI18n } from '#/i18n/context'
import type { Role } from '#/lib/api'
import type { Won } from '#/features/rankings/api'
import {
  contractRankingQuery,
  largestContractsQuery,
  rankingQuery,
} from '#/features/rankings/queries'
import { statsQuery } from '#/lib/queries'
import type { RankingFilter } from '#/features/rankings/urls'

// The rankings, one per tab of the page. Contracts and direct purchases are two kinds of
// money and never share a list.

function isFiltered(filter: RankingFilter) {
  return filter.cpv !== undefined || filter.eu !== undefined
}

// The largest contracts signed in the period, whoever bought and whoever won.
export function LargestContracts({ filter }: { filter: RankingFilter }) {
  const { t } = useI18n()
  const { data } = useSuspenseQuery(largestContractsQuery(filter))
  const source = listSource(data.items)

  if (!source) {
    return (
      <Text size="2" color="gray">
        {isFiltered(filter) ? t.rankings.noneFiltered : t.rankings.none}
      </Text>
    )
  }
  return (
    <Flex direction="column" gap="3">
      <IncompleteContracts period={data.period} />
      <Flex justify="end">
        <Button asChild variant="soft" color="gray" size="1">
          <a href={contractsCsvPath(filter)} download>
            <DownloadIcon />
            {t.contracts.export}
          </a>
        </Button>
      </Flex>
      <ContractTable contracts={data.items} view="ranking" />
      <SourceLine source={source} />
    </Flex>
  )
}

// Winners by the contracts they won, or institutions by the contracts they awarded.
export function ContractRanking({
  role,
  filter,
  won,
  onWon,
}: {
  role: Role
  filter: RankingFilter
  won?: Won
  onWon?: (won: Won) => void
}) {
  const { t, f } = useI18n()
  const { data } = useSuspenseQuery(contractRankingQuery(role, filter, won))
  if (!data) return <Unavailable />

  return (
    <Flex direction="column" gap="3">
      <IncompleteContracts period={data.period} />
      <Flex justify="between" align="center" gap="3" wrap="wrap">
        <Heading size="4">
          {role === 'suppliers'
            ? t.rankings.bySuppliers
            : t.rankings.byInstitutions}
        </Heading>
        {onWon ? (
          <SegmentedControl.Root
            size="1"
            aria-label={t.rankings.wonLabel}
            value={won ?? 'alone'}
            onValueChange={(value) => onWon(value as Won)}
          >
            <SegmentedControl.Item value="alone">
              {t.rankings.wonAlone}
            </SegmentedControl.Item>
            <SegmentedControl.Item value="association">
              {t.rankings.wonTogether}
            </SegmentedControl.Item>
          </SegmentedControl.Root>
        ) : null}
      </Flex>
      {won === 'association' ? (
        <Text size="2" color="gray">
          {t.rankings.associationNote}
        </Text>
      ) : null}
      {data.items.length > 0 ? (
        <Card>
          <BarList
            rows={data.items}
            role={role}
            numbered
            note={(row) =>
              t.contracts.count(row.contracts, f.count(row.contracts))
            }
          />
        </Card>
      ) : (
        <Text size="2" color="gray">
          {isFiltered(filter) ? t.rankings.noneFiltered : t.rankings.none}
        </Text>
      )}
      <SourceLine source={data.source} />
    </Flex>
  )
}

// Direct purchases: who sold most and who bought most, by accepted value.
export function DirectRankings({ cpv }: { cpv?: string }) {
  const { t } = useI18n()
  const { data: stats } = useSuspenseQuery(statsQuery)

  return (
    <Flex direction="column" gap="3">
      <Flex direction="column" gap="1">
        <Text size="2" color="gray">
          {t.rankings.directIntro}
        </Text>
        {stats ? <PeriodNote summary={stats.direct_purchases} /> : null}
      </Flex>
      <Grid columns={{ initial: '1', md: '2' }} gap="5">
        <DirectRanking
          role="suppliers"
          title={t.rankings.suppliers}
          cpv={cpv}
        />
        <DirectRanking
          role="institutions"
          title={t.rankings.institutions}
          cpv={cpv}
        />
      </Grid>
    </Flex>
  )
}

function DirectRanking({
  role,
  title,
  cpv,
}: {
  role: Role
  title: string
  cpv?: string
}) {
  const { t, f } = useI18n()
  const { data } = useSuspenseQuery(rankingQuery(role, cpv))

  return (
    <Flex direction="column" gap="3">
      <Heading size="4">{title}</Heading>
      {!data || (data.items.length === 0 && !cpv) ? (
        <Unavailable />
      ) : data.items.length > 0 ? (
        <>
          <Card>
            <BarList
              rows={data.items}
              role={role}
              numbered
              note={(row) =>
                t.partners.accepted(row.accepted, f.count(row.accepted))
              }
            />
          </Card>
          <SourceLine source={data.source} />
        </>
      ) : (
        <Text size="2" color="gray">
          {t.rankings.noneFiltered}
        </Text>
      )}
    </Flex>
  )
}
