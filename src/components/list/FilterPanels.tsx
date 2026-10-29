import { useState } from 'react'
import { Box, Checkbox, Flex, Text, TextField } from '@radix-ui/themes'

import type {
  ChoiceFilter,
  FilterDecl,
  Patch,
  PeriodFilter,
  RangeFilter,
} from '#/components/list/filter-types'
import { LookupPanel } from '#/components/list/LookupPanel'
import { useI18n } from '#/i18n/context'
import { amountFromText, periodPresets, plain } from '#/lib/list'
import type { Period } from '#/lib/list'

// The panel of one filter, by its kind (FilterBar in the design system). A change made in
// it is a draft, applied when the panel closes; a preset or an option picked from a list
// applies at once.
export type PanelProps<TFilter> = {
  filter: TFilter
  onDraft: (patch: Patch) => void
  onPick: (patch: Patch) => void
}

export function FilterPanel(props: PanelProps<FilterDecl>) {
  const { filter } = props
  if (filter.kind === 'period')
    return <PeriodPanel {...props} filter={filter} />
  if (filter.kind === 'range') return <RangePanel {...props} filter={filter} />
  if (filter.kind === 'choice')
    return <ChoicePanel {...props} filter={filter} />
  return <LookupPanel {...props} filter={filter} />
}

function Preset({
  pressed,
  onClick,
  children,
}: {
  pressed: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      className="dr-preset"
      aria-pressed={pressed}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

function PeriodPanel({ filter, onDraft, onPick }: PanelProps<PeriodFilter>) {
  const { t, f } = useI18n()
  const [draft, setDraft] = useState<Period>(filter.value)
  const held = filter.held
  const set = (next: Period) => {
    setDraft(next)
    onDraft(filter.patch(next))
  }
  const same = (period: Period) =>
    period.from === filter.value.from && period.to === filter.value.to
  return (
    <Flex direction="column" gap="3">
      {held ? (
        <Flex gap="2" wrap="wrap">
          {periodPresets(held.first, held.last).map((preset) => (
            <Preset
              key={preset.key + (preset.year ?? '')}
              pressed={same(preset.period)}
              onClick={() => onPick(filter.patch(preset.period))}
            >
              {preset.key === 'year'
                ? String(preset.year)
                : t.list.period[preset.key]}
            </Preset>
          ))}
        </Flex>
      ) : null}
      <Flex gap="3" wrap="wrap">
        {(['from', 'to'] as const).map((end) => (
          <label key={end}>
            <Text as="div" size="1" color="gray" mb="1">
              {t.list.period[end]}
            </Text>
            <TextField.Root
              type="date"
              size="2"
              value={draft[end] ?? ''}
              min={held?.first}
              max={held?.last}
              onChange={(event) =>
                set({ ...draft, [end]: event.target.value || undefined })
              }
            />
          </label>
        ))}
      </Flex>
      {held ? (
        <Text size="1" color="gray">
          {t.list.period.held(f.day(held.first), f.day(held.last))}
        </Text>
      ) : null}
    </Flex>
  )
}

function RangePanel({ filter, onDraft, onPick }: PanelProps<RangeFilter>) {
  const { t, f } = useI18n()
  const [draft, setDraft] = useState(filter.value)
  const largest = Math.max(...filter.bands.map((band) => band.count), 1)
  const set = (next: { min?: number; max?: number }) => {
    setDraft(next)
    onDraft(filter.patch(next))
  }
  const amount = (text: string) => amountFromText(text)
  return (
    <Flex direction="column" gap="3">
      <Flex align="end" gap="1" style={{ height: 48 }}>
        {filter.bands.map((band) => (
          <button
            key={band.start}
            type="button"
            className="dr-rank"
            title={`${f.lei(band.start)}${band.end ? `–${f.lei(band.end)}` : '+'} · ${t.list.range.band(f.count(band.count))}`}
            aria-label={`${f.lei(band.start)}${band.end ? `–${f.lei(band.end)}` : '+'}: ${t.list.range.band(f.count(band.count))}`}
            onClick={() =>
              onPick(
                filter.patch({
                  min: band.start || undefined,
                  max: band.end ?? undefined,
                }),
              )
            }
            style={{ height: '100%', display: 'flex', alignItems: 'flex-end' }}
          >
            <Box
              className="dr-rank-bar"
              style={{
                width: '100%',
                height: `${Math.max((band.count / largest) * 100, band.count ? 6 : 2)}%`,
              }}
            />
          </button>
        ))}
      </Flex>
      <Flex gap="2" wrap="wrap">
        {filter.presets.map((preset) => (
          <Preset
            key={preset.label}
            pressed={
              preset.min === filter.value.min && preset.max === filter.value.max
            }
            onClick={() =>
              onPick(filter.patch({ min: preset.min, max: preset.max }))
            }
          >
            {preset.label}
          </Preset>
        ))}
      </Flex>
      <Flex gap="3" wrap="wrap">
        {(['min', 'max'] as const).map((end) => (
          <label key={end}>
            <Text as="div" size="1" color="gray" mb="1">
              {t.list.range[end]}
            </Text>
            <TextField.Root
              inputMode="numeric"
              size="2"
              value={draft[end] === undefined ? '' : String(draft[end])}
              onChange={(event) =>
                set({ ...draft, [end]: amount(event.target.value) })
              }
            />
          </label>
        ))}
      </Flex>
    </Flex>
  )
}

function ChoicePanel({ filter, onDraft }: PanelProps<ChoiceFilter>) {
  const { t, f } = useI18n()
  const [draft, setDraft] = useState(filter.value)
  const [find, setFind] = useState('')
  // An option that would leave nothing goes last, muted, never hidden; one not counted
  // stays where it is.
  const empty = (count: number | undefined) => count === 0
  const options = [...filter.options]
    .sort((a, b) => Number(empty(a.count)) - Number(empty(b.count)))
    .filter((option) => !find || plain(option.label).includes(plain(find)))
  const toggle = (value: number) => {
    const chosen = draft.includes(value)
    const next = filter.single
      ? chosen
        ? []
        : [value]
      : chosen
        ? draft.filter((each) => each !== value)
        : [...draft, value]
    setDraft(next)
    onDraft(filter.patch(next))
  }
  return (
    <Flex direction="column" gap="2">
      {filter.options.length > 8 ? (
        <TextField.Root
          size="2"
          placeholder={t.list.choice.find}
          value={find}
          onChange={(event) => setFind(event.target.value)}
        />
      ) : null}
      {options.map((option) => (
        <Text as="label" size="2" key={option.value}>
          <Flex justify="between" align="center" gap="4">
            <Flex gap="2" align="center">
              <Checkbox
                checked={draft.includes(option.value)}
                onCheckedChange={() => toggle(option.value)}
              />
              <Text color={empty(option.count) ? 'gray' : undefined}>
                {option.label}
              </Text>
            </Flex>
            {option.count === undefined ? null : (
              <Text size="1" color="gray">
                {f.count(option.count)}
              </Text>
            )}
          </Flex>
        </Text>
      ))}
    </Flex>
  )
}
