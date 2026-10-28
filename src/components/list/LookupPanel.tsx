import { useEffect, useRef, useState } from 'react'
import { Box, Button, Code, Flex, Text, TextField } from '@radix-ui/themes'

import type { PanelProps } from '#/components/list/FilterPanels'
import type { LookupFilter, LookupOption } from '#/components/list/filter-types'
import { useI18n } from '#/i18n/context'

// The panel of an `entity` or `code` filter: a typeahead over what the list holds, each
// option with how many rows it keeps. A short code typed alone can be used as it is.
export function LookupPanel({ filter, onPick }: PanelProps<LookupFilter>) {
  const { t, f } = useI18n()
  const [find, setFind] = useState('')
  const [found, setFound] = useState<Array<LookupOption> | null>(null)
  // The list builds its declarations anew on every render; the words typed decide a call.
  const lookup = useRef(filter.lookup)
  lookup.current = filter.lookup
  useEffect(() => {
    let current = true
    setFound(null)
    // Each key typed would be a call: wait until the reader pauses.
    const timer = setTimeout(() => {
      lookup
        .current(find.trim())
        .then((options) => current && setFound(options))
        .catch(() => current && setFound([]))
    }, 250)
    return () => {
      current = false
      clearTimeout(timer)
    }
  }, [find])
  const code = find.trim()
  const asCode = filter.kind === 'code' && /^\d{2,8}$/.test(code) ? code : null
  return (
    <Flex direction="column" gap="2" style={{ minWidth: 280 }}>
      <TextField.Root
        size="2"
        autoFocus
        placeholder={t.list.lookup[filter.kind]}
        value={find}
        onChange={(event) => setFind(event.target.value)}
      />
      {asCode ? (
        <Button
          variant="soft"
          size="1"
          onClick={() => onPick(filter.patch(asCode))}
        >
          {t.list.lookup.useCode(asCode)}
        </Button>
      ) : null}
      {found === null ? (
        <Text size="1" color="gray">
          {t.list.lookup.searching}
        </Text>
      ) : found.length === 0 ? (
        <Text size="1" color="gray">
          {t.list.lookup.none}
        </Text>
      ) : (
        found.map((option) => (
          <button
            key={option.value}
            type="button"
            className="dr-rank"
            aria-pressed={option.value === filter.value}
            onClick={() => onPick(filter.patch(option.value))}
          >
            <Flex justify="between" gap="4" align="center" py="1" px="1">
              <Box minWidth="0">
                <Text as="div" size="2" truncate>
                  {option.label}
                </Text>
                {option.sub ? (
                  <Code size="1" variant="ghost" color="gray">
                    {option.sub}
                  </Code>
                ) : null}
              </Box>
              <Text size="1" color="gray">
                {f.count(option.count)}
              </Text>
            </Flex>
          </button>
        ))
      )}
    </Flex>
  )
}
