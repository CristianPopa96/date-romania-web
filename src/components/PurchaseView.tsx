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
import { PurchaseItems } from '#/components/PurchaseItems'
import { SourceLine } from '#/components/SourceLine'
import { useI18n } from '#/i18n/context'
import { rich } from '#/i18n/rich'
import { ACCEPTED } from '#/lib/api'
import type { EntityRef, PurchaseWithDetail, Role } from '#/lib/api'
import { pairSummaryQuery, purchaseQuery } from '#/lib/queries'

// The page of one direct purchase, from what SEAP's list gives. What it bought, and on
// which terms, comes from the purchase's own page in SEAP, collected for some purchases.
export function PurchaseView({ id }: { id: number }) {
  const { t } = useI18n()
  const { data: purchase } = useSuspenseQuery(purchaseQuery(id))
  // The route loader answers "not found" before this renders.
  if (!purchase) return null

  return (
    <Container size="4" px="5" py="7">
      <Flex direction="column" gap="5">
        <Flex direction="column" gap="3">
          <Text size="2" color="gray">
            {purchase.buyer ? (
              <EntityLink role="institutions" cui={purchase.buyer.cui}>
                {purchase.buyer.name}
              </EntityLink>
            ) : (
              purchase.buyer_text
            )}
            {(purchase.buyer || purchase.buyer_text) && purchase.code
              ? ' / '
              : null}
            {purchase.code ? (
              <Code variant="ghost">{purchase.code}</Code>
            ) : null}
          </Text>
          <Flex gap="2" wrap="wrap">
            <Badge color="gray">{t.purchase.kind}</Badge>
            {purchase.cpv_code ? (
              <Badge color="gray">
                {rich(t.common.cpv, { code: purchase.cpv_code })}
              </Badge>
            ) : null}
          </Flex>
          <Heading size="7">
            {purchase.name ?? t.purchase.fallbackTitle}
          </Heading>
        </Flex>

        <Grid columns={{ initial: '1', md: '2fr 1fr' }} gap="5" align="start">
          <Flex direction="column" gap="5">
            <Card size="3">
              <Flex direction="column" gap="4">
                <Facts purchase={purchase} />
                <SourceLine source={purchase.source} />
              </Flex>
            </Card>
            <PurchaseItems detail={purchase.detail} />
          </Flex>

          <Flex direction="column" gap="4">
            <Callout.Root color="gray" variant="surface" size="1">
              <Callout.Icon>
                <InfoCircledIcon />
              </Callout.Icon>
              <Callout.Text>
                <Text weight="bold">{t.purchase.whatTitle}</Text>{' '}
                {t.purchase.what}
              </Callout.Text>
            </Callout.Root>
            {purchase.buyer && purchase.supplier ? (
              <SamePair
                buyer={purchase.buyer.cui}
                supplier={purchase.supplier.cui}
              />
            ) : null}
          </Flex>
        </Grid>
      </Flex>
    </Container>
  )
}

function Party({
  role,
  entity,
  text,
}: {
  role: Role
  entity: EntityRef | null
  text: string | null
}) {
  const { t } = useI18n()
  if (!entity) return <>{text ?? <DataState kind="notPublished" />}</>
  return (
    <Text>
      <EntityLink role={role} cui={entity.cui}>
        {entity.name}
      </EntityLink>{' '}
      <Text color="gray">
        {rich(t.common.cui, {
          cui: (
            <Code key="cui" variant="ghost">
              {entity.cui}
            </Code>
          ),
        })}
      </Text>
    </Text>
  )
}

