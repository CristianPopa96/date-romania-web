import { Button, Flex, Text } from '@radix-ui/themes'

import { useI18n } from '#/i18n/context'

// Nothing found: "Nimic nu se potrivește cu filtrele alese.", then the one filter whose
// removal gives rows back, with what it would give and a button that removes it; else, when
// filters are chosen, a button that clears them all.
export function ListEmpty({
  back,
  onClear,
}: {
  // The filter to remove: its label, what the list would hold without it ("12 achiziții").
  back: { label: string; rows: string; onRemove: () => void } | null
  onClear: (() => void) | null
}) {
  const { t } = useI18n()
  return (
    <Flex direction="column" gap="2" align="start" py="4">
      <Text size="2">{t.list.empty}</Text>
      {back ? (
        <>
          <Text size="2" color="gray">
            {t.list.without(back.label, back.rows)}
          </Text>
          <Button variant="soft" size="1" onClick={back.onRemove}>
            {t.list.remove(back.label)}
          </Button>
        </>
      ) : onClear ? (
        <Button variant="soft" size="1" onClick={onClear}>
          {t.list.clear}
        </Button>
      ) : null}
    </Flex>
  )
}
