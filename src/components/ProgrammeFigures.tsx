import { Box, Card, Flex, Grid, Text } from '@radix-ui/themes'

import { SourceLine } from '#/components/SourceLine'
import { useI18n } from '#/i18n/context'
import type { Programme } from '#/lib/api-programme'
import { tiedShare } from '#/lib/programme'

// The programme in four figures: what was paid, for how many projects, to how many town
// halls, and how much of it we could tie to one SEAP contract. The last one rests on
// both sources, and is a probable link, never a sure one.
export function ProgrammeFigures({ programme }: { programme: Programme }) {
  const { t, f } = useI18n()
  const p = t.programme
  const days = f.span(programme.first_day, programme.last_day)
  const share = tiedShare(programme.payments_match, programme.payments_possible)

  return (
    <Card size="3">
      <Flex direction="column" gap="4">
        <Grid columns={{ initial: '1', sm: '2', md: '4' }} gap="5">
          <Stat
            label={
              days ? p.paid(t.period.range(days.from, days.to)) : p.paidAll
            }
            value={f.leiShort(programme.amount)}
            detail={[
              p.payments(programme.payments, f.count(programme.payments)),
            ]}
          />
          <Stat
            label={p.projects}
            value={f.count(programme.projects)}
            detail={[p.projectsDetail]}
          />
          <Stat
            label={p.townHalls}
            value={f.count(programme.town_halls)}
            detail={[p.townHallsDetail]}
          />
          {share ? (
            <Stat
              label={p.tied}
              value={f.percent(share.ofAmount)}
              detail={[
                p.tiedDetail(f.percent(share.ofCount)),
                p.tiedOf(share.named, f.count(share.named)),
                ...(share.several > 0
                  ? [p.tiedSeveral(share.several, f.count(share.several))]
                  : []),
                ...(share.possible > 0
                  ? [p.tiedPossible(share.possible, f.count(share.possible))]
                  : []),
              ]}
              share={share.ofAmount}
            />
          ) : null}
        </Grid>
        <Flex direction="column" gap="1">
          <SourceLine source={programme.source} of="payments" />
          {share ? (
            <SourceLine source={programme.contracts_source} of="contracts" />
          ) : null}
        </Flex>
      </Flex>
    </Card>
  )
}

// One figure with its label and the lines under it; the PNRR pages use it too.
export function Stat({
  label,
  value,
  detail,
  share,
}: {
  label: string
  value: string
  detail: Array<string>
  share?: number
}) {
  return (
    <Flex direction="column" gap="1">
      <Text size="2" color="gray">
        {label}
      </Text>
      <Text size="6" weight="bold">
        {value}
      </Text>
      {detail.map((line) => (
        <Text key={line} size="1" color="gray">
          {line}
        </Text>
      ))}
      {share === undefined ? null : (
        // Decoration: the figure above already says the share.
        <Box
          mt="1"
          aria-hidden
          style={{
            height: 4,
            borderRadius: 'var(--radius-1)',
            background: 'var(--gray-a4)',
          }}
        >
          <Box
            style={{
              height: '100%',
              width: `${Math.round(share * 100)}%`,
              borderRadius: 'var(--radius-1)',
              background: 'var(--accent-9)',
            }}
          />
        </Box>
      )}
    </Flex>
  )
}
