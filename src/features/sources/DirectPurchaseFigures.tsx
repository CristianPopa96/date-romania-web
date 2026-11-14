import { Link as RouterLink } from '@tanstack/react-router'
import { ArrowRightIcon } from '@radix-ui/react-icons'
import { Flex, Grid, Heading, Link } from '@radix-ui/themes'

import { Figure } from '#/components/Figure'
import { AboveLimitNote, PeriodNote } from '#/components/Notes'
import { SourceLine } from '#/components/SourceLine'
import { useI18n } from '#/i18n/context'
import type { Stats } from '#/lib/api'

// What the direct purchases held add up to: the figures the home page showed until it
// became the national budget comparison (design round 18).
export function DirectPurchaseFigures({ stats }: { stats: Stats | null }) {
  const { t, f } = useI18n()
  const words = t.sources.directFigures
  const summary = stats?.direct_purchases
  if (!stats || !summary || summary.purchases === 0) return null

  return (
    <Flex direction="column" gap="3">
      <Heading size="5">{words.title}</Heading>
      <Grid columns={{ initial: '2', sm: '4' }} gap="3">
        <Figure
          size="5"
          label={words.acceptedValue}
          value={f.leiShort(summary.value)}
          detail={f.lei(summary.value)}
        />
        <Figure
          size="5"
          label={words.acceptedPurchases}
          value={f.count(summary.accepted)}
        />
        <Figure
          size="5"
          label={words.institutions}
          value={f.count(stats.institutions)}
        />
        <Figure
          size="5"
          label={words.suppliers}
          value={f.count(stats.suppliers)}
        />
      </Grid>
      <PeriodNote summary={summary} />
      <AboveLimitNote summary={summary} />
      <Flex justify="between" align="center" gap="3" wrap="wrap">
        <SourceLine source={stats.source} />
        <Link asChild size="2">
          <RouterLink to="/clasamente">
            <Flex align="center" gap="1">
              {words.seeRankings}
              <ArrowRightIcon />
            </Flex>
          </RouterLink>
        </Link>
      </Flex>
    </Flex>
  )
}
