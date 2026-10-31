import type { ReactNode } from 'react'
import { ArrowDownIcon, ArrowRightIcon } from '@radix-ui/react-icons'
import { Box, Card, Code, Flex, Heading, Text } from '@radix-ui/themes'

// One step: its number and name, what happens there, its main figure and its items. The
// order is the order the data travels in.
export function Step({
  n,
  title,
  text,
  tech,
  figure,
  children,
}: {
  n: number
  title: string
  text: string
  tech: string | false
  figure?: string
  children: ReactNode
}) {
  return (
    <Card style={{ flex: 1, minWidth: 0 }}>
      <Flex direction="column" gap="2">
        <Text size="1" color="gray" weight="medium">
          {n}
        </Text>
        <Heading size="3">{title}</Heading>
        <Text size="2" color="gray">
          {text}
        </Text>
        {tech ? (
          <Text size="1" color="gray">
            <Code variant="ghost">{tech}</Code>
          </Text>
        ) : null}
        {figure ? (
          <Text
            size="4"
            weight="bold"
            style={{ fontVariantNumeric: 'tabular-nums' }}
          >
            {figure}
          </Text>
        ) : null}
        <Flex direction="column" gap="2">
          {children}
        </Flex>
      </Flex>
    </Card>
  )
}

// One thing a step holds. Off the lane chosen it fades, so the lane's path stands out.
export function Item({
  lit,
  tech,
  children,
}: {
  lit: boolean
  tech?: string | null
  children: ReactNode
}) {
  return (
    <Box style={{ opacity: lit ? 1 : 0.35, transition: 'opacity 150ms' }}>
      <Text as="div" size="1">
        {children}
      </Text>
      {tech ? (
        <Text as="div" size="1" color="gray">
          <Code variant="ghost">{tech}</Code>
        </Text>
      ) : null}
    </Box>
  )
}

export function Arrow() {
  return (
    <Flex align="center" justify="center" aria-hidden>
      <Box display={{ initial: 'none', md: 'block' }}>
        <ArrowRightIcon color="var(--gray-9)" />
      </Box>
      <Box display={{ initial: 'block', md: 'none' }}>
        <ArrowDownIcon color="var(--gray-9)" />
      </Box>
    </Flex>
  )
}
