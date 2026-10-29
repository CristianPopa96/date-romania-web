import { Link as RouterLink } from '@tanstack/react-router'
import { Box, Code, Flex, Link, Text } from '@radix-ui/themes'

import { DataState } from '#/components/DataState'
import { EntityLink } from '#/components/EntityLink'
import { ListRows } from '#/components/list/ListRows'
import type { Column } from '#/components/list/ListRows'
import { Winners } from '#/features/contracts/Winners'
import type { Contract } from '#/features/contracts/api'
import { shownValue } from '#/features/contracts/contracts'
import { useI18n } from '#/i18n/context'
import { rich } from '#/i18n/rich'
import type { Role } from '#/lib/api'
import { marks } from '#/lib/list'
import type { Sort } from '#/lib/list'

// The rows of a list of contracts, declared to ListRows: the day signed, the contract (it
// opens its award notice: a contract has no page of its own), the other party (the
// winners on an institution's page, the buyer on a company's) and the value. On a phone a
// card per contract with its value on the right.
export function ContractRows({
  role,
  items,
  q,
  sort,
  onSort,
  total,
}: {
  role: Role
  items: Array<Contract>
  q: string | undefined
  sort: Sort
  onSort: (sort: Sort | null) => void
  total: { label: string; value: string } | null
}) {
  const { t } = useI18n()
  const columns: Array<Column<Contract>> = [
    {
      key: 'data',
      header: t.contracts.date,
      sort: { column: 'data' },
      nowrap: true,
      cell: (contract) => <Day contract={contract} />,
    },
    {
      key: 'contract',
      header: t.contracts.contract,
      maxWidth: 360,
      cell: (contract) => <Title contract={contract} q={q} />,
    },
    {
      key: 'parte',
      header: role === 'institutions' ? t.contracts.winner : t.contracts.buyer,
      sort: {
        column: role === 'institutions' ? 'furnizor' : 'institutie',
        text: true,
      },
      cell: (contract) => <Party contract={contract} role={role} />,
    },
    {
      key: 'valoare',
      header: t.contracts.value,
      sort: { column: 'valoare' },
      align: 'end',
      nowrap: true,
      cell: (contract) => <Value contract={contract} />,
    },
  ]
  return (
    <ListRows
      columns={columns}
      rows={items}
      rowKey={(contract) => contract.id}
      sort={sort}
      onSort={onSort}
      total={total}
      card={(contract) => (
        <Flex justify="between" gap="3">
          <Box minWidth="0">
            <Title contract={contract} q={q} />
            <Text as="div" size="1" color="gray" mt="1">
              <Day contract={contract} />
            </Text>
            <Box mt="1">
              <Party contract={contract} role={role} />
            </Box>
          </Box>
          <Box style={{ whiteSpace: 'nowrap', textAlign: 'right' }}>
            <Value contract={contract} />
          </Box>
        </Flex>
      )}
    />
  )
}

function Day({ contract }: { contract: Contract }) {
  const { f } = useI18n()
  return contract.signed_at ? (
    <>{f.day(contract.signed_at)}</>
  ) : (
    <DataState kind="notPublished" />
  )
}

// The title with the words searched marked, then its notice number, CPV code and, for a
// subsequent contract, what it is.
function Title({ contract, q }: { contract: Contract; q: string | undefined }) {
  const { t } = useI18n()
  const title =
    contract.title ??
    contract.notice_title ??
    (contract.contract_no
      ? t.notice.contractNo(contract.contract_no)
      : t.notice.fallbackTitle)
  return (
    <>
      <Text as="div" size="2">
        <Link asChild>
          <RouterLink
            to="/contracte/$id"
            params={{ id: String(contract.notice_id) }}
          >
            {marks(title, q).map((part, index) =>
              part.mark ? (
                <mark key={index} className="dr-mark">
                  {part.text}
                </mark>
              ) : (
                part.text
              ),
            )}
          </RouterLink>
        </Link>
      </Text>
      <Text as="div" size="1" color="gray">
        {contract.notice_no ? (
          <Code variant="ghost">{contract.notice_no}</Code>
        ) : null}
        {contract.notice_no && contract.cpv_code ? ' · ' : null}
        {contract.cpv_code
          ? rich(t.common.cpv, {
              code: (
                <Code key="code" variant="ghost">
                  {contract.cpv_code}
                </Code>
              ),
            })
          : null}
        {contract.kind === 3 ? ` · ${t.notice.kinds[3]}` : null}
      </Text>
    </>
  )
}

// The winners on an institution's page, every member of an association in SEAP's order;
// on a company's page the buyer, and its partners when it won with others.
function Party({ contract, role }: { contract: Contract; role: Role }) {
  if (role === 'institutions') return <Winners winners={contract.winners} />
  return (
    <>
      {contract.buyer ? (
        <EntityLink role="institutions" cui={contract.buyer.cui}>
          {contract.buyer.name}
        </EntityLink>
      ) : (
        (contract.buyer_text ?? <DataState kind="notPublished" />)
      )}
      {contract.winners.length > 1 ? (
        <Box mt="1">
          <Winners winners={contract.winners} />
        </Box>
      ) : null}
    </>
  )
}

function Value({ contract }: { contract: Contract }) {
  const { t, f } = useI18n()
  const shown = shownValue(contract)
  if (shown === null) return <DataState kind="notPublished" />
  // A value with no lei amount is shown as SEAP gives it, out of every sum.
  return shown.currency ? (
    <>
      <Text color="gray">
        {t.notice.foreign(f.count(shown.amount), shown.currency)}
      </Text>
      <Text as="div" size="1" color="gray">
        {t.notice.noLei}
      </Text>
    </>
  ) : (
    <>{f.lei(shown.amount)}</>
  )
}
