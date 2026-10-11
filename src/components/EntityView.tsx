import { useSuspenseQuery } from '@tanstack/react-query'
import { Badge, Code, Container, Flex, Heading, Text } from '@radix-ui/themes'

import { EntityContractList } from '#/components/EntityContractList'
import { EntityFigures } from '#/components/EntityFigures'
import { GapPanel } from '#/components/GapPanel'
import { PartnerList } from '#/components/PartnerList'
import { PurchaseTable } from '#/components/PurchaseTable'
import { UrlTabs } from '#/components/UrlTabs'
import { useI18n } from '#/i18n/context'
import { rich } from '#/i18n/rich'
import type { Role } from '#/lib/api'
import { contractCount } from '#/lib/contracts'
import { entityContractsQuery, entityQuery, statsQuery } from '#/lib/queries'
import { entityList, entityListSearch } from '#/lib/urls'
import type { EntitySearch } from '#/lib/urls'

// The page of one institution (as a buyer) or one supplier (as a seller): its contracts
// and its direct purchases, as separate figures and separate lists.
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
  // The route loader answers "not found" before this renders.
  if (!data || !contracts) return null

  const summary = data.direct_purchases
  const held = contractCount(contracts)
  const list = entityList(search, held > 0)

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
        </Flex>

        {contracts.role === 'institutions' ? (
          <GapPanel awarded={contracts.awarded} period={contracts.period} />
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
            {
              value: 'contracte',
              label: (
                <Flex gap="2" align="center">
                  {t.entity.tabContracts}
                  <Badge color="gray">{f.count(held)}</Badge>
                </Flex>
              ),
            },
            {
              value: 'achizitii',
              label: (
                <Flex gap="2" align="center">
                  {t.entity.tabPurchases}
                  <Badge color="gray">{f.count(summary.purchases)}</Badge>
                </Flex>
              ),
            },
          ]}
          onChange={(value) => onSearch(entityListSearch(value, held > 0))}
        >
          {list === 'contracte' ? (
            <EntityContractList
              role={role}
              cui={cui}
              page={search.pagina ?? 1}
              onPage={(page) =>
                onSearch({ ...search, pagina: page > 1 ? page : undefined })
              }
            />
          ) : (
            <>
              <PartnerList role={role} partners={data.partners} />
              <PurchaseTable
                role={role}
                cui={cui}
                search={search}
                onSearch={onSearch}
              />
            </>
          )}
        </UrlTabs>
      </Flex>
    </Container>
  )
}
