import { useSuspenseQuery } from '@tanstack/react-query'
import { Link as RouterLink } from '@tanstack/react-router'
import { Flex, Link, Text } from '@radix-ui/themes'

import { DataState } from '#/components/DataState'
import { ProjectList, ownProjects, projectListQuery } from '#/features/projects'
import type { ProjectArea, ProjectListSearch } from '#/features/projects'
import { useI18n } from '#/i18n/context'
import { rich } from '#/i18n/rich'
import type { EntityRef } from '#/lib/api'

// "Proiecte în zonă" (ScreenLocality, design round 13): every project landing in the UAT,
// of every beneficiary and programme, as the list of projects fixed to the place; a county
// page lists its county's. The town hall's or council's own projects are its Proiecte tab.
export function PlaceProjects<TSearch extends ProjectListSearch>({
  area,
  own,
  search,
  onSearch,
}: {
  area: ProjectArea
  // The town hall of a UAT, or a county's council.
  own: EntityRef | null
  search: TSearch
  onSearch: (search: TSearch) => void
}) {
  const { t } = useI18n()
  const p = t.places
  return (
    <Flex direction="column" gap="3">
      <ProjectList
        area={area}
        title={p.projects}
        search={search}
        onSearch={onSearch}
      />
      <Text size="2" color="gray">
        {rich('county' in area ? p.projectsLeadCounty : p.projectsLead, {
          notCollected: <DataState key="state" kind="notCollected" />,
        })}
        {own ? <OwnLink own={own} /> : null}
      </Text>
    </Flex>
  )
}

// The town hall's or council's own projects, when it has any.
function OwnLink({ own }: { own: EntityRef }) {
  const { t } = useI18n()
  const { data } = useSuspenseQuery(projectListQuery({}, ownProjects(own.cui)))
  if (data === 'failed' || data.total === 0) return null
  return (
    <>
      {' '}
      <Link asChild>
        <RouterLink
          to="/institutii/$cui"
          params={{ cui: String(own.cui) }}
          search={{ lista: 'proiecte' }}
        >
          {t.places.ownProjects(own.name)}
        </RouterLink>
      </Link>
    </>
  )
}
