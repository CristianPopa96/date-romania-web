import { Card, Flex, Text } from '@radix-ui/themes'

// One headline number with its label, and an optional line of detail under it.
export function Figure({
  label,
  value,
  detail,
  size = '6',
}: {
  label: string
  value: string
  detail?: string
  size?: '5' | '6'
}) {
  return (
    <Card>
      <Flex direction="column" gap="1">
        <Text size="2" color="gray">
          {label}
        </Text>
        <Text size={size} weight="bold">
          {value}
        </Text>
        {detail ? (
          <Text size="1" color="gray">
            {detail}
          </Text>
        ) : null}
      </Flex>
    </Card>
  )
}
