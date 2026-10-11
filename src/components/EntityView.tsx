import { useSuspenseQuery } from '@tanstack/react-query'
import {
  Badge,
  Code,
  Container,
  Flex,
  Grid,
  Heading,
  Text,
} from '@radix-ui/themes'

import { Figure } from '#/components/Figure'
import { AboveLimitNote, PeriodNote } from '#/components/Notes'
import { PartnerList } from '#/components/PartnerList'
import { PurchaseTable } from '#/components/PurchaseTable'
import { SourceLine } from '#/components/SourceLine'
import { useI18n } from '#/i18n/context'
import { rich } from '#/i18n/rich'
import type { Role } from '#/lib/api'
import { entityQuery } from '#/lib/queries'
import type { EntitySearch } from '#/lib/urls'

// The page of one institution (as a buyer) or one supplier (as a seller).
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
  // The route loader answers "not found" before this renders.
  if (!data) return null

  const summary = data.direct_purchases

  return (
    <Container size="3" px="5" py="7">
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

        <Grid columns={{ initial: '1', sm: '3' }} gap="3">
          <Figure
            label={t.entity.acceptedValue}
            value={f.leiShort(summary.value)}
            detail={
              summary.value >= 1e6 ? f.lei(summary.value) : t.common.withoutVat
            }
          />
          <Figure label={t.entity.accepted} value={f.count(summary.accepted)} />
          <Figure
            label={t.entity.finalized}
            value={f.count(summary.purchases)}
          />
        </Grid>

        <Flex direction="column" gap="2">
          <PeriodNote summary={summary} />
          <AboveLimitNote summary={summary} />
          <SourceLine source={data.source} />
        </Flex>

        <PartnerList role={role} partners={data.partners} />

        <PurchaseTable
          role={role}
          cui={cui}
          search={search}
          onSearch={onSearch}
        />
      </Flex>
    </Container>
  )
}
