import { ExternalLinkIcon } from '@radix-ui/react-icons'
import { Flex, Link, Text } from '@radix-ui/themes'

import { useI18n } from '#/i18n/context'
import type { Source } from '#/lib/api'

// Every figure shows where it comes from: "Sursa: SEAP · DA41328491 · preluat 09.10.2026".
// `of` names what the source is for, where two of them stand side by side.
export function SourceLine({
  source,
  of,
}: {
  source: Source
  of?: 'contracts' | 'purchases'
}) {
  const { t, f } = useI18n()
  const parts = [
    source.publisher,
    source.record,
    source.fetched_at ? t.source.fetched(f.day(source.fetched_at)) : null,
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <Flex align="center" gap="2" wrap="wrap">
      <Text size="1" color="gray">
        {of ? t.source.of[of](parts) : t.source.line(parts)}
      </Text>
      {source.url ? (
        <Link href={source.url} target="_blank" rel="noreferrer" size="1">
          <Flex align="center" gap="1">
            <ExternalLinkIcon />
            {t.source.open}
          </Flex>
        </Link>
      ) : null}
    </Flex>
  )
}
