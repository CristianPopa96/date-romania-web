import { Badge, Box, Card, Flex, Heading, Text } from '@radix-ui/themes'

import { EntityLink } from '#/components/EntityLink'
import { useI18n } from '#/i18n/context'
import type { TopWinner } from '#/lib/api-places'

// Who gets the contracts of a locality or a county (ScreenLocality).
// A supplier, or an association as one row with its whole value: no member stands for
// it. Each member shows its county, from ANAF.
export function WinnersCard({ winners }: { winners: Array<TopWinner> }) {
  const { t, f } = useI18n()
  const largest = Math.max(...winners.map((row) => row.value), 1)
  return (
    <Card size="2">
      <Flex direction="column" gap="3">
        <Flex justify="between" align="baseline" gap="3" wrap="wrap">
          <Heading as="h3" size="4">
            {t.places.winners}
          </Heading>
          <Text size="1" color="gray">
            {t.places.winnersNote}
          </Text>
        </Flex>
        {winners.length === 0 ? (
          <Text size="2" color="gray">
            {t.places.figures.noContracts}
          </Text>
        ) : (
          <Flex direction="column" gap="3" asChild>
            <ol style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {winners.map((row) => (
                <li key={row.members.map((member) => member.cui).join('+')}>
                  <Flex justify="between" align="baseline" gap="3">
                    <Flex direction="column" gap="1">
                      {row.members.map((member, at) => (
                        <Text key={member.cui} size="2">
                          <EntityLink role="suppliers" cui={member.cui}>
                            {member.name}
                          </EntityLink>{' '}
                          <Text color="gray">
                            · {row.counties[at] ?? t.places.noCounty}
                          </Text>
                        </Text>
                      ))}
                      {row.members.length > 1 ? (
                        <Badge color="gray" style={{ alignSelf: 'start' }}>
                          {t.places.association(
                            row.members.length,
                            f.count(row.members.length),
                          )}
                        </Badge>
                      ) : null}
                    </Flex>
                    <Text
                      size="2"
                      weight="medium"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      {f.lei(row.value)}
                    </Text>
                  </Flex>
                  <Box
                    mt="1"
                    style={{
                      height: 6,
                      borderRadius: 'var(--radius-1)',
                      background: 'var(--gray-a4)',
                    }}
                  >
                    <Box
                      style={{
                        height: '100%',
                        width: `${Math.max((row.value / largest) * 100, 1)}%`,
                        borderRadius: 'var(--radius-1)',
                        background: 'var(--accent-9)',
                      }}
                    />
                  </Box>
                </li>
              ))}
            </ol>
          </Flex>
        )}
      </Flex>
    </Card>
  )
}
