import { useSuspenseQuery } from '@tanstack/react-query'
import { Link as RouterLink } from '@tanstack/react-router'
import { InfoCircledIcon } from '@radix-ui/react-icons'
import {
  Box,
  Callout,
  Code,
  Flex,
  Heading,
  Link,
  Table,
  Text,
  VisuallyHidden,
} from '@radix-ui/themes'
import type { ReactNode } from 'react'

import { ConfidenceBadge } from '#/components/ConfidenceBadge'
import { DataState } from '#/components/DataState'
import { EntityLink } from '#/components/EntityLink'
import { Pager } from '#/components/Pager'
import { Winners } from '#/components/Winners'
import { useI18n } from '#/i18n/context'
import { rich } from '#/i18n/rich'
import type { EntityRef } from '#/lib/api'
import type { EuSeapOf } from '#/lib/api-eu'
import { PAGE_SIZE } from '#/lib/api'
import { euSeapQuery } from '#/lib/queries'

// The SEAP records whose text cites a project (the SEAP section of `ScreenEUProject`):
// the contracts of its award notices, paged, and its direct purchases, in
// two tables, since the site never puts the two together. Every row is tied by what the
// buyer wrote, so every badge is medium. `beneficiary` is the project's own entity, when
// tied: a row bought by another (a partner) names its buyer.
export function EuSeapSection({
  of,
  beneficiary,
  onPage,
}: {
  of: EuSeapOf
  beneficiary: number | null
  onPage: (page: number) => void
}) {
  const { t, f } = useI18n()
  const s = t.eu.seap
  const { data: links } = useSuspenseQuery(euSeapQuery(of))
  // The API has no such endpoint yet: no section rather than a false "nothing".
  if (links === null) return null
  if (links === 'failed') {
    return (
      <Flex direction="column" gap="3">
        <Heading as="h2" size="5">
          {s.title}
        </Heading>
        <Text size="2" color="gray">
          {s.failed}
        </Text>
      </Flex>
    )
  }
  const badge = (record: 'notice' | 'purchase', cited: string) => (
    <ConfidenceBadge
      level="probable"
      label={s.badge[of.kind][record]}
      help={s.help[of.kind](cited)}
    />
  )
  // Only against a beneficiary we hold: with none, the lead's own rows would read as bought
  // by someone else.
  const boughtBy = (buyer: EntityRef | null) =>
    buyer && beneficiary !== null && buyer.cui !== beneficiary
      ? s.boughtBy(buyer.name)
      : null
  const empty = links.contracts_total === 0 && links.purchases.length === 0

  return (
    <Flex direction="column" gap="3">
      <Flex justify="between" align="baseline" gap="3" wrap="wrap">
        <Heading as="h2" size="5">
          {s.title}
        </Heading>
        <Text size="1" color="gray">
          {s.note[of.kind]}
        </Text>
      </Flex>

      {empty ? (
        <Text size="2" color="gray">
          {s.none[of.kind]}
        </Text>
      ) : null}

      {links.contracts_total > 0 ? (
        <Flex direction="column" gap="2">
          <Heading as="h3" size="3">
            {s.contracts(links.contracts_total, f.count(links.contracts_total))}
          </Heading>
          <SeapTable caption={s.contractsCaption} first={s.contract}>
            {links.contracts.map(({ contract, cited }) => (
              <Table.Row key={contract.id}>
                <Table.Cell>
                  <Record
                    title={
                      <RouterLink
                        to="/contracte/$id"
                        params={{ id: String(contract.notice_id) }}
                      >
                        {contract.title ??
                          contract.notice_title ??
                          t.notice.fallbackTitle}
                      </RouterLink>
                    }
                    code={contract.notice_no}
                    cpv={contract.cpv_code}
                    note={boughtBy(contract.buyer)}
                  />
                </Table.Cell>
                <Table.Cell>
                  <Winners winners={contract.winners} />
                </Table.Cell>
                <Table.Cell justify="end" style={{ whiteSpace: 'nowrap' }}>
                  {contract.value === null ? (
                    <DataState kind="notPublished" />
                  ) : (
                    <Text color={contract.counted ? undefined : 'gray'}>
                      {f.lei(contract.value)}
                    </Text>
                  )}
                  {/* A framework agreement is a ceiling, never money spent. */}
                  {contract.counted ? null : (
                    <Text as="div" size="1" color="gray">
                      {t.notice.ceiling}
                    </Text>
                  )}
                </Table.Cell>
                <Table.Cell>{badge('notice', cited)}</Table.Cell>
              </Table.Row>
            ))}
          </SeapTable>
          <Pager
            page={of.page}
            pages={Math.ceil(links.contracts_total / PAGE_SIZE)}
            onPage={onPage}
          />
        </Flex>
      ) : null}

      {links.purchases.length > 0 ? (
        <Flex direction="column" gap="2">
          <Heading as="h3" size="3">
            {s.purchases(
              links.purchases.length,
              f.count(links.purchases.length),
            )}
          </Heading>
          <SeapTable caption={s.purchasesCaption} first={s.purchase}>
            {links.purchases.map(({ purchase, cited }) => (
              <Table.Row key={purchase.id}>
                <Table.Cell>
                  <Record
                    title={
                      <RouterLink
                        to="/achizitii-directe/$id"
                        params={{ id: String(purchase.id) }}
                      >
                        {purchase.name ?? purchase.code}
                      </RouterLink>
                    }
                    code={purchase.code}
                    cpv={purchase.cpv_code}
                    note={boughtBy(purchase.buyer)}
                  />
                </Table.Cell>
                <Table.Cell>
                  {purchase.supplier ? (
                    <EntityLink role="suppliers" cui={purchase.supplier.cui}>
                      {purchase.supplier.name}
                    </EntityLink>
                  ) : (
                    (purchase.supplier_text ?? (
                      <DataState kind="notPublished" />
                    ))
                  )}
                </Table.Cell>
                <Table.Cell justify="end" style={{ whiteSpace: 'nowrap' }}>
                  {purchase.value === null ? (
                    <DataState kind="notPublished" />
                  ) : (
                    f.lei(purchase.value)
                  )}
                </Table.Cell>
                <Table.Cell>{badge('purchase', cited)}</Table.Cell>
              </Table.Row>
            ))}
          </SeapTable>
        </Flex>
      ) : null}

      <Callout.Root color="gray" variant="surface">
        <Callout.Icon>
          <InfoCircledIcon />
        </Callout.Icon>
        <Callout.Text>{s.incomplete[of.kind]}</Callout.Text>
      </Callout.Root>
    </Flex>
  )
}

