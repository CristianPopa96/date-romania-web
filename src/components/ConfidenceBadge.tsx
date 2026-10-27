import { Flex, Text, Tooltip } from '@radix-ui/themes'

// How sure a link between two records is (the ConfidenceBadge of the design system). The
// mark and the words carry the meaning; the colour only repeats it.
//   sure      solid green dot     published: the same CUI on both records
//   probable  half-filled amber   tied by us on evidence that makes it probable
//   none      empty gray ring     no link found
export type Confidence = 'sure' | 'probable' | 'none'

const COLORS: Record<Confidence, string> = {
  sure: 'var(--green-9)',
  probable: 'var(--amber-9)',
  none: 'var(--gray-9)',
}

function Mark({ level }: { level: Confidence }) {
  const color = COLORS[level]
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden>
      {level === 'probable' ? (
        <path d="M5 1a4 4 0 0 0 0 8z" fill={color} />
      ) : null}
      <circle
        cx="5"
        cy="5"
        r="4"
        fill={level === 'sure' ? color : 'none'}
        stroke={color}
        strokeWidth="1.5"
      />
    </svg>
  )
}

// A mark and its words, e.g. "● CUI în listă", with what they mean on hover or focus.
export function ConfidenceBadge({
  level,
  label,
  help,
}: {
  level: Confidence
  label: string
  help?: string
}) {
  const badge = (
    <Flex
      align="center"
      gap="2"
      display="inline-flex"
      tabIndex={help ? 0 : undefined}
    >
      <Mark level={level} />
      <Text size="1" weight="medium" style={{ whiteSpace: 'nowrap' }}>
        {label}
      </Text>
    </Flex>
  )
  return help ? <Tooltip content={help}>{badge}</Tooltip> : badge
}
