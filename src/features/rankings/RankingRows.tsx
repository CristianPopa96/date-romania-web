import { Box, Code, Flex, Text } from '@radix-ui/themes'

import { EntityLink } from '#/components/EntityLink'
import { ListRows } from '#/components/list/ListRows'
import type { Column } from '#/components/list/ListRows'
import type { RankedParty } from '#/features/rankings/api'
import { useI18n } from '#/i18n/context'
import type { Role } from '#/lib/api'
import { marks } from '#/lib/list'
import type { Sort } from '#/lib/list'

// The rows of a ranking, declared to ListRows: the place in the order shown, the party (it
// opens its page), how many contracts or purchases its value adds up, and the value.
export function RankingRows({
  items,
  role,
  countLabel,
  countText,
  q,
  sort,
  onSort,
}: {
  items: Array<RankedParty>
  role: Role
  // "Contracte" or "Achiziții", and "3 contracte" or "3 achiziții" for a phone's card.
  countLabel: string
  countText: (n: number) => string
  q: string | undefined
  sort: Sort
  onSort: (sort: Sort | null) => void
}) {
  const { t, f } = useI18n()
  const l = t.rankings.list
  const columns: Array<Column<RankedParty>> = [
    {
      key: 'loc',
      header: l.place,
      align: 'end',
      cell: (row) => <Text color="gray">{f.count(row.rank)}</Text>,
    },
    {
      key: 'nume',
      header: l.name,
      maxWidth: 420,
      cell: (row) => <Party row={row} role={role} q={q} />,
    },
    {
      key: 'numar',
      header: countLabel,
      sort: { column: 'numar' },
      align: 'end',
      nowrap: true,
      cell: (row) => <>{f.count(row.count)}</>,
    },
    {
      key: 'valoare',
      header: l.value,
      sort: { column: 'valoare' },
      align: 'end',
      nowrap: true,
      cell: (row) => <>{f.lei(row.value)}</>,
    },
  ]
  return (
    <ListRows
      columns={columns}
      rows={items}
      rowKey={(row) => row.cui}
      sort={sort}
      onSort={onSort}
      total={null}
      card={(row) => (
        <Flex justify="between" gap="3">
          <Flex gap="2" minWidth="0">
            <Text color="gray">{f.count(row.rank)}</Text>
            <Box minWidth="0">
              <Party row={row} role={role} q={q} />
              <Text as="div" size="1" color="gray">
                {countText(row.count)}
              </Text>
            </Box>
          </Flex>
          <Box style={{ whiteSpace: 'nowrap', textAlign: 'right' }}>
            {f.lei(row.value)}
          </Box>
        </Flex>
      )}
    />
  )
}

function Party({
  row,
  role,
  q,
}: {
  row: RankedParty
  role: Role
  q: string | undefined
}) {
  const { t } = useI18n()
  return (
    <>
      <Text as="div" size="2">
        <EntityLink role={role} cui={row.cui}>
          {marks(row.name, q).map((part, index) =>
            part.mark ? (
              <mark key={index} className="dr-mark">
                {part.text}
              </mark>
            ) : (
              part.text
            ),
          )}
        </EntityLink>
      </Text>
      <Text as="div" size="1" color="gray">
        <Code variant="ghost">{t.rankings.list.cui(String(row.cui))}</Code>
      </Text>
    </>
  )
}
