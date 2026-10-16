import { useSuspenseQuery } from '@tanstack/react-query'
import { Flex, Select, Text } from '@radix-ui/themes'

import { useI18n } from '#/i18n/context'
import { cpvDivisionLabel } from '#/lib/patterns'
import { cpvDivisionsQuery } from '#/lib/queries'
import type { RankingSearch } from '#/lib/urls'

// Radix Select keeps no item for "no value", so "toate" is an item of its own.
const ALL = 'toate'

// The filters above a ranking, in one wrapped row: CPV, then EU funds where the ranking
// is of contracts. Both live in the address.
export function RankingFilters({
  search,
  contracts,
  onSearch,
}: {
  search: RankingSearch
  contracts: boolean
  onSearch: (filters: Pick<RankingSearch, 'cpv' | 'ue'>) => void
}) {
  const { t } = useI18n()
  const { data: divisions } = useSuspenseQuery(cpvDivisionsQuery)
  const labels = t.rankings.filters
  const code = search.cpv === undefined ? undefined : String(search.cpv)
  const cpv = code ?? ALL
  const shownCpv =
    code === undefined
      ? labels.all
      : cpvDivisionLabel(
          code,
          divisions?.find((division) => division.code === code),
        )
  const eu = search.ue ?? ALL

  return (
    <Flex direction="column" gap="2">
      <Flex
        gap="2"
        wrap="wrap"
        align="center"
        role="group"
        aria-label={labels.label}
      >
        <Select.Root
          size="1"
          value={cpv}
          onValueChange={(value) =>
            onSearch({ ue: search.ue, cpv: value === ALL ? undefined : value })
          }
        >
          <Select.Trigger variant="soft" color="gray" aria-label={labels.cpv}>
            {labels.field(labels.cpv, shownCpv)}
          </Select.Trigger>
          <Select.Content position="popper">
            <Select.Item value={ALL}>{labels.all}</Select.Item>
            {(divisions ?? []).map((division) => (
              <Select.Item key={division.code} value={division.code}>
                {cpvDivisionLabel(division.code, division)}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
        {contracts ? (
          <Select.Root
            size="1"
            value={eu}
            onValueChange={(value) =>
              onSearch({
                cpv: search.cpv,
                ue: value === 'da' || value === 'nu' ? value : undefined,
              })
            }
          >
            <Select.Trigger variant="soft" color="gray" aria-label={labels.eu}>
              {labels.field(
                labels.eu,
                eu === 'da'
                  ? labels.euYes
                  : eu === 'nu'
                    ? labels.euNo
                    : labels.all,
              )}
            </Select.Trigger>
            <Select.Content position="popper">
              <Select.Item value={ALL}>{labels.all}</Select.Item>
              <Select.Item value="da">{labels.euYes}</Select.Item>
              <Select.Item value="nu">{labels.euNo}</Select.Item>
            </Select.Content>
          </Select.Root>
        ) : null}
      </Flex>
      {contracts && search.ue ? (
        <Text size="1" color="gray">
          {labels.euNote}
        </Text>
      ) : null}
      <Text size="1" color="gray">
        {labels.missing}
      </Text>
    </Flex>
  )
}
