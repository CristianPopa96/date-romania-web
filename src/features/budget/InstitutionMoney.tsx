import { useSuspenseQuery } from '@tanstack/react-query'
import { Link as RouterLink } from '@tanstack/react-router'
import { Badge, Flex, Link, Text } from '@radix-ui/themes'

import { BudgetSection } from '#/features/budget/BudgetSection'
import { EntityLink } from '#/components/EntityLink'
import { GapPanel } from '#/features/budget/GapPanel'
import { useI18n } from '#/i18n/context'
import { rich } from '#/i18n/rich'
import type { Entity, Period } from '#/lib/api'
import type { ContractTotals } from '#/features/contracts'
import { gapEnds } from '#/features/budget/budget'
import { placeLink } from '#/features/places'
import { budgetQuery } from '#/features/budget/queries'

// What only an institution's page has: where it is and who funds it, which sources we
// hold for it, the two ends of its money, and its budget (flow 1, design round 8).

export function InstitutionHeader({ entity }: { entity: Entity }) {
  const { t } = useI18n()
  const { data } = useSuspenseQuery(budgetQuery(entity.cui))
  const held = [
    t.budget.coverageSeap,
    data?.budget ? t.budget.coverageBudget(String(data.budget.year)) : null,
    data?.programme_payments ? t.budget.coverageProgramme : null,
  ].filter((part): part is string => part !== null)

  return (
    <Flex direction="column" gap="2">
      <Flex gap="2" wrap="wrap" align="center">
        {data?.located ? (
          <>
            <Badge color="gray">
              <Link asChild>
                <RouterLink
                  to="/localitati/$judet"
                  params={{ judet: data.located.county_slug }}
                >
                  {t.budget.county(data.located.county)}
                </RouterLink>
              </Link>
            </Badge>
            <Badge color="gray">
              <Link asChild>
                <RouterLink {...placeLink(data.located)}>
                  {data.located.name}
                </RouterLink>
              </Link>
            </Badge>
          </>
        ) : entity.county ? (
          <Badge color="gray">{t.budget.county(entity.county)}</Badge>
        ) : null}
        {data?.funder ? (
          <Badge color="gray">
            {rich(t.budget.funder, {
              funder: (
                <EntityLink
                  key="funder"
                  role="institutions"
                  cui={data.funder.cui}
                >
                  {data.funder.name}
                </EntityLink>
              ),
            })}
          </Badge>
        ) : null}
      </Flex>
      <Flex gap="2" wrap="wrap" align="center">
        <Text size="1" color="gray">
          {t.budget.coverage}
        </Text>
        {held.map((name) => (
          <Badge key={name} color="green" variant="soft">
            {name}
          </Badge>
        ))}
      </Flex>
    </Flex>
  )
}

export function InstitutionMoney({
  cui,
  awarded,
  period,
}: {
  cui: number
  awarded: ContractTotals
  period: Period
}) {
  const { data } = useSuspenseQuery(budgetQuery(cui))
  return (
    <>
      <GapPanel awarded={awarded} period={period} ends={gapEnds(data)} />
      {/* Its budget is not held: said here, once. A held one is the "Buget" tab. */}
      {data?.budget ? null : <BudgetSection answer={data} />}
    </>
  )
}

// The "Buget" tab of a town hall or a county council, the only institutions whose budget
// is held (design round 13: after "Proiecte").
export function BudgetTab({ cui }: { cui: number }) {
  const { data } = useSuspenseQuery(budgetQuery(cui))
  return <BudgetSection answer={data} />
}
