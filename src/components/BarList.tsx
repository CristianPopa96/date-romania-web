import { Box, Code, Flex, Text } from '@radix-ui/themes'

import { EntityLink } from '#/components/EntityLink'
import { useI18n } from '#/i18n/context'
import { rich } from '#/i18n/rich'
import type { EntityRef, Role } from '#/lib/api'

// Names with their value, each over a bar scaled to the largest value in the list.
// `note` says what the value adds up, in the words of the list it is in.
export function BarList<TRow extends EntityRef & { value: number }>({
  rows,
  role,
  note,
  numbered = false,
}: {
  rows: Array<TRow>
  role: Role
  note: (row: TRow) => string
  numbered?: boolean
}) {
  const { t, f } = useI18n()
  const largest = Math.max(...rows.map((row) => row.value), 1)

  return (
    <Flex direction="column" gap="3" asChild>
      <ol style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {rows.map((row, index) => (
          <li key={row.cui}>
            <Flex justify="between" align="baseline" gap="3">
              <Text size="2" truncate>
                {numbered ? `${index + 1}. ` : null}
                <EntityLink role={role} cui={row.cui}>
                  {row.name}
                </EntityLink>
              </Text>
              <Text size="2" weight="medium" style={{ whiteSpace: 'nowrap' }}>
                {f.lei(row.value)}
              </Text>
            </Flex>
            <Box
              my="1"
              style={{
                height: 6,
                borderRadius: 'var(--radius-1)',
                background: 'var(--gray-a4)',
              }}
            >
              <Box
                style={{
                  height: '100%',
                  width: `${Math.max((row.value / largest) * 100, 1)}%`,
                  borderRadius: 'var(--radius-1)',
                  background: 'var(--accent-9)',
                }}
              />
            </Box>
            <Text size="1" color="gray">
              {rich(t.common.cui, {
                cui: (
                  <Code key="cui" variant="ghost">
                    {row.cui}
                  </Code>
                ),
              })}{' '}
              · {note(row)}
            </Text>
          </li>
        ))}
      </ol>
    </Flex>
  )
}
