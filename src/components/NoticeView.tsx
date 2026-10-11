import { useSuspenseQuery } from '@tanstack/react-query'
import { InfoCircledIcon } from '@radix-ui/react-icons'
import {
  Badge,
  Callout,
  Card,
  Code,
  Container,
  DataList,
  Flex,
  Grid,
  Heading,
  Text,
} from '@radix-ui/themes'

import { DataState } from '#/components/DataState'
import { EntityLink } from '#/components/EntityLink'
import { NoticeContracts } from '#/components/NoticeContracts'
import { SourceLine } from '#/components/SourceLine'
import { useI18n } from '#/i18n/context'
import { rich } from '#/i18n/rich'
import type { Notice } from '#/lib/api-contracts'
import { financing, publication } from '#/lib/contracts'
import { noticeQuery } from '#/lib/queries'

// The page of one award notice: what SEAP published, every contract in it, and what is
// not public. A notice is not a contract; its total is its own, not a period total.
export function NoticeView({
  id,
  page,
  onPage,
}: {
  id: number
  page: number
  onPage: (page: number) => void
}) {
  const { t, f } = useI18n()
  const { data: notice } = useSuspenseQuery(noticeQuery(id))
  // The route loader answers "not found" before this renders.
  if (!notice) return null

  return (
    <Container size="4" px="5" py="7">
      <Flex direction="column" gap="5">
        <Flex direction="column" gap="3">
          <Text size="2" color="gray">
            {notice.buyer ? (
              <EntityLink role="institutions" cui={notice.buyer.cui}>
                {notice.buyer.name}
              </EntityLink>
            ) : (
              notice.buyer_text
            )}
            {(notice.buyer || notice.buyer_text) && notice.notice_no
              ? ' / '
              : null}
            {notice.notice_no ? (
              <Code variant="ghost">{notice.notice_no}</Code>
            ) : null}
          </Text>
          <Flex gap="2" wrap="wrap">
            <Badge color="gray">{t.notice.kind}</Badge>
            {notice.procedure_type ? (
              <Badge color="gray">{notice.procedure_type}</Badge>
            ) : null}
            {notice.contract_type && notice.cpv_code ? (
              <Badge color="gray">
                {t.notice.typeAndCpv(notice.contract_type, notice.cpv_code)}
              </Badge>
            ) : null}
            <Badge color="gray">
              {t.notice.contractsBadge(
                notice.contracts,
                f.count(notice.contracts),
              )}
            </Badge>
          </Flex>
          <Heading size="7">{notice.title ?? t.notice.fallbackTitle}</Heading>
        </Flex>

        <Grid columns={{ initial: '1', md: '2fr 1fr' }} gap="5" align="start">
          <Flex direction="column" gap="5">
            <Card size="3">
              <Flex direction="column" gap="4">
                <Facts notice={notice} />
                <SourceLine source={notice.source} />
              </Flex>
            </Card>
            <NoticeContracts notice={notice} page={page} onPage={onPage} />
          </Flex>

          <Flex direction="column" gap="4">
            <Card>
              <Flex direction="column" gap="3">
                <Heading size="4">{t.notice.notPublicTitle}</Heading>
                {t.notice.notPublic.map((item) => (
                  <Flex key={item} justify="between" align="center" gap="3">
                    <Text size="2">{item}</Text>
                    <DataState kind="notPublished" />
                  </Flex>
                ))}
              </Flex>
            </Card>
            <Callout.Root color="gray" variant="surface" size="1">
              <Callout.Icon>
                <InfoCircledIcon />
              </Callout.Icon>
              <Callout.Text>
                {rich(t.dataState.explain, {
                  notPublished: (
                    <Text key="notPublished" weight="bold">
                      {t.dataState.notPublished}
                    </Text>
                  ),
                  notCollected: (
                    <Text key="notCollected" weight="bold">
                      {t.dataState.notCollected}
                    </Text>
                  ),
                })}
              </Callout.Text>
            </Callout.Root>
          </Flex>
        </Grid>
      </Flex>
    </Container>
  )
}

