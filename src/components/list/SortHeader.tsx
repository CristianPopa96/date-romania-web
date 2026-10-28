import { Table } from '@radix-ui/themes'

import { nextSort } from '#/lib/list'
import type { Sort } from '#/lib/list'

// A column header that sorts the whole list (Table in the design system): descending
// first (A to Z for text), then the other way, then back to the list's own order. The
// sorted column is indigo with its arrow, and says so to a screen reader with aria-sort.
export function SortHeader({
  column,
  sort,
  text = false,
  justify,
  onSort,
  children,
}: {
  column: string
  sort: Sort
  text?: boolean
  justify?: 'end'
  onSort: (sort: Sort | null) => void
  children: React.ReactNode
}) {
  const on = sort.column === column
  return (
    <Table.ColumnHeaderCell
      justify={justify}
      aria-sort={
        on ? (sort.dir === 'asc' ? 'ascending' : 'descending') : undefined
      }
    >
      <button
        type="button"
        className="dr-sort"
        onClick={() => onSort(nextSort(on ? sort : null, column, text))}
      >
        {children}
      </button>
    </Table.ColumnHeaderCell>
  )
}
