import { Link as RouterLink } from '@tanstack/react-router'
import { Box, Code, Link, Table, Text } from '@radix-ui/themes'

import { DataState } from '#/components/DataState'
import { EntityLink } from '#/components/EntityLink'
import { Winners } from '#/features/contracts/Winners'
import { useI18n } from '#/i18n/context'
import { rich } from '#/i18n/rich'
import type { Contract } from '#/features/contracts/api'

// The largest contracts signed in the period we hold, one row each, for the rankings: place,
// contract, buyer, winner, value, day. A row opens its award notice, since SEAP publishes
// notices and a contract has no page of its own. An entity's contracts are a list of their
// own (ContractList).
export function ContractTable({ contracts }: { contracts: Array<Contract> }) {
  const { t } = useI18n()

  return (
    <Table.Root variant="surface" size="1">
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeaderCell justify="end">
            {t.contracts.rank}
          </Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>
            {t.contracts.contract}
          </Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>{t.contracts.buyer}</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>{t.contracts.winner}</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell justify="end">
            {t.contracts.value}
          </Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>{t.contracts.date}</Table.ColumnHeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {contracts.map((contract, index) => (
          <ContractRow key={contract.id} contract={contract} rank={index + 1} />
        ))}
      </Table.Body>
    </Table.Root>
  )
}

function ContractRow({ contract, rank }: { contract: Contract; rank: number }) {
  const { t, f } = useI18n()

  return (
    <Table.Row>
      <Table.Cell justify="end">
        <Text color="gray">{f.count(rank)}</Text>
      </Table.Cell>
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
      <Table.Cell>
        {contract.buyer ? (
          <EntityLink role="institutions" cui={contract.buyer.cui}>
            {contract.buyer.name}
          </EntityLink>
        ) : (
          (contract.buyer_text ?? <DataState kind="notPublished" />)
        )}
      </Table.Cell>
      <Table.Cell>
        <Winners winners={contract.winners} />
      </Table.Cell>
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
