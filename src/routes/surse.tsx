import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { DownloadIcon } from '@radix-ui/react-icons'
import { Button, Container, Flex, Heading, Text } from '@radix-ui/themes'

import { Corrections } from '#/components/Corrections'
import { Methodology } from '#/components/Methodology'
import { Unavailable } from '#/components/Notes'
import { ReportForm } from '#/components/ReportForm'
import { SourcesTable, SourcesToCome } from '#/components/SourcesTable'
import { UrlTabs } from '#/components/UrlTabs'
import { messagesFor } from '#/i18n'
import { useI18n } from '#/i18n/context'
import { pageTitle } from '#/lib/copy'
import { correctionsQuery, datasetsQuery } from '#/lib/queries'
import { contractsCsvPath, validateSourcesSearch } from '#/lib/urls'

// Where the data comes from: the sources we hold, the ones still to come, how the
// figures are counted, and what readers reported and we corrected.
export const Route = createFileRoute('/surse')({
  validateSearch: validateSourcesSearch,
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(datasetsQuery),
      context.queryClient.ensureQueryData(correctionsQuery),
    ]),
  head: ({ match }) => ({
    meta: [
      { title: pageTitle(messagesFor(match.context.locale).sources.title) },
    ],
  }),
  component: Sources,
})

function Sources() {
  const { t, f } = useI18n()
  const { fila, despre } = Route.useSearch()
  const navigate = Route.useNavigate()
  const { data: datasets } = useSuspenseQuery(datasetsQuery)
  const { data: corrections } = useSuspenseQuery(correctionsQuery)
  const tab = fila ?? 'surse'

  return (
    <Container size="4" px="5" py="7">
      <Flex direction="column" gap="5">
        <Flex direction="column" gap="2">
          <Text size="1" color="gray" weight="medium">
            {t.sources.eyebrow}
          </Text>
          <Heading size="7">{t.sources.title}</Heading>
          <Text size="3" color="gray" style={{ maxWidth: '70ch' }}>
            {t.sources.lead}
          </Text>
        </Flex>

        {datasets.length === 0 ? (
          <Unavailable />
        ) : (
          <UrlTabs
            value={tab}
            tabs={[
              {
                value: 'surse',
                label: t.sources.tabSources(f.count(datasets.length)),
              },
              { value: 'metodologie', label: t.sources.tabMethod },
              {
                value: 'corecturi',
                label:
                  corrections && corrections.length > 0
                    ? t.corrections.tabCounted(f.count(corrections.length))
                    : t.corrections.tab,
              },
            ]}
            onChange={(value) =>
              void navigate({
                search: (old) => ({
                  ...old,
                  fila: value === 'surse' ? undefined : value,
                }),
                resetScroll: false,
              })
            }
          >
            {tab === 'surse' ? (
              <>
                <SourcesTable datasets={datasets} />
                <SourcesToCome />
                <Flex direction="column" gap="2" align="start">
                  <Heading size="5">{t.sources.reuseTitle}</Heading>
                  <Text size="2" color="gray" style={{ maxWidth: '70ch' }}>
                    {t.sources.reuse}
                  </Text>
                  <Button asChild variant="soft" color="gray">
                    {/* A file from the server, not a page of the site. */}
                    <a href={contractsCsvPath({})} download>
                      <DownloadIcon />
                      {t.sources.exportContracts}
                    </a>
                  </Button>
                </Flex>
                <ReportForm about={despre} />
              </>
            ) : tab === 'metodologie' ? (
              <Methodology datasets={datasets} />
            ) : (
              <Corrections items={corrections} />
            )}
          </UrlTabs>
        )}
      </Flex>
    </Container>
  )
}
