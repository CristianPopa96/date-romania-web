import { useEffect, useRef, useState } from 'react'
import { MagnifyingGlassIcon, MixerHorizontalIcon } from '@radix-ui/react-icons'
import {
  Box,
  Button,
  Dialog,
  Flex,
  Heading,
  Popover,
  Separator,
  TextField,
} from '@radix-ui/themes'

import { FilterPanel } from '#/components/list/FilterPanels'
import type { FilterDecl, Patch } from '#/components/list/filter-types'
import { useI18n } from '#/i18n/context'

// The row above a list (FilterBar in the design system): a search field for this list,
// one chip per filter the list declares, and "Șterge filtrele". On a phone the chips fold
// into one "Filtre (2)" button that opens the same panels in a sheet.
export function FilterBar({
  q,
  searchWhat,
  filters,
  onApply,
}: {
  q: string | undefined
  searchWhat: string
  filters: Array<FilterDecl>
  onApply: (patch: Patch) => void
}) {
  const { t } = useI18n()
  const chosen = filters.filter((filter) => filter.chip !== null)
  // More than six: five chips, the rest under "Mai multe filtre".
  const shown = filters.length > 6 ? filters.slice(0, 5) : filters
  const more = filters.length > 6 ? filters.slice(5) : []
  const clearAll = () =>
    onApply(Object.assign({ q: undefined }, ...chosen.map((f) => f.clear)))

  return (
    <Flex gap="2" align="center" wrap="wrap">
      <SearchField
        q={q}
        placeholder={t.list.search(searchWhat)}
        onSearch={(next) => onApply({ q: next })}
      />
      <Flex
        gap="2"
        align="center"
        wrap="wrap"
        display={{ initial: 'none', sm: 'flex' }}
      >
        {shown.map((filter) => (
          <FilterChip key={filter.key} filter={filter} onApply={onApply} />
        ))}
        {more.length ? <MoreFilters filters={more} onApply={onApply} /> : null}
        {chosen.length || q ? (
          <Button variant="ghost" size="1" onClick={clearAll}>
            {t.list.clear}
          </Button>
        ) : null}
      </Flex>
      <Box display={{ initial: 'block', sm: 'none' }}>
        <FilterSheet
          filters={filters}
          chosen={chosen.length}
          onApply={onApply}
          onClear={clearAll}
        />
      </Box>
    </Flex>
  )
}

function SearchField({
  q,
  placeholder,
  onSearch,
}: {
  q: string | undefined
  placeholder: string
  onSearch: (q: string | undefined) => void
}) {
  const { t } = useI18n()
  const [text, setText] = useState(q ?? '')
  // A search changed elsewhere (a filter cleared, Back) shows here too.
  useEffect(() => setText(q ?? ''), [q])
  const send = useRef(() => {})
  send.current = () => {
    const next = text.trim() || undefined
    if (next !== q) onSearch(next)
  }
  // The list follows the words typed once the reader pauses.
  useEffect(() => {
    const timer = setTimeout(() => send.current(), 500)
    return () => clearTimeout(timer)
  }, [text])
  return (
    <form
      role="search"
      onSubmit={(event) => {
        event.preventDefault()
        send.current()
      }}
      style={{ flex: '1 1 240px', maxWidth: 360 }}
    >
      <TextField.Root
        size="2"
        aria-label={t.list.searchLabel}
        placeholder={placeholder}
        value={text}
        onChange={(event) => setText(event.target.value)}
      >
        <TextField.Slot>
          <MagnifyingGlassIcon />
        </TextField.Slot>
      </TextField.Root>
    </form>
  )
}

// A chip and its panel. Escape or a click outside closes it and applies the draft.
function FilterChip({
  filter,
  onApply,
}: {
  filter: FilterDecl
  onApply: (patch: Patch) => void
}) {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const draft = useRef<Patch | null>(null)
  const close = (apply: Patch | null) => {
    setOpen(false)
    const patch = apply ?? draft.current
    draft.current = null
    if (patch) onApply(patch)
  }
  return (
    <Popover.Root
      open={open}
      onOpenChange={(next) => (next ? setOpen(true) : close(null))}
    >
      {filter.chip === null ? (
        <Popover.Trigger>
          <button type="button" className="dr-chip">
            {filter.label}
          </button>
        </Popover.Trigger>
      ) : (
        <span className="dr-chip on">
          <Popover.Trigger>
            <button type="button" className="dr-chip-label">
              {filter.label}: <b>{filter.chip}</b>
            </button>
          </Popover.Trigger>
          <button
            type="button"
            className="dr-chip-x"
            aria-label={t.list.remove(filter.label)}
            onClick={() => onApply(filter.clear)}
          >
            ×
          </button>
        </span>
      )}
      <Popover.Content size="2" maxWidth="420px">
        <FilterPanel
          filter={filter}
          onDraft={(patch) => (draft.current = patch)}
          onPick={(patch) => close(patch)}
        />
      </Popover.Content>
    </Popover.Root>
  )
}

function MoreFilters({
  filters,
  onApply,
}: {
  filters: Array<FilterDecl>
  onApply: (patch: Patch) => void
}) {
  const { t } = useI18n()
  return (
    <Popover.Root>
      <Popover.Trigger>
        <button type="button" className="dr-chip">
          {t.list.moreFilters}
        </button>
      </Popover.Trigger>
      <Popover.Content size="2">
        <Flex direction="column" gap="2">
          {filters.map((filter) => (
            <FilterChip key={filter.key} filter={filter} onApply={onApply} />
          ))}
        </Flex>
      </Popover.Content>
    </Popover.Root>
  )
}

// The phone's sheet: every panel, one under the other; closing it applies them all at once.
function FilterSheet({
  filters,
  chosen,
  onApply,
  onClear,
}: {
  filters: Array<FilterDecl>
  chosen: number
  onApply: (patch: Patch) => void
  onClear: () => void
}) {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const drafts = useRef<Record<string, Patch>>({})
  const close = (extra: Patch | null) => {
    setOpen(false)
    const patch = Object.assign({}, ...Object.values(drafts.current), extra)
    drafts.current = {}
    if (Object.keys(patch).length) onApply(patch)
  }
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => (next ? setOpen(true) : close(null))}
    >
      <Dialog.Trigger>
        <Button variant="soft" color="gray">
          <MixerHorizontalIcon />
          {t.list.filtersButton(chosen)}
        </Button>
      </Dialog.Trigger>
      <Dialog.Content size="2" width="calc(100vw - 32px)" maxWidth="560px">
        <Dialog.Title>{t.list.filtersButton(chosen)}</Dialog.Title>
        <Flex direction="column" gap="4">
          {filters.map((filter) => (
            <Flex direction="column" gap="2" key={filter.key}>
              <Heading as="h3" size="2">
                {filter.label}
              </Heading>
              <FilterPanel
                filter={filter}
                onDraft={(patch) => (drafts.current[filter.key] = patch)}
                onPick={(patch) => close(patch)}
              />
              <Separator size="4" />
            </Flex>
          ))}
          <Flex gap="3" justify="end">
            {chosen ? (
              <Button
                variant="soft"
                color="gray"
                onClick={() => {
                  drafts.current = {}
                  setOpen(false)
                  onClear()
                }}
              >
                {t.list.clear}
              </Button>
            ) : null}
            <Button onClick={() => close(null)}>{t.list.apply}</Button>
          </Flex>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  )
}
