import { useSuspenseQuery } from '@tanstack/react-query'
import { Link as RouterLink } from '@tanstack/react-router'
import { ExclamationTriangleIcon } from '@radix-ui/react-icons'
import {
  Callout,
  Card,
  Container,
  Flex,
  Grid,
  Heading,
  Link,
  Text,
} from '@radix-ui/themes'

import { EuSeapSection } from '#/components/EuSeapSection'
import { Facts, ProgressBars } from '#/components/PnrrContractFacts'
import { PnrrPaymentsSection } from '#/components/PnrrPayments'
import { Stat } from '#/components/ProgrammeFigures'
import { SourceLine } from '#/components/SourceLine'
import { useI18n } from '#/i18n/context'
import type { PnrrContract } from '#/lib/api-pnrr'
import { measureLabel, measureSlug, paidSoFar } from '#/lib/pnrr'
import { pnrrContractQuery } from '#/lib/queries'

// One PNRR financing contract (`ScreenEUProject`, its PNRR kind): what it is worth, the
// progress the ministry reports, the facts, the payments that can be told to be its, and
// the SEAP records that cite its number (`page` of their contracts).
export function PnrrContractView({
  id,
  page,
  onPage,
}: {
  id: number
  page: number
  onPage: (page: number) => void
}) {
  const { data: contract } = useSuspenseQuery(pnrrContractQuery(id))
  // The route loader answers "not found" before this renders.
  return contract ? (
    <ContractView contract={contract} page={page} onPage={onPage} />
  ) : null
}

function ContractView({
  contract,
  page,
  onPage,
}: {
  contract: PnrrContract
  page: number
  onPage: (page: number) => void
}) {
  const { t, f } = useI18n()
  const p = t.pnrr
  const first = contract.lines.at(0)
  const measures = contract.lines.map((line) =>
    measureLabel(line.measure, line.measure_name),
  )
  const ministry = contract.ministry
  const paid = paidSoFar(contract)
  const euShare =
    contract.total && contract.eu !== null ? contract.eu / contract.total : null

  return (
    <Container size="4" px="5" py="7">
      <Flex direction="column" gap="6">
        <Flex direction="column" gap="2">
          <Text size="2" color="gray">
            {p.crumb} /{' '}
            <Link asChild color="gray">
              <RouterLink to="/programe/pnrr">{p.name}</RouterLink>
            </Link>{' '}
            /{' '}
            {first ? (
              <Link asChild color="gray">
                <RouterLink
                  to="/programe/pnrr/$masura"
                  params={{ masura: measureSlug(first.measure) }}
                >
                  {measures[0]}
                </RouterLink>
              </Link>
            ) : null}{' '}
            /{' '}
            {contract.number
              ? p.contractTitle(contract.number)
              : p.fallbackTitle}
          </Text>
          <Text size="1" color="gray" weight="medium">
            {p.contractEyebrow(measures.join(', '), ministry)}
          </Text>
          <Heading size="7">{contract.title ?? p.fallbackTitle}</Heading>
        </Flex>

        <Grid columns={{ initial: '1', md: '2fr 1fr' }} gap="5" align="start">
          <Card size="3">
            <Flex direction="column" gap="4">
              <Grid columns={{ initial: '1', sm: '3' }} gap="5">
                <Stat
                  label={p.total}
                  value={
                    contract.total === null
                      ? t.common.notPublished
                      : f.leiShort(contract.total)
                  }
                  detail={
                    contract.signed_on
                      ? [p.signed(f.day(contract.signed_on))]
                      : []
                  }
                />
                <Stat
                  label={p.eu}
                  value={
                    contract.eu === null
                      ? t.common.notPublished
                      : f.leiShort(contract.eu)
                  }
                  detail={euShare === null ? [] : [f.percent(euShare)]}
                />
                {paid ? (
                  <Stat
                    label={p.paidSoFar}
                    value={paid.count ? f.leiShort(paid.amount) : p.noPayment}
                    detail={
                      paid.count
                        ? [
                            p.paidSoFarDetail(
                              paid.count,
                              f.count(paid.count),
                              paid.lastDay && f.day(paid.lastDay),
                            ),
                          ]
                        : []
                    }
                  />
                ) : (
                  <Stat
                    label={p.paidOnContract}
                    value={p.cannotSay}
                    detail={[p.cannotSayDetail]}
                  />
                )}
              </Grid>
              <ProgressBars contract={contract} />
              <SourceLine
                source={{
                  ...contract.source,
                  record:
                    contract.source.record &&
                    p.edition(contract.source.record, f.day(contract.edition)),
                }}
              />
            </Flex>
          </Card>
          <Facts contract={contract} measures={measures} />
        </Grid>

        <PnrrPaymentsSection contract={contract} />

        <EuSeapSection
          of={{ kind: 'pnrr', id: contract.id, page }}
          beneficiary={contract.beneficiary?.cui ?? null}
          onPage={onPage}
        />

        <Flex direction="column" gap="3">
          <Heading as="h2" size="5">
            {p.notPublicTitle}
          </Heading>
          <Callout.Root color="amber" variant="surface">
            <Callout.Icon>
              <ExclamationTriangleIcon />
            </Callout.Icon>
            <Callout.Text>{p.notPublic}</Callout.Text>
          </Callout.Root>
        </Flex>
      </Flex>
    </Container>
  )
}
