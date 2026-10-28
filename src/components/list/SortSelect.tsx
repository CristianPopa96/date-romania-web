import { Box, Select } from '@radix-ui/themes'

import { useI18n } from '#/i18n/context'
import type { Sort } from '#/lib/list'

// The order of a list on a phone, where the headers are gone: "Ordonează" with each sortable
// column both ways, and the list's own order.
export function SortSelect({
  sort,
  columns,
  isDefault,
  onSort,
}: {
  sort: Sort
  columns: Array<{ column: string; label: string }>
  // The list is in its own order: the select says so rather than naming a column.
  isDefault: boolean
  onSort: (sort: Sort | null) => void
}) {
  const { t } = useI18n()
  return (
    <Box display={{ initial: 'block', sm: 'none' }}>
      <Select.Root
        size="1"
        value={isDefault ? 'default' : `${sort.column}:${sort.dir}`}
        onValueChange={(next) => {
          if (next === 'default') return onSort(null)
          const [column, dir] = next.split(':')
          onSort({ column, dir: dir === 'asc' ? 'asc' : 'desc' })
        }}
      >
        <Select.Trigger aria-label={t.list.sort.label} />
        <Select.Content>
          <Select.Item value="default">{t.list.sort.default}</Select.Item>
          {columns.flatMap(({ column, label }) => [
            <Select.Item key={`${column}:desc`} value={`${column}:desc`}>
              {t.list.sort.desc(label)}
            </Select.Item>,
            <Select.Item key={`${column}:asc`} value={`${column}:asc`}>
              {t.list.sort.asc(label)}
            </Select.Item>,
          ])}
        </Select.Content>
      </Select.Root>
    </Box>
  )
}
