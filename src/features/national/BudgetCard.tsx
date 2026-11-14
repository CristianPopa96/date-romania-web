import { ExternalLinkIcon } from '@radix-ui/react-icons'
import {
  Card,
  Flex,
  Grid,
  Heading,
  Link,
  Progress,
  Text,
} from '@radix-ui/themes'

import { AmountBars } from '#/components/AmountBars'
import { DataState } from '#/components/DataState'
import { SourceLine } from '#/components/SourceLine'
import type { NationalBudget } from '#/features/national/api'
import { periodText } from '#/features/national/national'
import { useI18n } from '#/i18n/context'

// Block 1, "Bugetul țării": what was planned for the year, what was spent so far, and on
// what (ScreenHome, design round 18). Plan and execution are the same measure for the
// same year, so a share between them is allowed here.
export function BudgetCard({ budget }: { budget: NationalBudget | null }) {
  const { t, f } = useI18n()
  const n = t.national
  if (!budget?.executed) {
    return (
      <Card size="3">
        <Flex direction="column" gap="3">
          <Heading as="h2" size="5">
            {n.budget.titleNone}
          </Heading>
          <Flex direction="column" gap="1" align="start">
            <DataState kind="notCollected" />
            <Text size="1" color="gray">
              {n.fills.execution}
            </Text>
          </Flex>
        </Flex>
      </Card>
    )
  }
  const { executed, planned } = budget
  const year = String(budget.year)
  const period = periodText(
    f,
    executed.period_start,
    executed.period_end,
    n.span,
  )

  return (
    <Card size="3">
      <Flex direction="column" gap="5">
        <Flex direction="column" gap="1">
          <Heading as="h2" size="5">
            {n.budget.title(year)}
          </Heading>
          <Text size="2" color="gray">
            {n.budget.lead}
          </Text>
        </Flex>
        <Grid columns={{ initial: '1', sm: '2' }} gap="5">
          <Flex direction="column" gap="1">
            <Text size="2" color="gray">
              {n.budget.planned(year)}
            </Text>
            {planned ? (
              <>
                <Text size="7" weight="bold">
                  {f.leiBillions(planned.amount)}
                </Text>
                <Flex gap="2" align="center" wrap="wrap">
                  <Text size="1" color="gray">
                    {n.budget.plannedSource(
                      planned.act,
                      f.day(planned.published_on),
                      String(planned.page),
                    )}
                  </Text>
                  <Link
                    href={planned.url}
                    target="_blank"
                    rel="noreferrer"
                    size="1"
                  >
                    <Flex align="center" gap="1">
                      <ExternalLinkIcon />
                      {n.budget.openDocument}
                    </Flex>
                  </Link>
                </Flex>
              </>
            ) : (
              <Flex direction="column" gap="1" align="start">
                <DataState kind="notCollected" />
                <Text size="1" color="gray">
                  {n.fills.planned}
                </Text>
              </Flex>
            )}
          </Flex>
          <Flex direction="column" gap="1">
            <Text size="2" color="gray">
              {n.budget.spent(f.day(executed.period_end))}
            </Text>
            <Text size="7" weight="bold">
              {f.leiBillions(executed.spending)}
            </Text>
            <SourceLine source={executed.source} />
          </Flex>
        </Grid>
        {budget.executed_share != null ? (
          <Flex direction="column" gap="2">
            <Progress
              value={Math.min(budget.executed_share * 100, 100)}
              size="2"
              aria-hidden
            />
            <Text size="2">
              {n.budget.progress(
                f.percent(budget.executed_share, 1),
                n.months(executed.months),
              )}
            </Text>
          </Flex>
        ) : null}
        <Flex direction="column" gap="3">
          <Heading as="h3" size="3">
            {n.budget.spentOn(period ?? '')}
          </Heading>
          <AmountBars
            rows={budget.categories.map((category) => ({
              key: category.key,
              label: n.budget.categories[category.key] ?? category.key,
              value: category.amount,
            }))}
            format={f.leiBillions}
          />
        </Flex>
      </Flex>
    </Card>
  )
}
