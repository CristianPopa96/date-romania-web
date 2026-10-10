import { ExternalLinkIcon } from '@radix-ui/react-icons'
import { Flex, Link, Text } from '@radix-ui/themes'

import type { Source } from '#/lib/api'
import { day } from '#/lib/format'

// Every figure shows where it comes from: "Sursa: SEAP · DA41328491 · preluat 09.10.2026".
export function SourceLine({ source }: { source: Source }) {
  const parts = [
    source.publisher,
    source.record,
    source.fetched_at ? `preluat ${day(source.fetched_at)}` : null,
  ].filter(Boolean)

  return (
    <Flex align="center" gap="2" wrap="wrap">
      <Text size="1" color="gray">
        Sursa: {parts.join(' · ')}
      </Text>
      {source.url ? (
        <Link href={source.url} target="_blank" rel="noreferrer" size="1">
          <Flex align="center" gap="1">
            <ExternalLinkIcon />
            Vezi la sursă
          </Flex>
        </Link>
      ) : null}
    </Flex>
  )
}
