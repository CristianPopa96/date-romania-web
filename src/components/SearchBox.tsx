import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { MagnifyingGlassIcon } from '@radix-ui/react-icons'
import { Button, Flex, TextField } from '@radix-ui/themes'

import { useI18n } from '#/i18n/context'
import { searchParam } from '#/lib/urls'

// The search field. The large one is the home page and the search page; the compact one
// sits in the top bar of every other page and is sent with Enter.
export function SearchBox({
  initial = '',
  compact = false,
}: {
  initial?: string
  compact?: boolean
}) {
  const [q, setQ] = useState(initial)
  const navigate = useNavigate()
  const { t } = useI18n()

  return (
    <form
      role="search"
      onSubmit={(event) => {
        event.preventDefault()
        if (q.trim().length >= 2) {
          void navigate({
            to: '/cautare',
            search: { q: searchParam(q.trim()) },
          })
        }
      }}
    >
      <Flex gap="2">
        <TextField.Root
          size={compact ? '2' : '3'}
          style={compact ? { width: 260, maxWidth: '45vw' } : { flexGrow: 1 }}
          value={q}
          onChange={(event) => setQ(event.target.value)}
          placeholder={
            compact ? t.search.placeholderShort : t.search.placeholder
          }
          aria-label={t.common.search}
        >
          <TextField.Slot>
            <MagnifyingGlassIcon height="16" width="16" />
          </TextField.Slot>
        </TextField.Root>
        {compact ? null : (
          <Button size="3" type="submit">
            {t.common.search}
          </Button>
        )}
      </Flex>
    </form>
  )
}
