import { Link as RouterLink } from '@tanstack/react-router'
import { Box, Flex, Link, Text } from '@radix-ui/themes'

import { DataState } from '#/components/DataState'
import { ListRows } from '#/components/list/ListRows'
import type { Column } from '#/components/list/ListRows'
import { MatchBadge } from '#/features/programme/MatchBadge'
import type { ProjectRow } from '#/features/programme/api'
import { useI18n } from '#/i18n/context'
import { marks } from '#/lib/list'
import type { Sort } from '#/lib/list'

// The rows of the Anghel Saligny projects, declared to ListRows: the project (it opens its
// page) and its kind of works, the town hall and its county, whether a SEAP contract was
// found, the project's value as the ministry gives it, and what was paid in how many
// payments (last, so the total row adds it up under its column).
export function ProjectRows({
  items,
  q,
  sort,
  onSort,
  total,
}: {
  items: Array<ProjectRow>
  q: string | undefined
  sort: Sort
  onSort: (sort: Sort | null) => void
  total: { label: string; value: string } | null
}) {
  const { t } = useI18n()
  const p = t.programme
  const columns: Array<Column<ProjectRow>> = [
    {
      key: 'proiect',
      header: p.project,
      maxWidth: 380,
      cell: (row) => <Title row={row} q={q} />,
    },
    {
      key: 'primaria',
      header: p.townHall,
      cell: (row) => <TownHall row={row} q={q} />,
    },
    {
      key: 'contract',
      header: p.contract,
      cell: (row) => (
        <MatchBadge match={row.match} label={p.match[row.match]} />
      ),
    },
    {
      key: 'valoare',
      header: p.list.value,
      sort: { column: 'valoare' },
      align: 'end',
      nowrap: true,
      cell: (row) => <Value row={row} />,
    },
    {
      key: 'platit',
      header: p.paidColumn,
      sort: { column: 'platit' },
      align: 'end',
      nowrap: true,
      cell: (row) => <Paid row={row} />,
    },
  ]
  return (
    <ListRows
      columns={columns}
      rows={items}
      rowKey={(row) => row.id}
      sort={sort}
      onSort={onSort}
      total={total}
      card={(row) => (
        <Flex justify="between" gap="3">
          <Box minWidth="0">
            <Title row={row} q={q} />
            <Box mt="1">
              <TownHall row={row} q={q} />
            </Box>
            <Box mt="1">
              <MatchBadge match={row.match} label={p.match[row.match]} />
            </Box>
          </Box>
          <Box style={{ whiteSpace: 'nowrap', textAlign: 'right' }}>
            <Paid row={row} />
          </Box>
        </Flex>
      )}
    />
  )
}

function Marked({ text, q }: { text: string; q: string | undefined }) {
  return (
    <>
      {marks(text, q).map((part, index) =>
        part.mark ? (
          <mark key={index} className="dr-mark">
            {part.text}
          </mark>
        ) : (
          part.text
        ),
      )}
    </>
  )
}

function Title({ row, q }: { row: ProjectRow; q: string | undefined }) {
  const { t } = useI18n()
  return (
    <>
      <Text as="div" size="2">
        <Link asChild>
          <RouterLink
            to="/programe/anghel-saligny/proiecte/$id"
            params={{ id: String(row.id) }}
          >
            {row.investment ? (
              <Marked text={row.investment} q={q} />
            ) : (
              t.programme.projectTitle(String(row.id))
            )}
          </RouterLink>
        </Link>
      </Text>
      {row.category ? (
        <Text as="div" size="1" color="gray">
          {row.category}
        </Text>
      ) : null}
    </>
  )
}

function TownHall({ row, q }: { row: ProjectRow; q: string | undefined }) {
  const { t } = useI18n()
  return (
    <>
      <Text as="div" size="2">
        <Marked text={row.town_hall} q={q} />
      </Text>
      <Text as="div" size="1" color="gray">
        {t.programme.countyOf(row.county_name)}
      </Text>
    </>
  )
}

function Value({ row }: { row: ProjectRow }) {
  const { f } = useI18n()
  return row.total_value === null ? (
    <DataState kind="notPublished" />
  ) : (
    <>{f.lei(row.total_value)}</>
  )
}

function Paid({ row }: { row: ProjectRow }) {
  const { t, f } = useI18n()
  return (
    <>
      <Text as="div" size="2">
        {f.lei(row.paid)}
      </Text>
      <Text as="div" size="1" color="gray">
        {t.programme.payments(row.payments, f.count(row.payments))}
      </Text>
    </>
  )
}
