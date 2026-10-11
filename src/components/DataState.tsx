import { Text } from '@radix-ui/themes'

import { useI18n } from '#/i18n/context'

// Marks a value we cannot show, and says why. Two states, never mixed:
//   notPublished  dashed outline: the source does not give the value
//   notCollected  dotted outline: the source publishes it, we do not hold it yet
// Never a dash, a zero or "necunoscut" in place of a missing value.
export function DataState({ kind }: { kind: 'notPublished' | 'notCollected' }) {
  const { t } = useI18n()
  return (
    <Text
      size="1"
      color="gray"
      style={{
        display: 'inline-block',
        padding: '0 var(--space-2)',
        borderRadius: 'var(--radius-2)',
        border:
          kind === 'notPublished'
            ? '1px dashed var(--gray-8)'
            : '1px dotted var(--gray-9)',
        whiteSpace: 'nowrap',
      }}
    >
      {t.dataState[kind]}
    </Text>
  )
}
