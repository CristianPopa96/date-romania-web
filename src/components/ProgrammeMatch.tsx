import { InfoCircledIcon } from '@radix-ui/react-icons'
import {
  Callout,
  Card,
  Flex,
  Grid,
  Heading,
  Table,
  Text,
} from '@radix-ui/themes'

import { MatchBadge } from '#/components/MatchBadge'
import { SourceLine } from '#/components/SourceLine'
import { useI18n } from '#/i18n/context'
import { MATCHES } from '#/lib/api-programme'
import type { Programme } from '#/lib/api-programme'

// Where the "why" notes sit, so a card can point at them.
export const WHY_ANCHOR = 'de-ce'

// How the payments were tied to contracts: the rule, one card per outcome, why some
// could not be tied, and the files the figures come from.
export function ProgrammeMatch({ programme }: { programme: Programme }) {
  const { t, f } = useI18n()
  const p = t.programme
  const searched = f.span(
    programme.contracts_first_day,
    programme.contracts_last_day,
  )
  // The first file that names builders by tax ID; the ones before it cannot be tied.
  const firstNamed = programme.files.find((file) => file.with_tax_id > 0)
  const counts = programme.payments_match

  return (
    <Flex direction="column" gap="3">
      <Heading size="5">{p.howTitle}</Heading>
      {searched ? (
        <Text size="2" color="gray" style={{ maxWidth: '75ch' }}>
          {p.how(searched.from, searched.to)}
        </Text>
      ) : null}
      <Grid columns={{ initial: '1', sm: '2', md: '4' }} gap="3">
        {MATCHES.map((match) => (
          <Card key={match}>
            <Flex direction="column" gap="2">
              <MatchBadge match={match} label={p.match[match]} />
              <Text size="6" weight="bold">
                {p.payments(counts[match].count, f.count(counts[match].count))}
              </Text>
              <Text size="1" color="gray">
                {p.matchDetail[match]}
              </Text>
              <Text size="1" color="gray">
                {f.leiShort(counts[match].amount)}
              </Text>
            </Flex>
          </Card>
        ))}
      </Grid>
      <Flex direction="column" gap="3" id={WHY_ANCHOR}>
        {counts.none.count > 0 ? (
          <Callout.Root color="gray" variant="surface" size="1">
            <Callout.Icon>
              <InfoCircledIcon />
            </Callout.Icon>
            <Callout.Text>
              <Text weight="bold">{p.whyNoneTitle}</Text> {p.whyNoneLead}{' '}
              {p.whyNone.join(' ')}
            </Callout.Text>
          </Callout.Root>
        ) : null}
        {counts.unnamed.count > 0 ? (
          <Callout.Root color="gray" variant="surface" size="1">
            <Callout.Icon>
              <InfoCircledIcon />
            </Callout.Icon>
            <Callout.Text>
              <Text weight="bold">{p.whyUnnamedTitle}</Text>{' '}
              {firstNamed?.published_on
                ? p.whyUnnamed(f.day(firstNamed.published_on))
                : p.whyUnnamedAll}
            </Callout.Text>
          </Callout.Root>
        ) : null}
      </Flex>

      <Heading size="4" mt="2">
        {p.filesTitle}
      </Heading>
      <Table.Root variant="surface" size="1">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>{p.fileDay}</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell justify="end">
              {p.filePayments}
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell justify="end">
              {p.fileAmount}
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell justify="end">
              {p.fileTaxIds}
            </Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {programme.files.map((file) => (
            <Table.Row key={file.published_on ?? ''}>
              <Table.RowHeaderCell>
                {file.published_on ? f.day(file.published_on) : null}
              </Table.RowHeaderCell>
              <Table.Cell justify="end">{f.count(file.payments)}</Table.Cell>
              <Table.Cell justify="end">{f.lei(file.amount)}</Table.Cell>
              <Table.Cell justify="end">{f.count(file.with_tax_id)}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
      <SourceLine source={programme.source} of="payments" />
      <SourceLine source={programme.contracts_source} of="contracts" />
    </Flex>
  )
}
