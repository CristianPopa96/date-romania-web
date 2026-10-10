import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { MagnifyingGlassIcon } from '@radix-ui/react-icons'
import { Button, Flex, TextField } from '@radix-ui/themes'

export function SearchBox({
  initial = '',
  size = '3',
}: {
  initial?: string
  size?: '2' | '3'
}) {
  const [q, setQ] = useState(initial)
  const navigate = useNavigate()

  return (
    <form
      role="search"
      onSubmit={(event) => {
        event.preventDefault()
        if (q.trim().length >= 2) {
          void navigate({ to: '/cautare', search: { q: q.trim() } })
        }
      }}
    >
      <Flex gap="2">
        <TextField.Root
          size={size}
          style={{ flexGrow: 1 }}
          value={q}
          onChange={(event) => setQ(event.target.value)}
          placeholder="Caută o instituție, o firmă sau un CUI"
          aria-label="Caută"
        >
          <TextField.Slot>
            <MagnifyingGlassIcon height="16" width="16" />
          </TextField.Slot>
        </TextField.Root>
        <Button size={size} type="submit">
          Caută
        </Button>
      </Flex>
    </form>
  )
}