function Facts({ notice }: { notice: Notice }) {
  const { t, f } = useI18n()
  const published = publication(notice)
  const money = financing(notice)
  const kinds = [
    notice.ordinary > 0
      ? t.notice.ordinary(notice.ordinary, f.count(notice.ordinary))
      : null,
    notice.frameworks > 0
      ? t.notice.frameworks(notice.frameworks, f.count(notice.frameworks))
      : null,
    notice.subsequent > 0
      ? t.notice.subsequent(notice.subsequent, f.count(notice.subsequent))
      : null,
  ].filter((part) => part !== null)
  const latest = notice.published_at ? (
    f.day(notice.published_at)
  ) : (
    <DataState kind="notPublished" />
  )

  return (
    <DataList.Root size="2">
      <DataList.Item>
        <DataList.Label>{t.notice.buyer}</DataList.Label>
        <DataList.Value>
          {notice.buyer ? (
            <Text>
              <EntityLink role="institutions" cui={notice.buyer.cui}>
                {notice.buyer.name}
              </EntityLink>{' '}
              <Text color="gray">
                {rich(t.common.cui, {
                  cui: (
                    <Code key="cui" variant="ghost">
                      {notice.buyer.cui}
                    </Code>
                  ),
                })}
              </Text>
            </Text>
          ) : (
            (notice.buyer_text ?? <DataState kind="notPublished" />)
          )}
        </DataList.Value>
      </DataList.Item>

      {published === 'once' ? (
        <DataList.Item>
          <DataList.Label>{t.notice.published}</DataList.Label>
          <DataList.Value>{latest}</DataList.Value>
        </DataList.Item>
      ) : (
        <>
          <DataList.Item>
            <DataList.Label>{t.notice.firstPublished}</DataList.Label>
            <DataList.Value>
              {published === 'again' && notice.first_published_at ? (
                f.day(notice.first_published_at)
              ) : (
                <DataState kind="notCollected" />
              )}
            </DataList.Value>
          </DataList.Item>
          {/* Without the versions we cannot say the notice was republished. */}
          <DataList.Item>
            <DataList.Label>
              {published === 'again'
                ? t.notice.lastPublished
                : t.notice.published}
            </DataList.Label>
            <DataList.Value>
              <Text>
                {latest}{' '}
                <Text color="gray">
                  ·{' '}
                  {published === 'again'
                    ? t.notice.latestVersion
                    : t.notice.heldVersion}
                </Text>
              </Text>
            </DataList.Value>
          </DataList.Item>
        </>
      )}

      {/* The notice that opened the procedure; an award that follows none has no row. */}
      {notice.detail?.call_notice_no ? (
        <DataList.Item>
          <DataList.Label>{t.notice.callNotice}</DataList.Label>
          <DataList.Value>
            <Text>
              <Code variant="ghost">{notice.detail.call_notice_no}</Code>
              {notice.detail.call_published_at ? (
                <Text color="gray">
                  {' '}
                  · {f.day(notice.detail.call_published_at)}
                </Text>
              ) : null}
            </Text>
          </DataList.Value>
        </DataList.Item>
      ) : null}

      <DataList.Item>
        <DataList.Label>{t.notice.contractsIn}</DataList.Label>
        <DataList.Value>
          {kinds.length > 0
            ? t.notice.contractsBreakdown(
                f.count(notice.contracts),
                f.list(kinds),
              )
            : f.count(notice.contracts)}
        </DataList.Value>
      </DataList.Item>

      <DataList.Item>
        <DataList.Label>{t.notice.offers}</DataList.Label>
        <DataList.Value>
          <DataState kind="notPublished" />
        </DataList.Value>
      </DataList.Item>

      <DataList.Item>
        <DataList.Label>{t.notice.financing}</DataList.Label>
        <DataList.Value>
          {typeof money === 'string' ? (
            <DataState kind={money} />
          ) : (
            <Flex direction="column" gap="1">
              <Text>{money.join(' · ')}</Text>
              {notice.detail?.eu_project ? (
                <Text size="1" color="gray">
                  {notice.detail.eu_project}
                </Text>
              ) : null}
            </Flex>
          )}
        </DataList.Value>
      </DataList.Item>
    </DataList.Root>
  )
}
