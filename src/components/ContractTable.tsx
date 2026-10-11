import { Link as RouterLink } from '@tanstack/react-router'
import { Badge, Box, Code, Link, Table, Text } from '@radix-ui/themes'

import { DataState } from '#/components/DataState'
import { EntityLink } from '#/components/EntityLink'
import { Winners } from '#/components/Winners'
import { useI18n } from '#/i18n/context'
import { rich } from '#/i18n/rich'
import type { Contract } from '#/lib/api-contracts'
import { isAssociation } from '#/lib/contracts'

// Whose list it is decides which side of a contract a row has to name:
//   'institutions'  the contracts a buyer awarded: winner and procedure
//   'suppliers'     the contracts a company won: buyer, and whether alone
//   'ranking'       the largest of all: place, buyer and winner
type View = 'institutions' | 'suppliers' | 'ranking'

// Contracts signed in the period we hold, one row each. A row opens its award notice,
// since SEAP publishes notices and a contract has no page of its own.
export function ContractTable({
  contracts,
  view,
}: {
  contracts: Array<Contract>
  view: View
}) {
  const { t } = useI18n()

  return (
    <Table.Root variant="surface" size="1">
      <Table.Header>
        <Table.Row>
          {view === 'ranking' ? (
            <Table.ColumnHeaderCell justify="end">
              {t.contracts.rank}
            </Table.ColumnHeaderCell>
          ) : null}
          <Table.ColumnHeaderCell>
            {view === 'ranking' ? t.contracts.contract : t.contracts.object}
          </Table.ColumnHeaderCell>
          {view !== 'institutions' ? (
            <Table.ColumnHeaderCell>{t.contracts.buyer}</Table.ColumnHeaderCell>
          ) : null}
          {view === 'institutions' ? (
            <Table.ColumnHeaderCell>
              {t.contracts.supplier}
            </Table.ColumnHeaderCell>
          ) : null}
          {view === 'ranking' ? (
            <Table.ColumnHeaderCell>
              {t.contracts.winner}
            </Table.ColumnHeaderCell>
          ) : null}
          {view === 'institutions' ? (
            <Table.ColumnHeaderCell>
              {t.contracts.procedure}
            </Table.ColumnHeaderCell>
          ) : null}
          {view === 'suppliers' ? (
            <Table.ColumnHeaderCell>{t.contracts.won}</Table.ColumnHeaderCell>
          ) : null}
          <Table.ColumnHeaderCell justify="end">
            {t.contracts.value}
          </Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>{t.contracts.date}</Table.ColumnHeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {contracts.map((contract, index) => (
          <ContractRow
            key={contract.id}
            contract={contract}
            view={view}
            rank={index + 1}
          />
        ))}
      </Table.Body>
    </Table.Root>
  )
}

function ContractRow({
  contract,
  view,
  rank,
}: {
  contract: Contract
  view: View
  rank: number
}) {
  const { t, f } = useI18n()

  return (
    <Table.Row>
      {view === 'ranking' ? (
        <Table.Cell justify="end">
          <Text color="gray">{f.count(rank)}</Text>
        </Table.Cell>
      ) : null}
      <Table.Cell>
        <Box style={{ minWidth: 220, maxWidth: 340 }}>
          <Text as="div" size="2">
            <Link asChild>
              <RouterLink
                to="/contracte/$id"
                params={{ id: String(contract.notice_id) }}
              >
                {contract.title ??
                  contract.notice_title ??
                  (contract.contract_no
                    ? t.notice.contractNo(contract.contract_no)
                    : t.notice.fallbackTitle)}
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
          </Text>
        </Box>
      </Table.Cell>
      {view !== 'institutions' ? (
        <Table.Cell>
          {contract.buyer ? (
            <EntityLink role="institutions" cui={contract.buyer.cui}>
              {contract.buyer.name}
            </EntityLink>
          ) : (
            (contract.buyer_text ?? <DataState kind="notPublished" />)
          )}
        </Table.Cell>
      ) : null}
      {view !== 'suppliers' ? (
        <Table.Cell>
          <Winners winners={contract.winners} />
        </Table.Cell>
      ) : null}
      {view === 'institutions' ? (
        <Table.Cell>
          {contract.procedure_type ? (
            <Badge color="gray">{contract.procedure_type}</Badge>
          ) : (
            <DataState kind="notPublished" />
          )}
        </Table.Cell>
      ) : null}
      {view === 'suppliers' ? (
        <Table.Cell>
          {isAssociation(contract) ? (
            <Badge color="gray">
              {t.notice.association(f.count(contract.winners.length))}
            </Badge>
          ) : (
            <Text color="gray">{t.contracts.alone}</Text>
          )}
        </Table.Cell>
      ) : null}
      <Table.Cell justify="end" style={{ whiteSpace: 'nowrap' }}>
        {contract.value === null ? (
          <DataState kind="notPublished" />
        ) : (
          f.lei(contract.value)
        )}
      </Table.Cell>
      <Table.Cell style={{ whiteSpace: 'nowrap' }}>
        {contract.signed_at ? (
          <Text color="gray">{f.day(contract.signed_at)}</Text>
        ) : (
          <DataState kind="notPublished" />
        )}
      </Table.Cell>
    </Table.Row>
  )
}
