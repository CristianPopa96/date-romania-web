import { useSuspenseQuery } from '@tanstack/react-query'
import { ExternalLinkIcon } from '@radix-ui/react-icons'
import {
  Badge,
  Box,
  Button,
  Code,
  Flex,
  Heading,
  Link,
  SegmentedControl,
  Table,
  Text,
} from '@radix-ui/themes'

import { EntityLink } from '#/components/EntityLink'
import { ACCEPTED, PAGE_SIZE } from '#/lib/api'
import type { Purchase, Role } from '#/lib/api'
import { count, day, lei } from '#/lib/format'
import { purchasesQuery } from '#/lib/queries'
import type { EntitySearch } from '#/lib/urls'

// SEAP's states in the words a citizen would use. Green marks a finished deal, not a verdict.
const STATES: Record<number, string> = {
  3: 'Refuzată de furnizor',
  4: 'Fără răspuns de la furnizor',
  6: 'Refuzată de instituție',
  7: 'Ofertă acceptată',
  8: 'Fără răspuns de la instituție',
}

// The column that names the other side of each purchase.
const OTHER_SIDE = { institutions: 'Furnizor', suppliers: 'Instituție' }

// The direct purchases of one institution or supplier, a page at a time.
export function PurchaseTable({
  role,
  cui,
  search,
  onSearch,
}: {
  role: Role
  cui: number
  search: EntitySearch
  onSearch: (search: EntitySearch) => void
}) {
  const page = search.pagina ?? 1
  const byValue = search.ordine === 'valoare'
  const { data: purchases } = useSuspenseQuery(
    purchasesQuery(role, cui, page, byValue),
  )
  const other: Role = role === 'institutions' ? 'suppliers' : 'institutions'
  const pages = Math.max(Math.ceil(purchases.total / PAGE_SIZE), 1)

  return (
    <Flex direction="column" gap="3">
      <Flex justify="between" align="center" gap="3" wrap="wrap">
        <Heading size="4">
          {byValue ? 'Achiziții directe acceptate' : 'Achiziții directe'} (
          {count(purchases.total)})
        </Heading>
        <SegmentedControl.Root
          size="1"
          value={byValue ? 'valoare' : 'recente'}
          onValueChange={(value) =>
            onSearch({
              ordine: value === 'valoare' ? 'valoare' : undefined,
            })
          }
        >
          <SegmentedControl.Item value="recente">
            Cele mai recente
          </SegmentedControl.Item>
          <SegmentedControl.Item value="valoare">
            Cele mai mari acceptate
          </SegmentedControl.Item>
        </SegmentedControl.Root>
      </Flex>

      <Table.Root variant="surface" size="1">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>Data</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Achiziție</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>{OTHER_SIDE[role]}</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Stare</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell justify="end">
              Valoare
            </Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {purchases.items.map((purchase) => (
            <PurchaseRow key={purchase.id} purchase={purchase} other={other} />
          ))}
        </Table.Body>
      </Table.Root>

      {pages > 1 ? (
        <Flex justify="between" align="center">
          <Button
            variant="soft"
            disabled={page <= 1}
            onClick={() =>
              onSearch({
                ...search,
                pagina: page > 2 ? page - 1 : undefined,
              })
            }
          >
            Înapoi
          </Button>
          <Text size="2" color="gray">
            Pagina {count(page)} din {count(pages)}
          </Text>
          <Button
            variant="soft"
            disabled={page >= pages}
            onClick={() => onSearch({ ...search, pagina: page + 1 })}
          >
            Înainte
          </Button>
        </Flex>
      ) : null}
    </Flex>
  )
}

function PurchaseRow({ purchase, other }: { purchase: Purchase; other: Role }) {
  const party = other === 'suppliers' ? purchase.supplier : purchase.buyer
  const partyText =
    other === 'suppliers' ? purchase.supplier_text : purchase.buyer_text
  const accepted = purchase.state_id === ACCEPTED

  return (
    <Table.Row>
      <Table.Cell style={{ whiteSpace: 'nowrap' }}>
        {purchase.finalized_at ? day(purchase.finalized_at) : 'Nepublicat'}
      </Table.Cell>
      <Table.Cell>
        <Box style={{ maxWidth: 360 }}>
          <Text as="div" size="2">
            {purchase.name ?? 'Nepublicat'}
          </Text>
          <Flex gap="2" align="center" wrap="wrap">
            {purchase.source.url ? (
              <Link
                href={purchase.source.url}
                target="_blank"
                rel="noreferrer"
                size="1"
              >
                <Flex align="center" gap="1">
                  <ExternalLinkIcon />
                  <Code variant="ghost">{purchase.code}</Code> în SEAP
                </Flex>
              </Link>
            ) : null}
            {purchase.cpv_code ? (
              <Text size="1" color="gray">
                CPV <Code variant="ghost">{purchase.cpv_code}</Code>
              </Text>
            ) : null}
          </Flex>
        </Box>
      </Table.Cell>
      <Table.Cell>
        {party ? (
          <EntityLink role={other} cui={party.cui}>
            {party.name}
          </EntityLink>
        ) : (
          (partyText ?? 'Nepublicat')
        )}
      </Table.Cell>
      <Table.Cell>
        <Badge color={accepted ? 'green' : 'gray'}>
          {(purchase.state_id && STATES[purchase.state_id]) ||
            purchase.state ||
            'Nepublicat'}
        </Badge>
      </Table.Cell>
      <Table.Cell justify="end" style={{ whiteSpace: 'nowrap' }}>
        {purchase.value === null ? (
          'Nepublicat'
        ) : accepted ? (
          lei(purchase.value)
        ) : (
          // An offer that was refused or never answered is not money spent.
          <Text color="gray">{lei(purchase.value)}</Text>
        )}
        {!accepted && purchase.value !== null ? (
          <Text as="div" size="1" color="gray">
            neacceptată, nu intră în total
          </Text>
        ) : null}
        {accepted && purchase.above_limit ? (
          <Text as="div" size="1" color="amber">
            peste plafon, nu intră în total
          </Text>
        ) : null}
      </Table.Cell>
    </Table.Row>
  )
}
