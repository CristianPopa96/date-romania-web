import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, redirect } from '@tanstack/react-router'
import {
  Badge,
  Card,
  Code,
  Container,
  Flex,
  Heading,
  Text,
} from '@radix-ui/themes'

import { EntityLink, roleOfKind } from '#/components/EntityLink'
import { SearchBox } from '#/components/SearchBox'
import { UrlTabs } from '#/components/UrlTabs'
import { messagesFor } from '#/i18n'
import { useI18n } from '#/i18n/context'
import { rich } from '#/i18n/rich'
import type { Entity } from '#/lib/api'
import { pageTitle } from '#/lib/copy'
import { cuiFromQuery, searchTerm } from '#/lib/cui'
import { searchQuery } from '#/lib/queries'
import { validateSearchSearch } from '#/lib/urls'
import type { SearchKind } from '#/lib/urls'

export const Route = createFileRoute('/cautare')({
  validateSearch: validateSearchSearch,
  loaderDeps: ({ search }) => ({ q: String(search.q) }),
  loader: async ({ context, deps }) => {
    const found = await context.queryClient.ensureQueryData(
      searchQuery(searchTerm(deps.q)),
    )
    // A CUI we hold skips the results: the institution page when it buys, else the
    // supplier page. The API holds only valid CUIs, so the match is the check.
    const cui = cuiFromQuery(deps.q)
    const exact = cui === null ? null : found.find((e) => e.cui === cui)
    if (exact) {
      throw redirect({
        to:
          roleOfKind(exact.kind) === 'institutions'
            ? '/institutii/$cui'
            : '/furnizori/$cui',
        params: { cui: String(exact.cui) },
      })
    }
  },
  head: ({ match }) => ({
    meta: [
      { title: pageTitle(messagesFor(match.context.locale).search.title) },
    ],
  }),
  component: Search,
})

// Which results a tab keeps. Only the kinds we hold have a tab.
function ofKind(found: Array<Entity>, kind: SearchKind | undefined) {
  if (!kind) return found
  return found.filter(
    (entity) => (entity.kind === 'authority') === (kind === 'institutii'),
  )
}

function Search() {
  const search = Route.useSearch()
  const q = String(search.q)
  const { tip } = search
  const navigate = Route.useNavigate()
  const { t, f } = useI18n()
  const { data: found } = useSuspenseQuery(searchQuery(searchTerm(q)))
  const shown = ofKind(found, tip)
  const tabs = [
    { value: 'toate', label: t.search.all, kind: undefined },
    { value: 'institutii', label: t.search.institutions, kind: 'institutii' },
    { value: 'firme', label: t.search.companies, kind: 'firme' },
  ] as const

  return (
    <Container size="3" px="5" py="7">
      <Flex direction="column" gap="5">
        <Heading size="6">{t.search.title}</Heading>
        {/* The key resets the box when the address changes, e.g. on Back. */}
        <SearchBox key={q} initial={q} />

        {q.trim().length < 2 ? (
          <Text size="2" color="gray">
            {t.search.tooShort}
          </Text>
        ) : found.length === 0 ? (
          <Text size="2" color="gray">
            {t.search.none(q)}
          </Text>
        ) : (
          <Flex direction="column" gap="3">
            <Text size="2" color="gray">
              {t.search.found(found.length, f.count(found.length), q)}{' '}
              {t.search.cuiHint}
            </Text>
            <UrlTabs
              value={tip ?? 'toate'}
              gap="3"
              tabs={tabs.map((tab) => ({
                value: tab.value,
                label: (
                  <Flex gap="2" align="center">
                    {tab.label}
                    <Badge color="gray">
                      {f.count(ofKind(found, tab.kind).length)}
                    </Badge>
                  </Flex>
                ),
              }))}
              onChange={(value) =>
                void navigate({
                  search: {
                    q: search.q,
                    tip: tabs.find((tab) => tab.value === value)?.kind,
                  },
                  resetScroll: false,
                })
              }
            >
              {shown.length === 0 ? (
                <Text size="2" color="gray">
                  {t.search.noneOfKind}
                </Text>
              ) : null}
              {shown.map((entity) => (
                <Card key={entity.cui}>
                  <Flex justify="between" align="center" gap="3">
                    <Flex direction="column" gap="1">
                      <Text size="3" weight="medium">
                        <EntityLink
                          role={roleOfKind(entity.kind)}
                          cui={entity.cui}
                        >
                          {entity.name}
                        </EntityLink>
                      </Text>
                      <Text size="1" color="gray">
                        {rich(t.common.cui, {
                          cui: (
                            <Code key="cui" variant="ghost">
                              {entity.cui}
                            </Code>
                          ),
                        })}
                      </Text>
                    </Flex>
                    <Badge color="gray">
                      {entity.kind === 'authority'
                        ? t.common.institution
                        : t.common.company}
                    </Badge>
                  </Flex>
                </Card>
              ))}
            </UrlTabs>
          </Flex>
        )}
      </Flex>
    </Container>
  )
}
