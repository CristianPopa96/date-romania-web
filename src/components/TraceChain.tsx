import type { ReactNode } from 'react'
import { Box, Flex, Text, VisuallyHidden } from '@radix-ui/themes'

import { NOT_PUBLISHED_OUTLINE } from '#/components/DataState'

// How two hops are connected, drawn on the line between them:
//   published  solid green    both are named in the same published record
//   probable   dashed amber   tied by us, on evidence that makes it probable
//   possible   dotted gray    tied by us, by a name other buyers carry too
//   unknown    dashed gray    into a step we cannot follow; the road goes on after it
//   gap        dotted red     the chain stops here
export type TraceLink =
  'published' | 'probable' | 'possible' | 'unknown' | 'gap'

const LINES: Record<TraceLink, string> = {
  published: '2px solid var(--green-9)',
  probable: '2px dashed var(--amber-9)',
  possible: '2px dotted var(--gray-9)',
  unknown: '2px dashed var(--gray-8)',
  gap: '2px dotted var(--red-9)',
}

// A step in the middle we cannot follow: dashed amber, never left out.
const GAP_OUTLINE = '1.5px dashed var(--amber-9)'

export type TraceHop = {
  role: string
  name: ReactNode
  // A figure between the name and the note: "4,06 mil. lei".
  figure?: ReactNode
  note?: ReactNode
  // A short ConfidenceBadge at its foot, where the tie into it is ours.
  badge?: ReactNode
  // How this hop is reached from the one before, and the same in words: the line is a
  // drawing, so a screen reader is told what it means. Left out for the first hop.
  link?: { kind: TraceLink; label: string }
  // The hop says something is missing: drawn with the dashed outline. `step` is a step
  // in the middle the road goes on after; otherwise the road ends here.
  missing?: boolean | 'step'
}

// One amount followed hop by hop, from who sends it to who collects it, with the kind of
// every link drawn on the connector (TraceChain, and "Drumul banilor" of ScreenProject).
// Scrolls sideways inside itself on a narrow screen.
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
            <Flex key={`${hop.role} ${hop.link?.kind}`} asChild align="stretch">
              <li>
                {hop.link ? (
                  <Flex align="center">
                    <Box
                      aria-hidden
                      style={{ width: 18, borderTop: LINES[hop.link.kind] }}
                    />
                    <VisuallyHidden>{hop.link.label}: </VisuallyHidden>
                  </Flex>
                ) : null}
                <Flex
                  direction="column"
                  gap="1"
                  p="3"
                  style={{
                    width: 124,
                    borderRadius: 'var(--radius-3)',
                    border:
                      hop.missing === 'step'
                        ? GAP_OUTLINE
                        : hop.missing
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
                  {hop.figure ? (
                    <Text
                      size="2"
                      style={{ fontVariantNumeric: 'tabular-nums' }}
                    >
                      {hop.figure}
                    </Text>
                  ) : null}
                  {hop.note ? (
                    <Text size="1" color="gray">
                      {hop.note}
                    </Text>
                  ) : null}
                  {hop.badge ? <Box mt="auto">{hop.badge}</Box> : null}
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
  title?: string
  items: Array<{ kind: TraceLink; label: string }>
}) {
  return (
    <Flex gap="4" align="center" wrap="wrap">
      {title ? (
        <Text size="1" color="gray">
          {title}
        </Text>
      ) : null}
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
