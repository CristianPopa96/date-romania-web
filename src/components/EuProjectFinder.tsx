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

import { Beneficiary, EuStatusBadge } from '#/components/EuProjectFacts'
import { DataState } from '#/components/DataState'
import { Pager } from '#/components/Pager'
import { useI18n } from '#/i18n/context'
import { PAGE_SIZE } from '#/lib/api'
import { EU_STATUSES } from '#/lib/api-eu'
import type { EuProgramme, EuProjectPage } from '#/lib/api-eu'
import { pageCount } from '#/lib/contracts'
import { periodLabel, programmeSlug } from '#/lib/eu'
import { EU_STATUS_PARAMS } from '#/lib/urls-programmes'
import type { EuSearch, EuStatusParam } from '#/lib/urls-programmes'

const ALL = 'toate'

// The projects held: by programme, by status, by words in the title or the beneficiary's
// name, or by SMIS code. The largest first.
export function EuProjectFinder({
  programmes,
  projects,
  search,
  onSearch,
}: {
  programmes: ReadonlyArray<EuProgramme>
  projects: EuProjectPage
  search: EuSearch
  onSearch: (next: EuSearch) => void
}) {
  const { t, f } = useI18n()
  const e = t.eu
  const [q, setQ] = useState(search.q ?? '')
  const change = (patch: EuSearch) =>
    onSearch({ ...search, ...patch, pagina: undefined })
  const pages = pageCount(projects.total, PAGE_SIZE)
  const money = (value: number | null) =>
    value === null ? <DataState kind="notPublished" /> : f.leiShort(value)

  return (
    <Flex direction="column" gap="3">
      <Flex justify="between" align="center" gap="3" wrap="wrap">
        <Heading as="h2" size="5">
          {e.findTitle}
        </Heading>
        <Flex gap="2" align="center" wrap="wrap">
          <Select.Root
            value={search.program ?? ALL}
            onValueChange={(value) =>
              change({ program: value === ALL ? undefined : value })
            }
          >
            <Select.Trigger aria-label={e.programme} />
            <Select.Content>
              <Select.Item value={ALL}>{e.allProgrammes}</Select.Item>
              {programmes.map((programme) => (
                <Select.Item
                  key={programme.code}
                  value={programmeSlug(programme)}
                >
                  {programme.code} {periodLabel(programme.period)}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
          <Select.Root
            value={search.stare ?? ALL}
            onValueChange={(value) =>
              change({
                stare: value === ALL ? undefined : (value as EuStatusParam),
              })
            }
          >
            <Select.Trigger aria-label={e.state} />
            <Select.Content>
              <Select.Item value={ALL}>{e.allStatuses}</Select.Item>
              {EU_STATUSES.map((status) => (
                <Select.Item key={status} value={EU_STATUS_PARAMS[status]}>
                  {e.status[status]}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
          <form
            role="search"
            aria-label={e.searchLabel}
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
                placeholder={e.searchPlaceholder}
                aria-label={e.searchLabel}
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

      <Text size="2" color="gray">
        {e.found(projects.total, f.count(projects.total))}
      </Text>
      {projects.items.length === 0 ? (
        <Text size="2" color="gray">
          {e.noProjects}
        </Text>
      ) : (
        <Table.Root variant="surface" size="1">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>{e.project}</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>{e.beneficiary}</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell justify="end">
                {e.value}
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell justify="end">
                {e.paid}
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>{e.state}</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {projects.items.map((row) => (
              <Table.Row key={row.smis}>
                <Table.RowHeaderCell>
                  <Link asChild>
                    <RouterLink
                      to="/programe/fonduri-europene/proiecte/$smis"
                      params={{ smis: String(row.smis) }}
                    >
                      {row.title ?? e.fallbackTitle}
                    </RouterLink>
                  </Link>
                  <Text as="div" size="1" color="gray">
                    <Code variant="ghost">{e.smis(String(row.smis))}</Code>
                    {` · ${row.programme}`}
                    {/* A project in many counties lists them all: left out here. */}
                    {row.county && !row.county.includes(',')
                      ? ` · ${row.county}`
                      : ''}
                  </Text>
                </Table.RowHeaderCell>
                <Table.Cell>
                  <Beneficiary beneficiary={row.beneficiary} />
                </Table.Cell>
                <Table.Cell justify="end">{money(row.total)}</Table.Cell>
                <Table.Cell justify="end">{money(row.paid)}</Table.Cell>
                <Table.Cell>
                  <EuStatusBadge
                    status={row.status}
                    written={row.status_written}
                  />
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
