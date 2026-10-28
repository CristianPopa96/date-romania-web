import { Link as RouterLink } from '@tanstack/react-router'
import { Code, Flex, Heading, Link, Table, Text } from '@radix-ui/themes'

import { DataState } from '#/components/DataState'
import { EntityLink } from '#/components/EntityLink'
import { useI18n } from '#/i18n/context'
import type { TraceBuilder, TraceContract } from '#/features/programme/api'
import {
  isAssociation,
  partnerNames,
  weakest,
} from '#/features/programme/programme'

// The contracts a builder's payments were tied to: the one found, or every candidate
// when the files do not say which one is paid. Each row says what its link rests on:
// none is sure.
export function ProjectContracts({ builder }: { builder: TraceBuilder }) {
  const { t, f } = useI18n()
  const p = t.programme
  if (builder.contracts.length === 0) return null
  const missing = <DataState kind="notPublished" />

  return (
    <Flex direction="column" gap="3">
      <Heading as="h3" size="4">
        {builder.match === 'several'
          ? p.contractsTitle
          : p.contractTitle[weakest(builder.contracts) ?? 'probable']}
      </Heading>
      <Text size="2" color="gray" style={{ maxWidth: '75ch' }}>
        {builder.match === 'several' ? p.contractsLead : p.contractLead}
      </Text>
      <Table.Root variant="surface" size="1">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>{p.notice}</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>{p.contractNo}</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>{p.signed}</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>{p.procedure}</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell justify="end">
              {p.value}
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell justify="end">
              {p.ofProject}
            </Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {builder.contracts.map((contract, index) => {
            const partners = partnerNames(contract)
            return (
              // A contract can lack its number; its place in the list tells it apart.
              <Table.Row key={index}>
                <Table.RowHeaderCell>
                  <Notice contract={contract} />
                </Table.RowHeaderCell>
                <Table.Cell style={{ maxWidth: '44ch' }}>
                  <Text as="div">
                    {contract.contract_no ?? missing}
                    {contract.lot ? ` · ${p.lot(contract.lot)}` : null}
                  </Text>
                  {contract.title ? (
                    <Text as="div" size="1" color="gray">
                      {contract.title}
                    </Text>
                  ) : null}
                  {isAssociation(contract) ? (
                    <Text as="div" size="1" color="gray">
                      {partners.length > 0
                        ? p.association(f.list(partners))
                        : p.associationUnnamed}
                    </Text>
                  ) : null}
                  {contract.is_framework ? (
                    <Text as="div" size="1" color="gray">
                      {p.framework}
                    </Text>
                  ) : null}
                  <Text as="div" size="1" color="gray">
                    {p.evidence[contract.method] ??
                      p.confidence[contract.confidence]}
                  </Text>
                </Table.Cell>
                <Table.Cell style={{ whiteSpace: 'nowrap' }}>
                  {contract.contract_date
                    ? f.day(contract.contract_date)
                    : missing}
                </Table.Cell>
                <Table.Cell>
                  <Text as="div">{contract.procedure_type ?? missing}</Text>
                  {contract.buyer ? (
                    <Text as="div" size="1">
                      <EntityLink role="institutions" cui={contract.buyer.cui}>
                        {contract.buyer.name}
                      </EntityLink>
                    </Text>
                  ) : (
                    <Text as="div" size="1" color="gray">
                      {contract.buyer_text}
                    </Text>
                  )}
                </Table.Cell>
                <Table.Cell justify="end" style={{ whiteSpace: 'nowrap' }}>
                  {contract.value_ron !== null
                    ? f.lei(contract.value_ron)
                    : missing}
                </Table.Cell>
                <Table.Cell justify="end">
                  {/* A ceiling is not compared with what the project costs. */}
                  {contract.ratio !== null && !contract.is_framework
                    ? f.percent(contract.ratio)
                    : null}
                </Table.Cell>
              </Table.Row>
            )
          })}
        </Table.Body>
      </Table.Root>
    </Flex>
  )
}

// The notice opens on its page when we collected it ourselves; else its number is text.
function Notice({ contract }: { contract: TraceContract }) {
  if (contract.notice_no === null) return <DataState kind="notPublished" />
  const number = <Code variant="ghost">{contract.notice_no}</Code>
  if (contract.notice_id === null) return number
  return (
    <Link asChild>
      <RouterLink
        to="/contracte/$id"
        params={{ id: String(contract.notice_id) }}
      >
        {number}
      </RouterLink>
    </Link>
  )
}
