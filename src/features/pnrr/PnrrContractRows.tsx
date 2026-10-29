import { Link as RouterLink } from '@tanstack/react-router'
import { Box, Code, Flex, Link, Text } from '@radix-ui/themes'

import { DataState } from '#/components/DataState'
import { EntityLink, roleOfKind } from '#/components/EntityLink'
import { ListRows } from '#/components/list/ListRows'
import type { Column } from '#/components/list/ListRows'
import { PnrrStatusBadge } from '#/features/pnrr/PnrrTables'
import type { PnrrContractRow } from '#/features/pnrr/api'
import { useI18n } from '#/i18n/context'
import { marks } from '#/lib/list'
import type { Sort } from '#/lib/list'

// The rows of a list of PNRR contracts, declared to ListRows: the contract (it opens its
// page), its value, and the status and physical progress its measures agree on ("diferă pe
// măsuri" when they do not). A measure's list also names each beneficiary.
export function PnrrContractRows({
  items,
  withBeneficiary,
  q,
  sort,
  onSort,
  total,
}: {
  items: Array<PnrrContractRow>
  withBeneficiary: boolean
  q: string | undefined
  sort: Sort
  onSort: (sort: Sort | null) => void
  total: { label: string; value: string } | null
}) {
  const { t } = useI18n()
  const p = t.pnrr
  const columns: Array<Column<PnrrContractRow>> = [
    {
      key: 'contract',
      header: p.contract,
      maxWidth: 380,
      cell: (row) => <Title row={row} q={q} />,
    },
    ...(withBeneficiary
      ? [
          {
            key: 'beneficiar',
            header: p.beneficiary,
            maxWidth: 240,
            cell: (row: PnrrContractRow) => <Beneficiary row={row} />,
          },
        ]
      : []),
    {
      key: 'valoare',
      header: p.value,
      sort: { column: 'valoare' },
      align: 'end',
      nowrap: true,
      cell: (row) => <Value row={row} />,
    },
    {
      key: 'stare',
      header: p.state,
      cell: (row) => <Status row={row} />,
    },
    {
      key: 'progres',
      header: p.physical,
      sort: { column: 'progres' },
      align: 'end',
      nowrap: true,
      cell: (row) => <Progress row={row} />,
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
            {withBeneficiary ? (
              <Text as="div" size="1" mt="1">
                <Beneficiary row={row} />
              </Text>
            ) : null}
            <Flex gap="2" mt="1" align="center" wrap="wrap">
              <Status row={row} />
              <Text size="1" color="gray">
                {p.physical} <Progress row={row} />
              </Text>
            </Flex>
          </Box>
          <Box style={{ whiteSpace: 'nowrap', textAlign: 'right' }}>
            <Value row={row} />
          </Box>
        </Flex>
      )}
    />
  )
}

function Title({ row, q }: { row: PnrrContractRow; q: string | undefined }) {
  const { t } = useI18n()
  return (
    <>
      <Text as="div" size="2">
        <Link asChild>
          <RouterLink
            to="/programe/pnrr/contracte/$id"
            params={{ id: String(row.id) }}
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
              : t.pnrr.fallbackTitle}
          </RouterLink>
        </Link>
      </Text>
      {row.number ? (
        <Text as="div" size="1" color="gray">
          <Code variant="ghost">{row.number}</Code>
          {row.county ? ` · ${row.county}` : ''}
        </Text>
      ) : null}
    </>
  )
}

// The entity held for its CUI, else the name as the dashboard writes it.
function Beneficiary({ row }: { row: PnrrContractRow }) {
  if (row.beneficiary) {
    return (
      <EntityLink
        role={roleOfKind(row.beneficiary.kind)}
        cui={row.beneficiary.cui}
      >
        {row.beneficiary.name}
      </EntityLink>
    )
  }
  return row.beneficiary_name ? (
    <>{row.beneficiary_name}</>
  ) : (
    <DataState kind="notPublished" />
  )
}

function Value({ row }: { row: PnrrContractRow }) {
  const { f } = useI18n()
  return row.total === null ? (
    <DataState kind="notPublished" />
  ) : (
    <>{f.lei(row.total)}</>
  )
}

function Status({ row }: { row: PnrrContractRow }) {
  const { t } = useI18n()
  if (row.measures_differ) {
    return (
      <Text size="1" color="gray">
        {t.pnrr.byMeasure}
      </Text>
    )
  }
  return row.status ? (
    <PnrrStatusBadge status={row.status} />
  ) : (
    <DataState kind="notPublished" />
  )
}

function Progress({ row }: { row: PnrrContractRow }) {
  const { t, f } = useI18n()
  if (row.physical_progress !== null)
    return <>{f.percent(row.physical_progress)}</>
  return row.measures_differ ? (
    <Text size="1" color="gray">
      {t.pnrr.byMeasure}
    </Text>
  ) : (
    <DataState kind="notPublished" />
  )
}
