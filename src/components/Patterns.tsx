import { useSuspenseQuery } from '@tanstack/react-query'
import { Link as RouterLink } from '@tanstack/react-router'
import { DownloadIcon, InfoCircledIcon } from '@radix-ui/react-icons'
import {
  Button,
  Callout,
  Code,
  Flex,
  Heading,
  Link,
  Table,
  Text,
} from '@radix-ui/themes'

import { DataState } from '#/components/DataState'
import { EntityLink } from '#/components/EntityLink'
import { Unavailable } from '#/components/Notes'
import { SourceLine } from '#/components/SourceLine'
import { useI18n } from '#/i18n/context'
import { rich } from '#/i18n/rich'
import type { NearLimitPair, NearLimitPurchase } from '#/lib/api-patterns'
import { ruleLimits, shareOfLimit } from '#/lib/patterns'
import { nearLimitQuery } from '#/lib/queries'
import { patternCsvPath } from '#/lib/urls'

// The patterns tab: measured facts worth asking documents for, each with its rule, what
// it does and does not mean, and its source. Never an accusation.
export function Patterns({ cpv }: { cpv?: string }) {
  const { t } = useI18n()
  return (
    <Flex direction="column" gap="5">
      <Callout.Root color="gray" variant="surface" size="1">
        <Callout.Icon>
          <InfoCircledIcon />
        </Callout.Icon>
        <Callout.Text>{t.rankings.patterns.intro}</Callout.Text>
      </Callout.Root>
      <NearLimit cpv={cpv} />
      <Later />
    </Flex>
  )
}

function NearLimit({ cpv }: { cpv?: string }) {
  const { t, f } = useI18n()
  const { data } = useSuspenseQuery(nearLimitQuery(cpv))
  const words = t.rankings.patterns.nearLimit
  if (!data) return <Unavailable />
  const limits = ruleLimits(data)
  const days = f.period(data.first_day, data.last_day)

  return (
    <Flex direction="column" gap="3">
      <Heading size="4">{words.title}</Heading>
      <Flex direction="column" gap="1">
        <Text size="2">
          {words.rule(
            f.count(data.rule.repeats),
            f.percent(data.rule.share),
            f.lei(limits.goods),
            f.lei(limits.works),
          )}
        </Text>
        <Text size="2" color="gray">
          {words.meaning}
        </Text>
        <Text size="2" color="gray">
          {words.annex2}
        </Text>
        <Text size="2" color="gray">
          {words.checked(
            f.count(data.checked),
            data.accepted_total,
            f.count(data.accepted_total),
          )}
          {data.unknown_type > 0
            ? ` ${words.unknownType(data.unknown_type, f.count(data.unknown_type))}`
            : null}
        </Text>
        {days ? (
          <Text size="2" color="gray">
            {words.checkedPeriod(days)}
          </Text>
        ) : null}
      </Flex>

      {data.items.length === 0 ? (
        <Text size="2" color="gray">
          {words.none}
        </Text>
      ) : (
        <>
          <Flex justify="between" align="center" gap="3" wrap="wrap">
            <Text size="2" weight="bold">
              {words.pairs(data.pairs, f.count(data.pairs))}
              {data.items.length < data.pairs
                ? ` · ${words.shown(f.count(data.items.length), f.count(data.pairs))}`
                : null}
            </Text>
            {/* Every pair, one line per purchase, with the filter of the tab. */}
            <Button asChild variant="soft" color="gray" size="1">
              <a href={patternCsvPath(cpv)} download>
                <DownloadIcon />
                {t.contracts.export}
              </a>
            </Button>
          </Flex>
          <Table.Root variant="surface" size="1">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell width="25%">
                  {words.buyer}
                </Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell width="25%">
                  {words.supplier}
                </Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>
                  {words.purchases}
                </Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell justify="end">
                  {words.value}
                </Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {data.items.map((pair) => (
                <PairRow
                  key={`${pair.buyer.cui}-${pair.supplier.cui}-${pair.contract_type}`}
                  pair={pair}
                />
              ))}
            </Table.Body>
          </Table.Root>
          <Text size="1" color="gray">
            {t.rankings.patterns.observed}
          </Text>
        </>
      )}
      <SourceLine source={data.source} />
    </Flex>
  )
}

function PairRow({ pair }: { pair: NearLimitPair }) {
  const { t, f } = useI18n()
  const words = t.rankings.patterns.nearLimit
  return (
    <Table.Row>
      <Table.Cell>
        <EntityLink role="institutions" cui={pair.buyer.cui}>
          {pair.buyer.name}
        </EntityLink>
      </Table.Cell>
      <Table.Cell>
        <EntityLink role="suppliers" cui={pair.supplier.cui}>
          {pair.supplier.name}
        </EntityLink>
      </Table.Cell>
      <Table.Cell>
        <Text as="div" size="2">
          {words.fact(
            pair.purchases,
            f.count(pair.purchases),
            words.types[pair.contract_type],
            f.lei(pair.limit),
          )}
        </Text>
        <Flex direction="column" gap="1" mt="1">
          {pair.items.map((purchase) => (
            <PurchaseLine
              key={purchase.id}
              purchase={purchase}
              limit={pair.limit}
            />
          ))}
        </Flex>
      </Table.Cell>
      <Table.Cell justify="end" style={{ whiteSpace: 'nowrap' }}>
        {f.lei(pair.value)}
      </Table.Cell>
    </Table.Row>
  )
}

function PurchaseLine({
  purchase,
  limit,
}: {
  purchase: NearLimitPurchase
  limit: number
}) {
  const { t, f } = useI18n()
  const words = t.rankings.patterns.nearLimit
  return (
    <Text size="1" color="gray" style={{ whiteSpace: 'nowrap' }}>
      <Link asChild>
        <RouterLink
          to="/achizitii-directe/$id"
          params={{ id: String(purchase.id) }}
        >
          <Code variant="ghost">{purchase.code ?? purchase.id}</Code>
        </RouterLink>
      </Link>
      {' · '}
      {purchase.finalized_at ? (
        f.day(purchase.finalized_at)
      ) : (
        <DataState kind="notPublished" />
      )}
      {' · '}
      {f.leiExact(purchase.value)}
      {' · '}
      {words.ofLimit(f.percent(shareOfLimit(purchase.value, limit), 1))}
    </Text>
  )
}

// The other patterns of the flow: why the data held cannot give them yet, or where the
// site shows one outside the rankings.
function Later() {
  const { t } = useI18n()
  const { elsewhere } = t.rankings.patterns
  return (
    <Flex direction="column" gap="2">
      <Heading size="4">{t.rankings.patterns.laterTitle}</Heading>
      {t.rankings.patterns.later.map((pattern) => (
        <Flex key={pattern.title} direction="column" gap="1">
          <Flex gap="2" align="center" wrap="wrap">
            <Text size="2" weight="medium">
              {pattern.title}
            </Text>
            {'notCollected' in pattern ? (
              <DataState kind="notCollected" />
            ) : null}
          </Flex>
          <Text size="2" color="gray">
            {pattern.reason}
          </Text>
        </Flex>
      ))}
      <Flex direction="column" gap="1">
        <Text size="2" weight="medium">
          {elsewhere.title}
        </Text>
        <Text size="2" color="gray">
          {rich(elsewhere.text, {
            programme: (
              <Link key="programme" asChild>
                <RouterLink to="/programe/anghel-saligny">
                  {elsewhere.programme}
                </RouterLink>
              </Link>
            ),
          })}
        </Text>
      </Flex>
    </Flex>
  )
}
