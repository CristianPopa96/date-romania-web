import { createContext, useContext, useMemo } from 'react'
import { DEFAULT_LOCALE, messagesFor } from './index'
import type { Locale, Messages } from './index'

import { formatFor } from '#/lib/format'
import type { Format } from '#/lib/format'

type I18n = { locale: Locale; t: Messages; f: Format }

function build(locale: Locale): I18n {
  return { locale, t: messagesFor(locale), f: formatFor(locale) }
}

const I18nContext = createContext<I18n>(build(DEFAULT_LOCALE))

export function I18nProvider({
  locale,
  children,
}: {
  locale: Locale
  children: React.ReactNode
}) {
  const value = useMemo(() => build(locale), [locale])
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

// `t` is the text, `f` formats numbers, amounts and dates for the same language.
export function useI18n() {
  return useContext(I18nContext)
}
