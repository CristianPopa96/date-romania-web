import { Link as RouterLink, useLocation } from '@tanstack/react-router'
import { ExternalLinkIcon } from '@radix-ui/react-icons'
import {
  Button,
  Code,
  DataList,
  Flex,
  Heading,
  Link,
  Popover,
  Text,
} from '@radix-ui/themes'

import { REPORT_ANCHOR } from '#/components/ReportForm'
import { useI18n } from '#/i18n/context'
import type { Source } from '#/lib/api'

// Every figure shows where it comes from: "Sursa: SEAP · DA41328491 · preluat 09.10.2026".
// `of` names what the source is for, where two of them stand side by side.
// The source of one record opens the source panel. A total has no panel: its line says
// how many stored answers it is added up from and leads to the sources page.
export function SourceLine({
  source,
  of,
}: {
  source: Source
  of?: 'contracts' | 'purchases' | 'payments' | 'purchase' | 'items'
}) {
  const { t, f } = useI18n()
  const parts = [
    source.publisher,
    source.record,
    source.fetched_at ? t.source.fetched(f.day(source.fetched_at)) : null,
    source.documents
      ? t.source.addedUp(source.documents, f.count(source.documents))
      : null,
  ]
    .filter(Boolean)
    .join(' · ')
  const text = of ? t.source.of[of](parts) : t.source.line(parts)

  return (
    <Flex align="center" gap="2" wrap="wrap">
      {source.sha256 ? (
        <SourcePanel source={source} text={text} />
      ) : (
        <Text size="1" color="gray">
          {text}
        </Text>
      )}
      {source.documents ? (
        <Link asChild size="1">
          <RouterLink to="/surse">{t.source.sources}</RouterLink>
        </Link>
      ) : source.url ? (
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

// "De unde e cifra asta?": where one record was read, the hash of the stored answer and
// the parser that read it. Our copy is private (it may hold personal codes), so the way
// to the original is the publisher's own page.
function SourcePanel({ source, text }: { source: Source; text: string }) {
  const { t, f } = useI18n()
  const words = t.source.panel
  const { pathname } = useLocation()

  return (
    <Popover.Root>
      <Popover.Trigger>
        <Button
          variant="ghost"
          color="gray"
          size="1"
          style={{ textDecoration: 'underline dotted' }}
        >
          {text}
        </Button>
      </Popover.Trigger>
      <Popover.Content size="2" maxWidth="420px">
        <Flex direction="column" gap="3">
          <Heading as="h2" size="3">
            {words.title}
          </Heading>
          <DataList.Root size="1">
            <DataList.Item>
              <DataList.Label>{words.source}</DataList.Label>
              <DataList.Value>
                {[source.publisher, source.record].filter(Boolean).join(' · ')}
              </DataList.Value>
            </DataList.Item>
            {source.url ? (
              <DataList.Item>
                <DataList.Label>{words.address}</DataList.Label>
                <DataList.Value>
                  <Code variant="ghost" style={{ wordBreak: 'break-all' }}>
                    {source.url}
                  </Code>
                </DataList.Value>
              </DataList.Item>
            ) : null}
            {source.fetched_at ? (
              <DataList.Item>
                <DataList.Label>{words.fetched}</DataList.Label>
                <DataList.Value>{f.day(source.fetched_at)}</DataList.Value>
              </DataList.Item>
            ) : null}
            <DataList.Item>
              <DataList.Label>{words.hash}</DataList.Label>
              <DataList.Value>
                <Code variant="ghost" style={{ wordBreak: 'break-all' }}>
                  {source.sha256}
                </Code>
              </DataList.Value>
            </DataList.Item>
            {source.parser_version ? (
              <DataList.Item>
                <DataList.Label>{words.parser}</DataList.Label>
                <DataList.Value>{source.parser_version}</DataList.Value>
              </DataList.Item>
            ) : null}
          </DataList.Root>
          <Text size="1" color="gray">
            {words.private}
          </Text>
          <Flex gap="3" align="center" wrap="wrap">
            {source.url ? (
              <Button asChild size="1" variant="soft">
                <a href={source.url} target="_blank" rel="noreferrer">
                  <ExternalLinkIcon />
                  {words.open}
                </a>
              </Button>
            ) : null}
            <Link asChild size="1">
              <RouterLink
                to="/surse"
                search={{ despre: pathname }}
                hash={REPORT_ANCHOR}
              >
                {t.report.link}
              </RouterLink>
            </Link>
          </Flex>
        </Flex>
      </Popover.Content>
    </Popover.Root>
  )
}
