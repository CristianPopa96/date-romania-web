import { Box, Card, Flex, Heading, Text } from '@radix-ui/themes'

import { DataState } from '#/components/DataState'
import type { Domains } from '#/features/national/api'
import { DOMAINS_ANCHOR } from '#/features/national/CheckTable'
import { barWidth, localWidth } from '#/features/national/national'
import { useI18n } from '#/i18n/context'

// Block 4, "Pe domenii": COFOG by division, largest first. Each bar is the division's
// total; its darker part is local government's share, taken from COFOG itself (S1313
// over S13), so both sides of the share are one source and one measure. Our own local
// figures by domain are never drawn here: they are in the check table.
export function DomainsCard({ domains }: { domains: Domains | null }) {
  const { t, f } = useI18n()
  const words = t.national.domains
  const largest = Math.max(
    0,
    ...(domains?.divisions ?? []).map((division) => division.total),
  )

  return (
    <Card size="3" id={DOMAINS_ANCHOR}>
      <Flex direction="column" gap="4">
        <Flex direction="column" gap="1">
          <Heading as="h2" size="5">
            {words.title}
          </Heading>
          {domains ? (
            <Text size="2" color="gray">
              {words.lead(String(domains.year))}
            </Text>
          ) : null}
        </Flex>
        {domains ? (
          <>
            <Flex gap="4" wrap="wrap" aria-hidden>
              <Legend color="var(--indigo-9)" text={words.local} />
              <Legend color="var(--indigo-5)" text={words.rest} />
            </Flex>
            <Flex direction="column" gap="3" asChild>
              <ol style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {domains.divisions.map((division) => {
                  const name = words.names[division.cofog] ?? division.label
                  const share =
                    division.local > 0
                      ? words.localShare(f.percent(division.local_share))
                      : words.centralOnly
                  return (
                    <li key={division.cofog}>
                      <Flex justify="between" align="baseline" gap="3">
                        <Text size="2">{name}</Text>
                        <Text
                          size="2"
                          weight="medium"
                          style={{ whiteSpace: 'nowrap' }}
                        >
                          {f.leiBillions(division.total)}
                        </Text>
                      </Flex>
                      <Box
                        mt="1"
                        style={{
                          height: 8,
                          borderRadius: 'var(--radius-1)',
                          overflow: 'hidden',
                          width: barWidth(division.total, largest),
                          background: 'var(--indigo-5)',
                        }}
                      >
                        <Box
                          style={{
                            height: '100%',
                            width: localWidth(division.local_share),
                            background: 'var(--indigo-9)',
                          }}
                        />
                      </Box>
                      <Text as="div" size="1" color="gray" mt="1">
                        {share}
                      </Text>
                    </li>
                  )
                })}
              </ol>
            </Flex>
            <Text size="1" color="gray">
              {words.source(
                String(domains.year),
                f.leiBillions(domains.total),
                f.day(domains.updated_on),
              )}
            </Text>
          </>
        ) : (
          <Flex direction="column" gap="1" align="start">
            <DataState kind="notCollected" />
            <Text size="1" color="gray">
              {t.national.fills.cofog}
            </Text>
          </Flex>
        )}
      </Flex>
    </Card>
  )
}

function Legend({ color, text }: { color: string; text: string }) {
  return (
    <Flex align="center" gap="2">
      <Box
        style={{ width: 12, height: 12, borderRadius: 2, background: color }}
      />
      <Text size="1" color="gray">
        {text}
      </Text>
    </Flex>
  )
}
