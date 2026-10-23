import { useState } from 'react'
import { Link as RouterLink } from '@tanstack/react-router'
import { MagnifyingGlassIcon } from '@radix-ui/react-icons'
import {
  Button,
  Code,
  Flex,
  Heading,
  Link,
  Select,
  Table,
  Text,
  TextField,
} from '@radix-ui/themes'

import { DataState } from '#/components/DataState'
import { Pager } from '#/components/Pager'
import { PnrrStatusBadge } from '#/components/PnrrTables'
import { useI18n } from '#/i18n/context'
import { PAGE_SIZE } from '#/lib/api'
import { PNRR_STATUSES } from '#/lib/api-pnrr'
import type { PnrrContractPage, PnrrMeasure } from '#/lib/api-pnrr'
import { pageCount } from '#/lib/contracts'
import { countySlug } from '#/lib/pnrr'
import { PNRR_STATUS_PARAMS } from '#/lib/urls-programmes'
import type { PnrrSearch, PnrrStatusParam } from '#/lib/urls-programmes'

const ALL = 'toate'

// The contracts of one measure: by county, by status, by words in the title or the
// beneficiary's name. Natural persons' are never listed; the measure's figures say how
// many there are.
export function PnrrContractFinder({
  measure,
  contracts,
  search,
  onSearch,
}: {
  measure: PnrrMeasure
  contracts: PnrrContractPage
  search: PnrrSearch
  onSearch: (next: PnrrSearch) => void
}) {
  const { t, f } = useI18n()
  const p = t.pnrr
  const [q, setQ] = useState(search.q ?? '')
  const change = (patch: PnrrSearch) =>
    onSearch({ ...search, ...patch, pagina: undefined })
  const pages = pageCount(contracts.total, PAGE_SIZE)

  return (
    <Flex direction="column" gap="3">
      <Flex justify="between" align="center" gap="3" wrap="wrap">
        <Heading as="h2" size="5">
          {p.findTitle}
        </Heading>
        <Flex gap="2" align="center" wrap="wrap">
          <Select.Root
            value={search.judet ?? ALL}
            onValueChange={(value) =>
              change({ judet: value === ALL ? undefined : value })
            }
          >
            <Select.Trigger aria-label={p.county} />
            <Select.Content>
              <Select.Item value={ALL}>{p.allCounties}</Select.Item>
              {measure.counties.map((county) => (
                <Select.Item key={county} value={countySlug(county)}>
                  {county}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
          <Select.Root
            value={search.stare ?? ALL}
            onValueChange={(value) =>
              change({
                stare: value === ALL ? undefined : (value as PnrrStatusParam),
              })
            }
          >
            <Select.Trigger aria-label={p.state} />
            <Select.Content>
              <Select.Item value={ALL}>{p.allStatuses}</Select.Item>
              {PNRR_STATUSES.map((status) => (
                <Select.Item key={status} value={PNRR_STATUS_PARAMS[status]}>
                  {p.status[status]}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
          <form
            role="search"
            aria-label={p.searchLabel}
            onSubmit={(event) => {
              event.preventDefault()
              const words = q.trim()
              change({ q: words.length >= 2 ? words : undefined })
            }}
          >
            <Flex gap="2">
              <TextField.Root
                value={q}
                onChange={(event) => setQ(event.target.value)}
                placeholder={p.searchPlaceholder}
                aria-label={p.searchLabel}
                style={{ width: 220, maxWidth: '60vw' }}
              >
                <TextField.Slot>
                  <MagnifyingGlassIcon height="16" width="16" />
                </TextField.Slot>
              </TextField.Root>
              <Button type="submit" variant="soft">
                {t.common.search}
              </Button>
            </Flex>
          </form>
        </Flex>
      </Flex>

      {contracts.items.length === 0 ? (
        <Text size="2" color="gray">
          {p.noContracts}
        </Text>
      ) : (
        <Table.Root variant="surface" size="1">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>{p.contract}</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>{p.beneficiary}</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell justify="end">
                {p.value}
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>{p.state}</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell justify="end">
                {p.physical}
              </Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {contracts.items.map((row) => (
              <Table.Row key={row.id}>
                <Table.RowHeaderCell>
                  <Link asChild>
                    <RouterLink
                      to="/programe/pnrr/contracte/$id"
                      params={{ id: String(row.id) }}
                    >
                      {row.title ?? p.fallbackTitle}
                    </RouterLink>
                  </Link>
                  {row.number ? (
                    <Text as="div" size="1" color="gray">
                      <Code variant="ghost">{row.number}</Code>
                      {row.county ? ` · ${row.county}` : ''}
                    </Text>
                  ) : null}
                </Table.RowHeaderCell>
                <Table.Cell>
                  {row.beneficiary?.name ?? <DataState kind="notPublished" />}
                </Table.Cell>
                <Table.Cell justify="end">
                  {row.total === null ? (
                    <DataState kind="notPublished" />
                  ) : (
                    f.lei(row.total)
                  )}
                </Table.Cell>
                <Table.Cell>
                  {row.status ? (
                    <PnrrStatusBadge status={row.status} />
                  ) : (
                    // Its measures disagree: the contract's page shows each.
                    <Text size="1" color="gray">
                      {p.byMeasure}
                    </Text>
                  )}
                </Table.Cell>
                <Table.Cell justify="end">
                  {row.physical_progress === null ? (
                    <Text size="1" color="gray">
                      {p.byMeasure}
                    </Text>
                  ) : (
                    f.percent(row.physical_progress)
                  )}
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      )}
      <Pager
        page={search.pagina ?? 1}
        pages={pages}
        onPage={(pagina) => onSearch({ ...search, pagina })}
      />
    </Flex>
  )
}
