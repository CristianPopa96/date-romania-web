import { useSuspenseQuery } from '@tanstack/react-query'
import { Badge, Code, Container, Flex, Heading, Text } from '@radix-ui/themes'

import {
  ContractList,
  contractCount,
  contractsWon,
  entityContractsQuery,
} from '#/features/contracts'
import { EntityProjects, projectListQuery } from '#/features/projects'
import { EntityFigures } from '#/features/entities/EntityFigures'
import { InstitutionHeader, InstitutionMoney } from '#/features/budget'
import { PurchaseList } from '#/features/purchases'
import { UrlTabs } from '#/components/UrlTabs'
import { useI18n } from '#/i18n/context'
import { rich } from '#/i18n/rich'
import type { Role } from '#/lib/api'
import { entityProjects, entityQuery } from '#/features/entities/queries'
import { statsQuery } from '#/lib/queries'
import { entityList, entityListSearch } from '#/features/entities/urls'
import type { EntityList, EntitySearch } from '#/features/entities/urls'

// The page of one institution (as a buyer) or one supplier (as a seller): its contracts
// and its direct purchases, as separate figures and separate lists, and its projects of
// every programme in one tab (D22).
export function EntityView({
  role,
  cui,
  search,
  onSearch,
}: {
  role: Role
  cui: number
  search: EntitySearch
  onSearch: (search: EntitySearch) => void
}) {
  const { t, f } = useI18n()
  const { data } = useSuspenseQuery(entityQuery(role, cui))
  const { data: contracts } = useSuspenseQuery(entityContractsQuery(role, cui))
  const { data: stats } = useSuspenseQuery(statsQuery)
  const { data: projects } = useSuspenseQuery(
    projectListQuery({}, entityProjects(role, cui)),
  )
  // The route loader answers "not found" before this renders.
  if (!data || !contracts) return null

  const summary = data.direct_purchases
  const held = contractCount(contracts)
  // When the count could not be read the tab stays, with no count: its list says why.
  const projectCount = projects === 'failed' ? null : projects.total
  const hasProjects = projectCount !== 0
  const list = entityList(search, held > 0, hasProjects)
  const tab = (value: EntityList, label: string, count: number | null) => ({
    value,
    label: (
      <Flex gap="2" align="center">
        {label}
        {count === null ? null : <Badge color="gray">{f.count(count)}</Badge>}
      </Flex>
    ),
  })

  return (
    <Container size="4" px="5" py="7">
      <Flex direction="column" gap="6">
        <Flex direction="column" gap="2">
          <Flex gap="2" align="center">
            <Badge color="gray">
              {role === 'institutions'
                ? t.common.institution
                : t.common.supplier}
            </Badge>
            <Text size="2" color="gray">
              {rich(t.common.cui, {
                cui: (
                  <Code key="cui" variant="ghost">
                    {data.entity.cui}
                  </Code>
                ),
              })}
            </Text>
          </Flex>
          <Heading size="7">{data.entity.name}</Heading>
          {role === 'institutions' ? (
            <InstitutionHeader entity={data.entity} />
          ) : null}
        </Flex>

        {contracts.role === 'institutions' ? (
          <InstitutionMoney
            cui={cui}
            awarded={contracts.awarded}
            period={contracts.period}
          />
        ) : null}

        <Flex direction="column" gap="3">
          <Heading size="5">{t.entity.lists}</Heading>
          <EntityFigures
            contracts={contracts}
            purchases={summary}
            held={stats?.direct_purchases ?? null}
            purchasesSource={data.source}
          />
        </Flex>

        <UrlTabs
          value={list}
          tabs={[
            tab('contracte', t.entity.tabContracts, held),
            tab('achizitii', t.entity.tabPurchases, summary.purchases),
            ...(hasProjects
              ? [tab('proiecte', t.projects.tab, projectCount)]
              : []),
          ]}
          onChange={(value) => onSearch(entityListSearch(value, held > 0))}
        >
          {list === 'contracte' ? (
            <ContractList
              role={role}
              cui={cui}
              search={search}
              won={contractsWon(contracts, search)}
              onSearch={onSearch}
            />
          ) : list === 'proiecte' ? (
            <EntityProjects
              role={role}
              cui={cui}
              search={search}
              onSearch={onSearch}
            />
          ) : (
            <PurchaseList
              role={role}
              cui={cui}
              search={search}
              held={stats?.direct_purchases ?? null}
              onSearch={onSearch}
            />
          )}
        </UrlTabs>
      </Flex>
    </Container>
  )
}
