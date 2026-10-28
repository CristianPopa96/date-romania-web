import type { ReactNode } from 'react'
import { Box, Card, Flex, Table, Text } from '@radix-ui/themes'

import { SortHeader } from '#/components/list/SortHeader'
import type { Sort } from '#/lib/list'

// One column of a list. `sort` names the column in the address when it sorts; a text
// column sorts A to Z first. Numbers align right.
export type Column<TRow> = {
  key: string
  header: ReactNode
  sort?: { column: string; text?: boolean }
  align?: 'end'
  // Dates and amounts stay on one line; a long title wraps within `maxWidth`.
  nowrap?: boolean
  maxWidth?: number
  cell: (row: TRow) => ReactNode
}

// The rows of a list (DataTable in the design system): a table with sortable headers, and
// on a phone one card per row. `total` is the row under the table, given only when every
// row is one kind of money.
export function ListRows<TRow>({
  columns,
  rows,
  rowKey,
  card,
  sort,
  onSort,
  total,
}: {
  columns: Array<Column<TRow>>
  rows: Array<TRow>
  rowKey: (row: TRow) => string | number
  card: (row: TRow) => ReactNode
  sort: Sort
  onSort: (sort: Sort | null) => void
  total: { label: string; value: string } | null
}) {
  return (
    <>
      <Box display={{ initial: 'none', sm: 'block' }}>
        <Table.Root variant="surface" size="1">
          <Table.Header>
            <Table.Row>
              {columns.map((column) =>
                column.sort ? (
                  <SortHeader
                    key={column.key}
                    column={column.sort.column}
                    sort={sort}
                    text={column.sort.text}
                    justify={column.align}
                    onSort={onSort}
                  >
                    {column.header}
                  </SortHeader>
                ) : (
                  <Table.ColumnHeaderCell
                    key={column.key}
                    justify={column.align}
                  >
                    {column.header}
                  </Table.ColumnHeaderCell>
                ),
              )}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {rows.map((row) => (
              <Table.Row key={rowKey(row)}>
                {columns.map((column) => (
                  <Table.Cell
                    key={column.key}
                    justify={column.align}
                    style={column.nowrap ? { whiteSpace: 'nowrap' } : undefined}
                  >
                    {column.maxWidth ? (
                      <Box style={{ maxWidth: column.maxWidth }}>
                        {column.cell(row)}
                      </Box>
                    ) : (
                      column.cell(row)
                    )}
                  </Table.Cell>
                ))}
              </Table.Row>
            ))}
            {total ? (
              <Table.Row>
                <Table.Cell colSpan={columns.length - 1}>
                  <Text weight="medium">{total.label}</Text>
                </Table.Cell>
                <Table.Cell justify="end" style={{ whiteSpace: 'nowrap' }}>
                  <Text weight="bold">{total.value}</Text>
                </Table.Cell>
              </Table.Row>
            ) : null}
          </Table.Body>
        </Table.Root>
      </Box>
      <Flex
        direction="column"
        gap="2"
        display={{ initial: 'flex', sm: 'none' }}
      >
        {rows.map((row) => (
          <Card key={rowKey(row)} size="1">
            {card(row)}
          </Card>
        ))}
        {total ? (
          <Flex justify="between" gap="3" px="2">
            <Text size="2" weight="medium">
              {total.label}
            </Text>
            <Text size="2" weight="bold">
              {total.value}
            </Text>
          </Flex>
        ) : null}
      </Flex>
    </>
  )
}
