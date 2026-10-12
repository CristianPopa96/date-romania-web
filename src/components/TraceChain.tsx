import type { ReactNode } from 'react'
import { Box, Flex, Text, VisuallyHidden } from '@radix-ui/themes'

import { NOT_PUBLISHED_OUTLINE } from '#/components/DataState'

// How two hops are connected, drawn on the line between them:
//   published  solid green    both are named in the same published record
//   probable   dashed amber   tied by us, on evidence that makes it probable
//   possible   dotted gray    tied by us, by a name other buyers carry too
//   gap        dotted red     the chain stops here
export type TraceLink = 'published' | 'probable' | 'possible' | 'gap'

const LINES: Record<TraceLink, string> = {
  published: '2px solid var(--green-9)',
  probable: '2px dashed var(--amber-9)',
  possible: '2px dotted var(--gray-9)',
  gap: '2px dotted var(--red-9)',
}

export type TraceHop = {
  role: string
  name: ReactNode
  note?: ReactNode
  // How this hop is reached from the one before, and the same in words: the line is a
  // drawing, so a screen reader is told what it means. Left out for the first hop.
  link?: { kind: TraceLink; label: string }
  // The hop says something is missing: drawn with the dashed outline.
  missing?: boolean
}

// One amount followed hop by hop, from the ministry to the contract, with the kind of
// every link drawn on the connector. Scrolls sideways inside itself on a narrow screen.
export function TraceChain({
  hops,
  label,
}: {
  hops: Array<TraceHop>
  label: string
}) {
  return (
    <Box style={{ overflowX: 'auto' }} pb="1">
      <Flex asChild align="stretch" style={{ minWidth: 'max-content' }}>
        <ol
          aria-label={label}
          style={{ listStyle: 'none', margin: 0, padding: 0 }}
        >
          {hops.map((hop) => (
            <Flex key={hop.role} asChild align="stretch">
              <li>
                {hop.link ? (
                  <Flex align="center">
                    <Box
                      aria-hidden
                      style={{ width: 28, borderTop: LINES[hop.link.kind] }}
                    />
                    <VisuallyHidden>{hop.link.label}: </VisuallyHidden>
                  </Flex>
                ) : null}
                <Flex
                  direction="column"
                  gap="1"
                  p="3"
                  style={{
                    width: 150,
                    borderRadius: 'var(--radius-3)',
                    border: hop.missing
                      ? NOT_PUBLISHED_OUTLINE
                      : '1px solid var(--gray-a6)',
                  }}
                >
                  <Text size="1" color="gray">
                    {hop.role}
                  </Text>
                  <Text size="2" weight="bold">
                    {hop.name}
                  </Text>
                  {hop.note ? (
                    <Text size="1" color="gray">
                      {hop.note}
                    </Text>
                  ) : null}
                </Flex>
              </li>
            </Flex>
          ))}
        </ol>
      </Flex>
    </Box>
  )
}

// The key under a chain: what each kind of line means, in words.
export function TraceLegend({
  title,
  items,
}: {
  title: string
  items: Array<{ kind: TraceLink; label: string }>
}) {
  return (
    <Flex gap="4" align="center" wrap="wrap">
      <Text size="1" color="gray">
        {title}
      </Text>
      {items.map((item) => (
        <Flex key={item.kind} align="center" gap="2">
          <Box aria-hidden style={{ width: 24, borderTop: LINES[item.kind] }} />
          <Text size="1" color="gray">
            {item.label}
          </Text>
        </Flex>
      ))}
    </Flex>
  )
}
