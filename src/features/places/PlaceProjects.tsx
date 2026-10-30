import { Link as RouterLink } from '@tanstack/react-router'
import { Flex, Link, Text } from '@radix-ui/themes'

import { DataState } from '#/components/DataState'
import { ProjectList } from '#/features/projects'
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
        {rich(p.projectsLead, {
          notCollected: <DataState key="state" kind="notCollected" />,
        })}
        {own ? (
          <>
            {' '}
            <Link asChild>
              <RouterLink
                to="/institutii/$cui"
                params={{ cui: String(own.cui) }}
                search={{ lista: 'proiecte' }}
              >
                {p.ownProjects(own.name)}
              </RouterLink>
            </Link>
          </>
        ) : null}
      </Text>
    </Flex>
  )
}