function Facts({ purchase }: { purchase: PurchaseWithDetail }) {
  const { t, f } = useI18n()
  const accepted = purchase.state_id === ACCEPTED
  // Only an accepted purchase at or under the legal limit is money spent.
  const counted = accepted && !purchase.above_limit

  return (
    <DataList.Root size="2">
      <DataList.Item>
        <DataList.Label>{t.purchase.buyer}</DataList.Label>
        <DataList.Value>
          <Party
            role="institutions"
            entity={purchase.buyer}
            text={purchase.buyer_text}
          />
        </DataList.Value>
      </DataList.Item>
      <DataList.Item>
        <DataList.Label>{t.purchase.supplier}</DataList.Label>
        <DataList.Value>
          <Party
            role="suppliers"
            entity={purchase.supplier}
            text={purchase.supplier_text}
          />
        </DataList.Value>
      </DataList.Item>
      <DataList.Item>
        <DataList.Label>{t.purchase.value}</DataList.Label>
        <DataList.Value>
          {purchase.value === null ? (
            <DataState kind="notPublished" />
          ) : (
            <Flex gap="2" align="center" wrap="wrap">
              <Text color={counted ? undefined : 'gray'}>
                {t.purchase.valueWithoutVat(f.lei(purchase.value))}
              </Text>
              {!accepted ? (
                <Badge color="gray">{t.purchase.notAccepted}</Badge>
              ) : null}
              {accepted && purchase.above_limit ? (
                // What SEAP publishes, stated as a fact: not an error, not a breach.
                <Badge color="amber">{t.purchase.aboveLimit}</Badge>
              ) : null}
            </Flex>
          )}
        </DataList.Value>
      </DataList.Item>
      <DataList.Item>
        <DataList.Label>{t.purchase.limit}</DataList.Label>
        <DataList.Value>
          {purchase.limit === null
            ? t.purchase.noLimit
            : t.purchase.limitOf(
                f.lei(purchase.limit),
                (purchase.contract_type_id &&
                  t.purchase.limitTypes[purchase.contract_type_id]) ||
                  t.purchase.limitUnknownType,
              )}
        </DataList.Value>
      </DataList.Item>
      <DataList.Item>
        <DataList.Label>{t.purchase.state}</DataList.Label>
        <DataList.Value>
          <Badge color={accepted ? 'green' : 'gray'}>
            {(purchase.state_id && t.purchases.states[purchase.state_id]) ||
              purchase.state ||
              t.common.notPublished}
          </Badge>
        </DataList.Value>
      </DataList.Item>
      <DataList.Item>
        <DataList.Label>{t.purchase.date}</DataList.Label>
        <DataList.Value>
          {purchase.finalized_at ? (
            f.day(purchase.finalized_at)
          ) : (
            <DataState kind="notPublished" />
          )}
        </DataList.Value>
      </DataList.Item>
      <DataList.Item>
        <DataList.Label>{t.purchase.payment}</DataList.Label>
        <DataList.Value>
          <Condition
            detail={purchase.detail}
            text={purchase.detail?.payment_condition}
          />
        </DataList.Value>
      </DataList.Item>
      <DataList.Item>
        <DataList.Label>{t.purchase.delivery}</DataList.Label>
        <DataList.Value>
          <Condition
            detail={purchase.detail}
            text={purchase.detail?.delivery_condition}
          />
        </DataList.Value>
      </DataList.Item>
    </DataList.Root>
  )
}

// A condition in the buyer's own words; not collected until the purchase's detail is.
function Condition({
  detail,
  text,
}: {
  detail: PurchaseWithDetail['detail']
  text: string | null | undefined
}) {
  if (detail === null) return <DataState kind="notCollected" />
  return text ? <Text>{text}</Text> : <DataState kind="notPublished" />
}

// What this buyer bought directly from this supplier over the days we hold.
function SamePair({ buyer, supplier }: { buyer: number; supplier: number }) {
  const { t, f } = useI18n()
  const { data: pair } = useSuspenseQuery(pairSummaryQuery(buyer, supplier))
  const days = pair && f.period(pair.first_day, pair.last_day)
  // The purchases the value adds up: accepted, at or under the legal limit.
  const counted = pair ? pair.accepted - pair.above_limit : 0
  if (!pair || !days || counted === 0) return null

  return (
    <Card>
      <Flex direction="column" gap="2">
        <Text size="1" color="gray" weight="medium">
          {t.purchase.samePair}
        </Text>
        <Text size="2">
          {t.purchase.samePairFigure(
            counted,
            f.count(counted),
            f.lei(pair.value),
            days,
          )}
        </Text>
      </Flex>
    </Card>
  )
}
