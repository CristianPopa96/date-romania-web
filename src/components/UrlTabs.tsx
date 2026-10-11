import type { ReactNode } from 'react'
import { Flex, Tabs } from '@radix-ui/themes'

// Tabs whose choice lives in the address, so a tab can be shared and Back returns to the
// one before. Arrow keys only move between the tabs; Enter or a click opens one, since
// opening is a navigation and a call to the API. Every tab has its panel, and only the
// open one has content.
export function UrlTabs<TTab extends string>({
  value,
  tabs,
  onChange,
  gap = '5',
  children,
}: {
  value: TTab
  tabs: Array<{ value: TTab; label: ReactNode }>
  onChange: (value: TTab) => void
  gap?: '3' | '5'
  children: ReactNode
}) {
  return (
    <Tabs.Root
      value={value}
      activationMode="manual"
      onValueChange={(next) => onChange(next as TTab)}
    >
      <Tabs.List>
        {tabs.map((tab) => (
          <Tabs.Trigger key={tab.value} value={tab.value}>
            {tab.label}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      {tabs.map((tab) => (
        <Tabs.Content key={tab.value} value={tab.value}>
          {tab.value === value ? (
            <Flex direction="column" gap={gap} pt={gap}>
              {children}
            </Flex>
          ) : null}
        </Tabs.Content>
      ))}
    </Tabs.Root>
  )
}