function SeapTable({
  caption,
  first,
  children,
}: {
  caption: string
  first: string
  children: ReactNode
}) {
  const { t } = useI18n()
  const s = t.eu.seap
  return (
    <Table.Root variant="surface" size="1">
      {/* Radix puts props on its wrapper, not the table: a caption names it. */}
      <VisuallyHidden asChild>
        <caption>{caption}</caption>
      </VisuallyHidden>
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeaderCell>{first}</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>{s.supplier}</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell justify="end">
            {s.value}
          </Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>{s.link}</Table.ColumnHeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>{children}</Table.Body>
    </Table.Root>
  )
}

// A notice's contract or a purchase: its title, a link to its page, and under it its
// number, CPV code and, when another bought it, the buyer.
function Record({
  title,
  code,
  cpv,
  note,
}: {
  title: ReactNode
  code: string | null
  cpv: string | null
  note: string | null
}) {
  const { t } = useI18n()
  const parts = [
    code ? <Code variant="ghost">{code}</Code> : null,
    cpv
      ? rich(t.common.cpv, {
          code: (
            <Code key="code" variant="ghost">
              {cpv}
            </Code>
          ),
        })
      : null,
    note,
  ].filter((part) => part !== null)
  return (
    <Box style={{ minWidth: 220, maxWidth: 420 }}>
      <Text as="div" size="2">
        <Link asChild>{title}</Link>
      </Text>
      <Text as="div" size="1" color="gray">
        {parts.map((part, index) => (
          <span key={index}>
            {index > 0 ? ' · ' : null}
            {part}
          </span>
        ))}
      </Text>
    </Box>
  )
}
