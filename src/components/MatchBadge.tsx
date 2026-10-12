import { Flex, Text } from '@radix-ui/themes'

import type { Match } from '#/lib/api-programme'

// How a mark is drawn for each match state. The shape and the words carry the meaning;
// the colour only repeats it (the ConfidenceBadge pattern of the design system, which
// this component stands in for on the programme pages).
//   one      half-filled dot   a single contract, tied by us: probable, never sure
//   several  amber ring        several contracts, none picked
//   none     empty ring        nothing found
//   unnamed  dashed ring       nothing to search with
// No state gets the solid green dot: that one is for a link a source publishes.
const MARKS: Record<Match, { color: string; fill: 'full' | 'half' | 'none' }> =
  {
    one: { color: 'var(--amber-9)', fill: 'half' },
    several: { color: 'var(--amber-9)', fill: 'none' },
    none: { color: 'var(--gray-9)', fill: 'none' },
    unnamed: { color: 'var(--gray-9)', fill: 'none' },
  }

export function MatchMark({ match }: { match: Match }) {
  const { color, fill } = MARKS[match]
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden>
      {fill === 'half' ? <path d="M5 1a4 4 0 0 0 0 8z" fill={color} /> : null}
      <circle
        cx="5"
        cy="5"
        r="4"
        fill={fill === 'full' ? color : 'none'}
        stroke={color}
        strokeWidth="1.5"
        strokeDasharray={match === 'unnamed' ? '2 1.6' : undefined}
      />
    </svg>
  )
}

// A match state as a mark and its words, e.g. "● Un singur contract".
export function MatchBadge({
  match,
  label,
  size = '1',
}: {
  match: Match
  label: string
  size?: '1' | '2'
}) {
  return (
    <Flex align="center" gap="2" display="inline-flex">
      <MatchMark match={match} />
      <Text size={size} weight="medium" style={{ whiteSpace: 'nowrap' }}>
        {label}
      </Text>
    </Flex>
  )
}
