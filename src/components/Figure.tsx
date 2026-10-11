import { Card, Flex, Text } from '@radix-ui/themes'

// One headline number with its label, and optional lines of detail under it.
export function Figure({
  label,
  value,
  detail,
  size = '6',
}: {
  label: string
  value: string
  detail?: string | Array<string>
  size?: '5' | '6'
}) {
  const lines = typeof detail === 'string' ? [detail] : (detail ?? [])
  return (
    <Card>
      <Flex direction="column" gap="1">
        <Text size="2" color="gray">
          {label}
        </Text>
        <Text size={size} weight="bold">
          {value}
        </Text>
        {lines.map((line) => (
          <Text key={line} size="1" color="gray">
            {line}
          </Text>
        ))}
      </Flex>
    </Card>
  )
}
