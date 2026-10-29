import { useSuspenseQuery } from '@tanstack/react-query'
import { DownloadIcon } from '@radix-ui/react-icons'
import { Button, Flex, Text } from '@radix-ui/themes'

import {
  ContractTable,
  listSource,
  contractsCsvPath,
} from '#/features/contracts'
import { IncompleteContracts } from '#/components/Notes'
import { SourceLine } from '#/components/SourceLine'
import { useI18n } from '#/i18n/context'
import { largestContractsQuery } from '#/features/rankings/queries'
import type { RankingFilter } from '#/features/rankings/urls'

// The largest contracts tab. The rankings of parties are lists of their own (RankingList).
// Contracts and direct purchases are two kinds of money and never share a list.

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
      <ContractTable contracts={data.items} />
      <SourceLine source={source} />
    </Flex>
  )
}
