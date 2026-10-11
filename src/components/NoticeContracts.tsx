import { useSuspenseQuery } from '@tanstack/react-query'
import { InfoCircledIcon } from '@radix-ui/react-icons'
import { Callout, Flex, Heading, Table, Text } from '@radix-ui/themes'

import { DataState } from '#/components/DataState'
import { Pager } from '#/components/Pager'
import { Winners } from '#/components/Winners'
import { useI18n } from '#/i18n/context'
import { rich } from '#/i18n/rich'
import { FRAMEWORK, NOTICE_PAGE_SIZE } from '#/lib/api-contracts'
import type { Contract, Notice } from '#/lib/api-contracts'
import { isAssociation, pageCount, shownValue } from '#/lib/contracts'
import { noticeContractsQuery } from '#/lib/queries'

// Every contract of one notice, whatever its date, with the notice's own total above.
export function NoticeContracts({
  notice,
  page,
  onPage,
}: {
  notice: Notice
  page: number
  onPage: (page: number) => void
}) {
  const { t, f } = useI18n()
  const { data } = useSuspenseQuery(noticeContractsQuery(notice.id, page))
  const pages = pageCount(data.total, NOTICE_PAGE_SIZE)
  const explainAssociation = data.items.some(isAssociation)

  return (
    <Flex direction="column" gap="3">
      <Flex justify="between" align="baseline" gap="3" wrap="wrap">
        <Heading size="5">{t.notice.contractsTitle}</Heading>
        {notice.contracts > 0 ? (
          <Text size="2" color="gray">
            {rich(t.notice.total, {
              value: (
                <Text key="value" weight="bold" highContrast>
                  {f.lei(notice.total)}
                </Text>
              ),
            })}
          </Text>
        ) : null}
      </Flex>

      {data.total === 0 ? (
        <Text size="2" color="gray">
          {t.notice.empty}
        </Text>
      ) : (
        <Table.Root variant="surface" size="1">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>
                {t.notice.contract}
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>{t.notice.winner}</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell justify="end">
                {t.notice.value}
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>{t.notice.date}</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {data.items.map((contract) => (
              <ContractRow key={contract.id} contract={contract} />
            ))}
          </Table.Body>
        </Table.Root>
      )}

      <Pager page={page} pages={pages} onPage={onPage} />

      {notice.frameworks > 0 || explainAssociation ? (
        <Callout.Root color="gray" variant="surface" size="1">
          <Callout.Icon>
            <InfoCircledIcon />
          </Callout.Icon>
          <Callout.Text>
            <Text weight="bold">{t.notice.whyTitle}</Text>{' '}
            {notice.frameworks > 0 ? `${t.notice.whyFramework} ` : null}
            {explainAssociation ? t.notice.whyAssociation : null}
          </Callout.Text>
        </Callout.Root>
      ) : null}
    </Flex>
  )
}

function ContractRow({ contract }: { contract: Contract }) {
  const { t, f } = useI18n()
  const framework = contract.kind === FRAMEWORK
  const shown = shownValue(contract)
  // What the API left out of the notice's total, and why, in one line under the value.
  const aside = framework
    ? t.notice.ceiling
    : shown?.currency
      ? t.notice.noLei
      : !contract.counted
        ? t.notice.notCounted
        : null

  return (
    <Table.Row>
      <Table.Cell>
        <Text as="div" size="2" style={{ maxWidth: 340 }}>
          {contract.title ??
            (contract.contract_no
              ? t.notice.contractNo(contract.contract_no)
              : contract.notice_title)}
        </Text>
        {contract.kind !== null && t.notice.kinds[contract.kind] ? (
          <Text as="div" size="1" color="gray">
            {t.notice.kinds[contract.kind]}
          </Text>
        ) : null}
      </Table.Cell>
      <Table.Cell>
        <Winners winners={contract.winners} />
      </Table.Cell>
      <Table.Cell justify="end" style={{ whiteSpace: 'nowrap' }}>
        {shown === null ? (
          <DataState kind="notPublished" />
        ) : (
          // Muted when it is not in the total: a ceiling, or a value with no lei amount.
          <Text
            color={contract.counted && !shown.currency ? undefined : 'gray'}
          >
            {shown.currency
              ? t.notice.foreign(f.count(shown.amount), shown.currency)
              : f.lei(shown.amount)}
          </Text>
        )}
        {shown !== null && aside ? (
          <Text as="div" size="1" color="gray">
            {aside}
          </Text>
        ) : null}
      </Table.Cell>
      <Table.Cell style={{ whiteSpace: 'nowrap' }}>
        {contract.signed_at ? (
          <Text color="gray">{f.day(contract.signed_at)}</Text>
        ) : (
          <DataState kind="notPublished" />
        )}
      </Table.Cell>
    </Table.Row>
  )
}
