import { useSuspenseQuery } from '@tanstack/react-query'
import { Link as RouterLink } from '@tanstack/react-router'
import { Card, Flex, Heading, Link, Text } from '@radix-ui/themes'

import { useI18n } from '#/i18n/context'
import type { EntityRef } from '#/lib/api'
import { euCounts } from '#/features/eu-projects/eu'
import { euBeneficiaryQuery } from '#/features/eu-projects/queries'

// The EU money of a place's town hall or county council, in short (flow 6, "Proiecte în
// zonă"): how many projects of each kind, the PNRR payments it received, and a link to
// each list on its own page. The two kinds are never added together.
export function PlaceEuFunds({ entity }: { entity: EntityRef }) {
  const { t, f } = useI18n()
  const e = t.eu.held
  const { data: funds } = useSuspenseQuery(euBeneficiaryQuery(entity.cui))
  // No such endpoint yet: no block rather than a false "nothing".
  if (funds === null) return null
  const counts = euCounts(funds)
  const pnrr = funds !== 'failed' ? funds.pnrr : null
  const days = pnrr ? f.span(pnrr.first_day, pnrr.last_day) : null

  return (
    <Flex direction="column" gap="2">
      <Heading as="h3" size="4">
        {e.placeTitle}
      </Heading>
      <Text size="2" color="gray">
        {e.placeLead(entity.name)}
      </Text>
      {funds === 'failed' ? (
        <Text size="2" color="gray">
          {e.failed}
        </Text>
      ) : counts.cohesion === 0 && counts.pnrr === 0 && !counts.pnrrPaid ? (
        <Text size="2" color="gray">
          {e.placeNone}
        </Text>
      ) : (
        <Flex direction="column" gap="2">
          {counts.cohesion > 0 ? (
            <Card>
              <Flex justify="between" align="center" gap="3" wrap="wrap">
                <Text size="2">
                  {e.placeCohesion(
                    counts.cohesion,
                    f.count(counts.cohesion),
                    funds.cohesion.length,
                  )}
                  {counts.byName > 0
                    ? e.placeByName(
                        counts.byName,
                        f.count(counts.byName),
                        counts.byName === counts.cohesion,
                      )
                    : null}
                </Text>
                <Link asChild size="2">
                  <RouterLink
                    to="/institutii/$cui"
                    params={{ cui: String(entity.cui) }}
                    search={{ lista: 'proiecte', program: 'fonduri-europene' }}
                  >
                    {e.seeList}
                  </RouterLink>
                </Link>
              </Flex>
            </Card>
          ) : null}
          {pnrr && (pnrr.contracts > 0 || pnrr.payments > 0) ? (
            <Card>
              <Flex justify="between" align="center" gap="3" wrap="wrap">
                <Text size="2">
                  {e.placePnrr(pnrr.contracts, f.count(pnrr.contracts))}
                  {pnrr.payments > 0
                    ? ` · ${e.placeReceived(
                        f.leiShort(pnrr.paid),
                        days ? t.period.range(days.from, days.to) : null,
                      )}`
                    : ` · ${e.noPayments}`}
                </Text>
                <Link asChild size="2">
                  <RouterLink
                    to="/institutii/$cui"
                    params={{ cui: String(entity.cui) }}
                    search={{ lista: 'proiecte', program: 'pnrr' }}
                  >
                    {e.seeList}
                  </RouterLink>
                </Link>
              </Flex>
            </Card>
          ) : null}
        </Flex>
      )}
    </Flex>
  )
}
