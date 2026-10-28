import { useSuspenseQuery } from '@tanstack/react-query'
import { Badge, Code, Container, Flex, Heading, Text } from '@radix-ui/themes'

import {
  EntityContractList,
  contractCount,
  entityContractsQuery,
} from '#/features/contracts'
import {
  EntityCohesion,
  euCounts,
  euLists,
  euBeneficiaryQuery,
} from '#/features/eu-projects'
import { EntityPnrr } from '#/features/pnrr'
import { EntityFigures } from '#/features/entities/EntityFigures'
import { InstitutionHeader, InstitutionMoney } from '#/features/budget'
import { PurchaseList } from '#/features/purchases'
import { UrlTabs } from '#/components/UrlTabs'
import { useI18n } from '#/i18n/context'
import { rich } from '#/i18n/rich'
import type { Role } from '#/lib/api'
import { entityQuery } from '#/features/entities/queries'
import { statsQuery } from '#/lib/queries'
import { entityList, entityListSearch } from '#/features/entities/urls'
import type { EntityList, EntitySearch } from '#/features/entities/urls'

// The page of one institution (as a buyer) or one supplier (as a seller): its contracts
// and its direct purchases, as separate figures and separate lists, and the EU projects
// and PNRR contracts it is the beneficiary of, a list for each kind it has.
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
  const { data: funds } = useSuspenseQuery(euBeneficiaryQuery(cui))
  // The route loader answers "not found" before this renders.
  if (!data || !contracts) return null

  const summary = data.direct_purchases
  const held = contractCount(contracts)
  const eu = euCounts(funds)
  const list = entityList(search, held > 0, euLists(funds))
  const page = search.pagina ?? 1
  const onPage = (next: number) =>
    onSearch({ ...search, pagina: next > 1 ? next : undefined })
  const tab = (value: EntityList, label: string, count: number) => ({
    value,
    label: (
      <Flex gap="2" align="center">
        {label}
        <Badge color="gray">{f.count(count)}</Badge>
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
            ...(eu.cohesion > 0
              ? [tab('coeziune', t.eu.held.tabCohesion, eu.cohesion)]
              : []),
            ...(eu.pnrr > 0 ? [tab('pnrr', t.eu.held.tabPnrr, eu.pnrr)] : []),
          ]}
          onChange={(value) => onSearch(entityListSearch(value, held > 0))}
        >
          {list === 'contracte' ? (
            <EntityContractList
              role={role}
              cui={cui}
              page={page}
              onPage={onPage}
            />
          ) : list === 'coeziune' && funds && funds !== 'failed' ? (
            <EntityCohesion
              cui={cui}
              funds={funds}
              page={page}
              onPage={onPage}
            />
          ) : list === 'pnrr' && funds && funds !== 'failed' && funds.pnrr ? (
            <EntityPnrr
              cui={cui}
              pnrr={funds.pnrr}
              page={page}
              onPage={onPage}
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
        {funds === 'failed' ? (
          <Text size="2" color="gray">
            {t.eu.held.failed}
          </Text>
        ) : null}
      </Flex>
    </Container>
  )
}
