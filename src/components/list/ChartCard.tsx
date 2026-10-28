import { Card, Flex, Heading, Text, VisuallyHidden } from '@radix-ui/themes'

import { useI18n } from '#/i18n/context'

// A small chart above a list that answers one question about the filtered list
// (ChartCard in the design system). The title names what is counted, the unit follows it,
// and the numbers are also a table a screen reader can read.
export function ChartCard({
  title,
  unit,
  hint,
  note,
  rows,
  children,
}: {
  title: string
  unit: string
  hint?: string
  note?: string | null
  rows: Array<[string, string]>
  children: React.ReactNode
}) {
  const { t } = useI18n()
  return (
    <Card size="2" style={{ flex: '1 1 320px', minWidth: 0 }}>
      <Flex direction="column" gap="3">
        <Flex justify="between" align="baseline" gap="3" wrap="wrap">
          <Heading as="h3" size="3">
            {title}{' '}
            <Text size="2" weight="regular" color="gray">
              · {unit}
            </Text>
          </Heading>
          {hint ? (
            <Text size="1" color="gray">
              {hint}
            </Text>
          ) : null}
        </Flex>
        {children}
        {note ? (
          <Text size="1" color="gray">
            {note}
          </Text>
        ) : null}
        <VisuallyHidden>
          <table>
            <caption>{t.list.chart.tableCaption(title)}</caption>
            <tbody>
              {rows.map(([label, value]) => (
                <tr key={label}>
                  <th scope="row">{label}</th>
                  <td>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </VisuallyHidden>
      </Flex>
    </Card>
  )
}
