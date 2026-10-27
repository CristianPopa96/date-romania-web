import { useSuspenseQuery } from '@tanstack/react-query'
import { Link as RouterLink } from '@tanstack/react-router'
import { ExclamationTriangleIcon } from '@radix-ui/react-icons'
import {
  Callout,
  Card,
  Container,
  Flex,
  Grid,
  Heading,
  Link,
  Text,
} from '@radix-ui/themes'

import { Facts, PaymentsTable } from '#/components/EuProjectFacts'
import { Stat } from '#/components/ProgrammeFigures'
import { SourceLine } from '#/components/SourceLine'
import { useI18n } from '#/i18n/context'
import type { EuProject } from '#/lib/api-eu'
import { euShare, periodLabel } from '#/lib/eu'
import { euProjectQuery } from '#/lib/queries'

// One EU cohesion project (`ScreenEUProject`, its SMIS kind): what it is worth and what
// was paid up to its list's day, the facts, and the payments where the programme
// publishes them one by one (Health).
export function EuProjectView({ smis }: { smis: number }) {
  const { data: project } = useSuspenseQuery(euProjectQuery(smis))
  // The route loader answers "not found" before this renders.
  return project ? <ProjectView project={project} /> : null
}

function ProjectView({ project }: { project: EuProject }) {
  const { t, f } = useI18n()
  const e = t.eu
  const share = euShare(project.eu, project.total)
  const payments = project.payments
  const days = (payments ?? []).flatMap((payment) =>
    payment.paid_on ? [payment.paid_on] : [],
  )
  const span = f.span(days.at(-1) ?? null, days.at(0) ?? null)
  const paidInFiles = (payments ?? []).reduce((sum, p) => sum + p.amount, 0)

  return (
    <Container size="4" px="5" py="7">
      <Flex direction="column" gap="6">
        <Flex direction="column" gap="2">
          <Text size="2" color="gray">
            <Link asChild color="gray">
              <RouterLink to="/programe">{e.crumb}</RouterLink>
            </Link>{' '}
            /{' '}
            <Link asChild color="gray">
              <RouterLink to="/programe/fonduri-europene">{e.name}</RouterLink>
            </Link>{' '}
            / {e.smis(String(project.smis))}
          </Text>
          <Text size="1" color="gray" weight="medium">
            {e.projectEyebrow(
              project.programme_name,
              periodLabel(project.period),
            )}
          </Text>
          <Heading size="7">{project.title ?? e.fallbackTitle}</Heading>
        </Flex>

        <Grid columns={{ initial: '1', md: '2fr 1fr' }} gap="5" align="start">
          <Card size="3">
            <Flex direction="column" gap="4">
              <Grid columns={{ initial: '1', sm: '3' }} gap="5">
                <Stat
                  label={e.total}
                  value={
                    project.total === null
                      ? t.common.notPublished
                      : f.leiShort(project.total)
                  }
                  detail={
                    project.starts_on
                      ? [e.started(f.day(project.starts_on))]
                      : []
                  }
                />
                <Stat
                  label={e.eu}
                  value={
                    project.eu === null
                      ? t.common.notPublished
                      : f.leiShort(project.eu)
                  }
                  detail={share === null ? [] : [f.percent(share)]}
                />
                <Stat
                  label={
                    project.cut_off
                      ? e.paidUntil(f.day(project.cut_off))
                      : e.paidAll
                  }
                  value={
                    project.paid === null
                      ? t.common.notPublished
                      : f.leiShort(project.paid)
                  }
                  detail={[payments ? e.paidUntilDated : e.paidUntilDetail]}
                />
              </Grid>
              <SourceLine
                source={{
                  ...project.source,
                  record:
                    project.source.record &&
                    (project.cut_off
                      ? e.listOn(project.source.record, f.day(project.cut_off))
                      : project.source.record),
                }}
              />
            </Flex>
          </Card>
          <Facts project={project} />
        </Grid>

        {/* As the list writes them, one text: never tied to an entity by name. */}
        {project.partners ? (
          <Flex direction="column" gap="2">
            <Heading as="h2" size="5">
              {e.partners}
            </Heading>
            <Text size="2" color="gray" style={{ maxWidth: 900 }}>
              {project.partners}
            </Text>
          </Flex>
        ) : null}

        {payments && project.payments_source ? (
          <Flex direction="column" gap="3">
            <Flex justify="between" align="baseline" gap="3" wrap="wrap">
              <Heading as="h2" size="5">
                {e.paymentsTitle}
              </Heading>
              <Text size="1" color="gray">
                {e.paymentsNote(
                  payments.length,
                  f.count(payments.length),
                  f.leiShort(paidInFiles),
                  span ? t.period.range(span.from, span.to) : '',
                )}
              </Text>
            </Flex>
            <PaymentsTable payments={payments} />
            <SourceLine source={project.payments_source} of="payments" />
          </Flex>
        ) : null}

        <Flex direction="column" gap="3">
          <Heading as="h2" size="5">
            {e.notPublicTitle}
          </Heading>
          <Callout.Root color="amber" variant="surface">
            <Callout.Icon>
              <ExclamationTriangleIcon />
            </Callout.Icon>
            <Callout.Text>
              {payments ? e.notPublicDated : e.notPublic}
            </Callout.Text>
          </Callout.Root>
        </Flex>
      </Flex>
    </Container>
  )
}
