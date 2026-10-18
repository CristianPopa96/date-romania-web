import { Link as RouterLink } from '@tanstack/react-router'
import { Card, Flex, Grid, Heading, Link, Text } from '@radix-ui/themes'

import { AmountBars } from '#/components/AmountBars'
import { DataState } from '#/components/DataState'
import { SourceLine } from '#/components/SourceLine'
import { useI18n } from '#/i18n/context'
import type {
  InstitutionBudget,
  LocalBudget,
  ProgrammePayments,
} from '#/lib/api-budget'
import { chapterRows, missingBudget, paidAs, revenueRows } from '#/lib/budget'
import { countySlug } from '#/lib/programme'

// An institution's budget (flow 1, design round 8). A town hall or a county council
// shows its executed budget, revenue and spending, and the Anghel Saligny payments to
// it as a card of its own, never added to the subsidies. Any other institution shows
// that its budget is not collected yet.
export function BudgetSection({
  answer,
}: {
  answer: InstitutionBudget | null
}) {
  const { t } = useI18n()
  const budget = answer?.budget ?? null

  return (
    <Flex direction="column" gap="3">
      <Heading size="5">{t.budget.title}</Heading>
      {budget ? (
        <Grid columns={{ initial: '1', md: '2' }} gap="4">
          <Revenue budget={budget} />
          <Spending budget={budget} />
          {answer?.programme_payments ? (
            <Payments
              payments={answer.programme_payments}
              as={paidAs(answer)}
              year={budget.year}
            />
          ) : null}
        </Grid>
      ) : (
        <Flex direction="column" gap="2" align="start">
          <DataState kind="notCollected" />
          <Text size="2" color="gray">
            {t.budget.notHeld[missingBudget(answer)]}
          </Text>
        </Flex>
      )}
    </Flex>
  )
}

function CardHead({ title, budget }: { title: string; budget: LocalBudget }) {
  const { t, f } = useI18n()
  return (
    <Flex justify="between" align="baseline" gap="3" wrap="wrap">
      <Heading as="h3" size="4">
        {title}
      </Heading>
      <Text size="1" color="gray">
        {t.budget.executed(f.day(budget.executed_on))}
      </Text>
    </Flex>
  )
}

function Revenue({ budget }: { budget: LocalBudget }) {
  const { t, f } = useI18n()
  const year = String(budget.year)
  return (
    <Card size="2">
      <Flex direction="column" gap="4">
        <CardHead title={t.budget.revenue(year)} budget={budget} />
        <Text size="2" color="gray">
          {t.budget.revenueTotal(f.leiShort(budget.revenue))}
        </Text>
        <AmountBars
          rows={revenueRows(budget).map((row) => ({
            ...row,
            label: t.budget.lines[row.key],
          }))}
        />
        <SourceLine source={budget.source} />
      </Flex>
    </Card>
  )
}

function Spending({ budget }: { budget: LocalBudget }) {
  const { t, f } = useI18n()
  const year = String(budget.year)
  return (
    <Card size="2">
      <Flex direction="column" gap="4">
        <CardHead title={t.budget.spending(year)} budget={budget} />
        <Flex direction="column" gap="1">
          <Text size="2" color="gray">
            {t.budget.capital}
          </Text>
          <Text size="6" weight="bold">
            {f.leiShort(budget.capital)}
          </Text>
          <Text size="1" color="gray">
            {t.budget.capitalOf(f.leiShort(budget.spending))}
          </Text>
        </Flex>
        <AmountBars
          rows={chapterRows(budget).map((row) => ({
            ...row,
            label: t.budget.chapters[row.key],
          }))}
        />
        <SourceLine source={budget.source} />
      </Flex>
    </Card>
  )
}

function Payments({
  payments,
  as,
  year,
}: {
  payments: ProgrammePayments
  as: 'county' | 'townHall'
  year: number
}) {
  const { t, f } = useI18n()
  const days = f.span(payments.first_published, payments.last_published)
  return (
    <Card size="2">
      <Flex direction="column" gap="3">
        <Flex justify="between" align="baseline" gap="3" wrap="wrap">
          <Heading as="h3" size="4">
            {t.budget.payments[as]}
          </Heading>
          {days ? (
            <Text size="1" color="gray">
              {t.period.range(days.from, days.to)}
            </Text>
          ) : null}
        </Flex>
        <Text size="6" weight="bold">
          {f.leiShort(payments.amount)}
        </Text>
        <Text size="1" color="gray">
          {t.budget.payments.detail(
            payments.payments,
            f.count(payments.payments),
            payments.projects,
            f.count(payments.projects),
          )}{' '}
          ·{' '}
          <Link asChild size="1">
            <RouterLink
              to="/programe/anghel-saligny"
              search={{
                judet: countySlug(payments.county),
                q: payments.town_hall ?? undefined,
              }}
            >
              {t.budget.payments.projects}
            </RouterLink>
          </Link>
        </Text>
        <Text size="2" color="gray">
          {t.budget.payments.why(String(year))}
        </Text>
        <SourceLine source={payments.source} />
      </Flex>
    </Card>
  )
}
