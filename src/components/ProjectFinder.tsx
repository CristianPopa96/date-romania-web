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

import { MatchBadge } from '#/components/MatchBadge'
import { Pager } from '#/components/Pager'
import { useI18n } from '#/i18n/context'
import { rich } from '#/i18n/rich'
import { PAGE_SIZE } from '#/lib/api'
import { MATCHES } from '#/lib/api-programme'
import type { Programme, ProjectPage } from '#/lib/api-programme'
import { pageCount } from '#/lib/contracts'
import { countySlug, isMatchParam, matchParam } from '#/lib/programme'
import type { ProgrammeSearch } from '#/lib/urls-programmes'

const ALL = 'toate'

// Where the list starts, so a change of filter keeps the reader at it.
export const PROJECTS_ANCHOR = 'proiecte'

// "Urmărește un proiect": pick a county, type a town hall or a kind of works, narrow by
// whether a contract was found, and open a project from the list.
export function ProjectFinder({
  programme,
  projects,
  search,
  onSearch,
}: {
  programme: Programme
  projects: ProjectPage
  search: ProgrammeSearch
  // The new address: what is left out goes back to its default.
  onSearch: (next: ProgrammeSearch) => void
}) {
  const { t, f } = useI18n()
  const p = t.programme
  const [q, setQ] = useState(search.q ?? '')
  const counties = [...programme.counties].sort((a, b) =>
    a.name.localeCompare(b.name, 'ro'),
  )
  // A new filter starts from the first page.
  const change = (patch: ProgrammeSearch) =>
    onSearch({ ...search, ...patch, pagina: undefined })

  return (
    <Flex direction="column" gap="3" id={PROJECTS_ANCHOR}>
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
              {counties.map((county) => (
                <Select.Item key={county.key} value={countySlug(county.key)}>
                  {county.name}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
          <Select.Root
            value={search.legatura ?? ALL}
            onValueChange={(value) =>
              change({
                legatura: isMatchParam(value) ? value : undefined,
              })
            }
          >
            <Select.Trigger aria-label={p.contract} />
            <Select.Content>
              <Select.Item value={ALL}>{p.allProjects}</Select.Item>
              {MATCHES.map((match) => (
                <Select.Item key={match} value={matchParam(match) ?? ALL}>
                  {p.match[match]}
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
                style={{ width: 240, maxWidth: '60vw' }}
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

      {search.firma ? (
        <Text size="2" color="gray">
          {rich(p.byBuilder, {
            cui: (
              <Code key="cui" variant="ghost">
                {rich(t.common.cui, { cui: String(search.firma) }).join('')}
              </Code>
            ),
          })}{' '}
          <Link asChild>
            <RouterLink
              to="/programe/anghel-saligny"
              hash={PROJECTS_ANCHOR}
              resetScroll={false}
            >
              {p.showAll}
            </RouterLink>
          </Link>
        </Text>
      ) : null}

      <Text size="2" color="gray" role="status">
        {projects.total === 0
          ? p.noProjects
          : p.found(projects.total, f.count(projects.total))}
      </Text>
      {projects.items.length > 0 ? (
        <Table.Root variant="surface" size="1">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>{p.project}</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>{p.townHall}</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell justify="end">
                {p.paidColumn}
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>{p.contract}</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {projects.items.map((project) => (
              <Table.Row key={project.id}>
                <Table.RowHeaderCell style={{ maxWidth: '48ch' }}>
                  <Link asChild>
                    <RouterLink
                      to="/programe/anghel-saligny/proiecte/$id"
                      params={{ id: String(project.id) }}
                    >
                      {project.investment ?? p.projectTitle(String(project.id))}
                    </RouterLink>
                  </Link>
                  <Text as="div" size="1" color="gray">
                    {project.category}
                  </Text>
                </Table.RowHeaderCell>
                <Table.Cell>
                  <Text as="div">{project.town_hall}</Text>
                  <Text as="div" size="1" color="gray">
                    {p.countyOf(project.county_name)}
                  </Text>
                </Table.Cell>
                <Table.Cell justify="end">
                  <Text as="div" style={{ whiteSpace: 'nowrap' }}>
                    {f.lei(project.paid)}
                  </Text>
                  <Text as="div" size="1" color="gray">
                    {p.payments(project.payments, f.count(project.payments))}
                  </Text>
                </Table.Cell>
                <Table.Cell>
                  <MatchBadge
                    match={project.match}
                    label={p.match[project.match]}
                  />
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      ) : null}
      <Pager
        page={search.pagina ?? 1}
        pages={pageCount(projects.total, PAGE_SIZE)}
        onPage={(page) =>
          onSearch({ ...search, pagina: page > 1 ? page : undefined })
        }
      />
    </Flex>
  )
}
