import type { ReactNode } from 'react'
import { useRouterState } from '@tanstack/react-router'
import { DownloadIcon } from '@radix-ui/react-icons'
import {
  Box,
  Button,
  Flex,
  Heading,
  SegmentedControl,
  Text,
} from '@radix-ui/themes'

import { FilterBar } from '#/components/list/FilterBar'
import type { FilterDecl, Patch } from '#/components/list/filter-types'
import { ListPager } from '#/components/list/ListPager'
import { SortSelect } from '#/components/list/SortSelect'
import { useI18n } from '#/i18n/context'
import type { PageSize, Sort } from '#/lib/list'

// A list in the list pattern (DataTable in the design system), top to bottom: the filter
// bar, the summary line with the view switch, the file and the phone's sort select, the
// charts, the rows (or what an empty list says), the pager. A list declares what goes in
// each part; the frame lays them out the same way everywhere. Everything chosen lives in
// the address: the list turns each change into a new address.
export function ListView({
  title,
  titleAs = 'h2',
  search,
  summary,
  views,
  file,
  sort,
  charts,
  rows,
  empty,
  pager,
}: {
  // The list's heading (h2), for the page outline.
  title: string
  // h3 for a list under a tab's own heading.
  titleAs?: 'h2' | 'h3'
  search: {
    q: string | undefined
    // What the field searches in: "obiect, furnizor, cod DA"; null for a list with no
    // search by words.
    what: string | null
    filters: Array<FilterDecl>
    onApply: (patch: Patch) => void
  }
  // The count and sum for the filters chosen, and under it which part of the whole that is.
  summary: { headline: ReactNode; detail: ReactNode }
  // "Tabel și grafic / Doar tabel"; null when there is nothing to chart.
  views: { charts: boolean; onCharts: (charts: boolean) => void } | null
  file: { href: string; rows: number } | null
  sort: {
    value: Sort
    columns: Array<{ column: string; label: string }>
    isDefault: boolean
    onSort: (sort: Sort | null) => void
  }
  // Drawn only while the view shows charts.
  charts: ReactNode
  rows: ReactNode
  // Shown in place of the rows when the filters leave none.
  empty: ReactNode | null
  pager: {
    page: number
    size: PageSize
    total: number
    onPage: (page: number) => void
    onSize: (size: PageSize) => void
  }
}) {
  const { t, f } = useI18n()
  // While the next rows load, the ones shown stay, dimmed: no jump.
  const loading = useRouterState({ select: (state) => state.isLoading })
  const dim = loading ? 'dr-dim' : undefined

  return (
    <Flex direction="column" gap="4">
      <Heading as={titleAs} size="4">
        {title}
      </Heading>
      <FilterBar
        q={search.q}
        searchWhat={search.what}
        filters={search.filters}
        onApply={search.onApply}
      />

      <Flex justify="between" align="end" gap="3" wrap="wrap" className={dim}>
        <Box>
          <Text as="div" size="3" weight="medium">
            {summary.headline}
          </Text>
          <Text as="div" size="1" color="gray">
            {summary.detail}
          </Text>
        </Box>
        <Flex gap="2" align="center" wrap="wrap">
          {views ? (
            <SegmentedControl.Root
              size="1"
              aria-label={t.list.views.label}
              value={views.charts ? 'grafic' : 'tabel'}
              onValueChange={(value) => views.onCharts(value !== 'tabel')}
            >
              <SegmentedControl.Item value="grafic">
                {t.list.views.charts}
              </SegmentedControl.Item>
              <SegmentedControl.Item value="tabel">
                {t.list.views.table}
              </SegmentedControl.Item>
            </SegmentedControl.Root>
          ) : null}
          {file && file.rows > 0 ? (
            <Button asChild variant="soft" size="1">
              <a href={file.href} download>
                <DownloadIcon />
                {t.list.export(file.rows, f.count(file.rows))}
              </a>
            </Button>
          ) : null}
          <SortSelect
            sort={sort.value}
            columns={sort.columns}
            isDefault={sort.isDefault}
            onSort={sort.onSort}
          />
        </Flex>
      </Flex>

      {views?.charts ? charts : null}

      {pager.total === 0 && empty ? empty : <Box className={dim}>{rows}</Box>}

      <ListPager
        page={pager.page}
        size={pager.size}
        total={pager.total}
        onPage={pager.onPage}
        onSize={pager.onSize}
      />
    </Flex>
  )
}
