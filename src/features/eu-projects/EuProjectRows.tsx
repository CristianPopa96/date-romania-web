import { Link as RouterLink } from '@tanstack/react-router'
import { Box, Code, Flex, Link, Text } from '@radix-ui/themes'

import { ConfidenceBadge } from '#/components/ConfidenceBadge'
import { DataState } from '#/components/DataState'
import { ListRows } from '#/components/list/ListRows'
import type { Column } from '#/components/list/ListRows'
import { EuStatusBadge } from '#/features/eu-projects/EuProjectFacts'
import type { EuProjectRow } from '#/features/eu-projects/api'
import { beneficiaryTie } from '#/features/eu-projects/eu'
import { useI18n } from '#/i18n/context'
import { marks } from '#/lib/list'
import type { Sort } from '#/lib/list'

// The rows of a list of EU projects, declared to ListRows: the project (it opens its page),
// its value and what was paid up to its list's day, its status as the list gives it, and
// how the project was tied to the beneficiary.
export function EuProjectRows({
  items,
  q,
  sort,
  onSort,
  total,
}: {
  items: Array<EuProjectRow>
  q: string | undefined
  sort: Sort
  onSort: (sort: Sort | null) => void
  total: { label: string; value: string } | null
}) {
  const { t } = useI18n()
  const e = t.eu
  const columns: Array<Column<EuProjectRow>> = [
    {
      key: 'proiect',
      header: e.project,
      maxWidth: 380,
      cell: (row) => <Title row={row} q={q} />,
    },
    {
      key: 'valoare',
      header: e.value,
      sort: { column: 'valoare' },
      align: 'end',
      nowrap: true,
      cell: (row) => <Money value={row.total} />,
    },
    {
      key: 'platit',
      header: e.paid,
      sort: { column: 'platit' },
      align: 'end',
      nowrap: true,
      cell: (row) => <Money value={row.paid} />,
    },
    {
      key: 'stare',
      header: e.state,
      cell: (row) => (
        <EuStatusBadge status={row.status} written={row.status_written} />
      ),
    },
    {
      key: 'legatura',
      header: e.held.tie,
      cell: (row) => <Tie row={row} />,
    },
  ]
  return (
    <ListRows
      columns={columns}
      rows={items}
      rowKey={(row) => row.smis}
      sort={sort}
      onSort={onSort}
      total={total}
      card={(row) => (
        <Flex justify="between" gap="3">
          <Box minWidth="0">
            <Title row={row} q={q} />
            <Flex gap="2" mt="1" wrap="wrap">
              <EuStatusBadge status={row.status} written={row.status_written} />
              <Tie row={row} />
            </Flex>
          </Box>
          <Box style={{ whiteSpace: 'nowrap', textAlign: 'right' }}>
            <Money value={row.total} />
            <Text as="div" size="1" color="gray">
              {e.paid} <Money value={row.paid} />
            </Text>
          </Box>
        </Flex>
      )}
    />
  )
}

function Title({ row, q }: { row: EuProjectRow; q: string | undefined }) {
  const { t } = useI18n()
  return (
    <>
      <Text as="div" size="2">
        <Link asChild>
          <RouterLink
            to="/proiecte/fonduri-europene/$smis"
            params={{ smis: String(row.smis) }}
          >
            {row.title
              ? marks(row.title, q).map((part, index) =>
                  part.mark ? (
                    <mark key={index} className="dr-mark">
                      {part.text}
                    </mark>
                  ) : (
                    part.text
                  ),
                )
              : t.eu.fallbackTitle}
          </RouterLink>
        </Link>
      </Text>
      <Text as="div" size="1" color="gray">
        <Code variant="ghost">{t.eu.smis(String(row.smis))}</Code>
        {` · ${row.programme}`}
      </Text>
    </>
  )
}

function Money({ value }: { value: number | null }) {
  const { f } = useI18n()
  return value === null ? (
    <DataState kind="notPublished" />
  ) : (
    <>{f.lei(value)}</>
  )
}

function Tie({ row }: { row: EuProjectRow }) {
  const { t } = useI18n()
  const tie = beneficiaryTie(row.beneficiary)
  return (
    <ConfidenceBadge
      level={tie.level}
      label={t.eu.tie[tie.label]}
      help={t.eu.tieHelp[tie.label]}
    />
  )
}
