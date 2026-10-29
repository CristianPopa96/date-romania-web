import type { ReactNode } from 'react'
import { Link as RouterLink } from '@tanstack/react-router'
import { Box, Flex, Link, Text } from '@radix-ui/themes'

import { DataState } from '#/components/DataState'
import { EntityLink } from '#/components/EntityLink'
import { ListRows } from '#/components/list/ListRows'
import type { Column } from '#/components/list/ListRows'
import { RoadMeter } from '#/features/projects/RoadMeter'
import type { ProjectItem } from '#/features/projects/api'
import { useI18n } from '#/i18n/context'
import { marks } from '#/lib/list'
import type { Sort } from '#/lib/list'

// The rows of the list of projects, declared to ListRows: the project (it opens its page,
// with its programme and key under it), its beneficiary and county, its value as its
// programme gives it, and how far its road is followed.
export function ProjectRows({
  items,
  q,
  sort,
  onSort,
  total,
}: {
  items: Array<ProjectItem>
  q: string | undefined
  sort: Sort
  onSort: (sort: Sort | null) => void
  total: { label: string; value: string } | null
}) {
  const { t } = useI18n()
  const p = t.projects
  const columns: Array<Column<ProjectItem>> = [
    {
      key: 'proiect',
      header: p.project,
      maxWidth: 380,
      cell: (row) => <Title row={row} q={q} />,
    },
    {
      key: 'beneficiar',
      header: p.beneficiary,
      maxWidth: 240,
      cell: (row) => <Beneficiary row={row} />,
    },
    {
      key: 'valoare',
      header: p.valueColumn,
      sort: { column: 'valoare' },
      align: 'end',
      nowrap: true,
      cell: (row) => <Money value={row.value} />,
    },
    {
      key: 'drum',
      header: p.road,
      cell: (row) => <RoadMeter project={row} />,
    },
  ]
  return (
    <ListRows
      columns={columns}
      rows={items}
      rowKey={(row) => `${row.kind}-${row.key}`}
      sort={sort}
      onSort={onSort}
      total={total}
      card={(row) => (
        <Flex direction="column" gap="2">
          <Flex justify="between" gap="3">
            <Box minWidth="0">
              <Title row={row} q={q} />
            </Box>
            <Box style={{ whiteSpace: 'nowrap', textAlign: 'right' }}>
              <Money value={row.value} />
            </Box>
          </Flex>
          <Beneficiary row={row} />
          <RoadMeter project={row} />
        </Flex>
      )}
    />
  )
}

// A project's own page, by its programme. The page of an Anghel Saligny project is under
// /proiecte; the PNRR and cohesion pages are still under /programe.
export function ProjectLink({
  kind,
  projectKey,
  children,
}: {
  kind: ProjectItem['kind']
  projectKey: number
  children: ReactNode
}) {
  const id = String(projectKey)
  const to =
    kind === 'anghel_saligny' ? (
      <RouterLink to="/proiecte/anghel-saligny/$id" params={{ id }}>
        {children}
      </RouterLink>
    ) : kind === 'pnrr' ? (
      <RouterLink to="/programe/pnrr/contracte/$id" params={{ id }}>
        {children}
      </RouterLink>
    ) : (
      <RouterLink
        to="/programe/fonduri-europene/proiecte/$smis"
        params={{ smis: id }}
      >
        {children}
      </RouterLink>
    )
  return <Link asChild>{to}</Link>
}

// "POR 2014-2020 · SMIS 118001", "PNRR · 12321", "Anghel Saligny · 101".
export function projectKeyLine(
  row: Pick<
    ProjectItem,
    'kind' | 'key' | 'programme' | 'programme_name' | 'period' | 'number'
  >,
  t: ReturnType<typeof useI18n>['t'],
): string {
  const p = t.projects
  if (row.kind === 'cohesion') {
    return p.key(
      row.period ? `${row.programme} ${row.period}` : row.programme,
      p.smis(String(row.key)),
    )
  }
  // A PNRR contract is shown by its number, never by its commitment id.
  const shown = row.kind === 'pnrr' ? (row.number ?? '') : String(row.key)
  return p.key(row.programme_name, shown)
}

function Title({ row, q }: { row: ProjectItem; q: string | undefined }) {
  const { t } = useI18n()
  return (
    <>
      <Text as="div" size="2">
        <ProjectLink kind={row.kind} projectKey={row.key}>
          {row.title
            ? marks(row.title, q).map((part, index) =>
                part.mark ? (
                  <mark key={index} className="dr-mark">
                    {part.text}
                  </mark>
                ) : (
                  part.text
                ),
              )
            : t.projects.fallbackTitle}
        </ProjectLink>
      </Text>
      <Text as="div" size="1" color="gray">
        {projectKeyLine(row, t)}
      </Text>
    </>
  )
}

function Beneficiary({ row }: { row: ProjectItem }) {
  const { t } = useI18n()
  const counties = row.counties.map((county) => county.name).join(', ')
  return (
    <>
      <Text as="div" size="2">
        {row.beneficiary ? (
          <EntityLink
            role={
              row.beneficiary.kind === 'company' ? 'suppliers' : 'institutions'
            }
            cui={row.beneficiary.cui}
          >
            {row.beneficiary.name}
          </EntityLink>
        ) : (
          (row.beneficiary_name ?? <DataState kind="notPublished" />)
        )}
      </Text>
      <Text as="div" size="1" color="gray">
        {counties || t.projects.national}
      </Text>
    </>
  )
}

function Money({ value }: { value: number | null }) {
  const { f } = useI18n()
  return value === null ? (
    <DataState kind="notPublished" />
  ) : (
    <>{f.lei(value)}</>
  )
}
