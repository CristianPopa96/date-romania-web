import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Card, Container, Flex, Grid, Heading, Text } from '@radix-ui/themes'

import { Unavailable } from '#/components/Notes'
import { PnrrMeasuresTable, PnrrTopTable } from '#/components/PnrrTables'
import { Stat } from '#/components/ProgrammeFigures'
import { SourceLine } from '#/components/SourceLine'
import { UrlTabs } from '#/components/UrlTabs'
import { messagesFor } from '#/i18n'
import { useI18n } from '#/i18n/context'
import type { PnrrProgramme } from '#/lib/api-pnrr'
import { pageTitle } from '#/lib/copy'
import { paidShare } from '#/lib/pnrr'
import { pnrrQuery } from '#/lib/queries'
import { validatePnrrProgrammeSearch } from '#/lib/urls-programmes'

// The Recovery and Resilience Plan: its money from one dashboard edition, its measures by
// component, and the largest recipients.
export const Route = createFileRoute('/programe/pnrr/')({
  validateSearch: validatePnrrProgrammeSearch,
  loader: ({ context }) => context.queryClient.ensureQueryData(pnrrQuery),
  head: ({ match }) => ({
    meta: [{ title: pageTitle(messagesFor(match.context.locale).pnrr.title) }],
  }),
  component: PnrrPage,
})

function PnrrPage() {
  const { t } = useI18n()
  const p = t.pnrr
  const { tab } = Route.useSearch()
  const navigate = Route.useNavigate()
  const { data: programme } = useSuspenseQuery(pnrrQuery)

  return (
    <Container size="4" px="5" py="7">
      <Flex direction="column" gap="6">
        <Flex direction="column" gap="2">
          <Text size="2" color="gray">
            {p.crumb} / {p.name}
          </Text>
          <Text size="1" color="gray" weight="medium">
            {p.eyebrow}
          </Text>
          <Heading size="7">{p.title}</Heading>
          <Text size="3" color="gray" style={{ maxWidth: '70ch' }}>
            {p.lead}
          </Text>
        </Flex>
        {programme ? (
          <>
            <PnrrFigures programme={programme} />
            <UrlTabs
              value={tab ?? 'masuri'}
              tabs={[
                { value: 'masuri', label: p.measuresTab },
                { value: 'beneficiari', label: p.topTab },
              ]}
              onChange={(next) =>
                void navigate({
                  search: { tab: next === 'masuri' ? undefined : next },
                  resetScroll: false,
                })
              }
              gap="3"
            >
              {tab === 'beneficiari' ? (
                <PnrrTopTable top={programme.top} edition={programme.edition} />
              ) : (
                <PnrrMeasuresTable measures={programme.measures} />
              )}
            </UrlTabs>
          </>
        ) : (
          <Unavailable />
        )}
      </Flex>
    </Container>
  )
}

// Allocated and paid in euro, from the edition's own totals; contracted in lei, the only
// way MIPE publishes it.
function PnrrFigures({ programme }: { programme: PnrrProgramme }) {
  const { t, f } = useI18n()
  const p = t.pnrr
  const share = paidShare(programme.paid_eur, programme.allocated_eur)
  const euros = (value: number | null) =>
    value === null ? t.common.notPublished : f.euroShort(value)

  return (
    <Card size="3">
      <Flex direction="column" gap="4">
        <Grid columns={{ initial: '1', sm: '3' }} gap="5">
          <Stat
            label={p.allocated}
            value={euros(programme.allocated_eur)}
            detail={[p.allocatedDetail]}
          />
          <Stat
            label={p.contracted}
            value={f.leiShort(programme.contracted_ron)}
            detail={[
              p.contractedDetail,
              ...(programme.contracts === null
                ? []
                : [
                    p.contracts(
                      programme.contracts,
                      f.count(programme.contracts),
                    ),
                  ]),
            ]}
          />
          <Stat
            label={p.paid}
            value={euros(programme.paid_eur)}
            detail={share === null ? [] : [p.paidDetail(f.percent(share))]}
            share={share ?? undefined}
          />
        </Grid>
        <SourceLine
          source={{
            ...programme.source,
            record:
              programme.source.record &&
              p.edition(programme.source.record, f.day(programme.edition)),
          }}
        />
      </Flex>
    </Card>
  )
}
