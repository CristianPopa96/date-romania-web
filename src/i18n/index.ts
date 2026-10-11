// The languages of the interface. Romanian is the only one for now; the structure is here
// so a second one is a new messages file and an entry in LOCALES, not a rewrite.
//
// What a language changes: interface text and the format of numbers and dates. What it
// never changes: route paths (Romanian in every language) and data (names, titles, CPV).

import { ro } from './ro'

export type Messages = typeof ro

// `tag` is what Intl formats numbers and dates with.
export const LOCALES = {
  ro: { tag: 'ro-RO', messages: ro },
} satisfies Record<string, { tag: string; messages: Messages }>

export type Locale = keyof typeof LOCALES

export const DEFAULT_LOCALE: Locale = 'ro'

export function messagesFor(locale: Locale): Messages {
  return LOCALES[locale].messages
}

// The language of this visit. The one place to change when a second language arrives
// (a cookie or the browser's preference; never the path).
export function resolveLocale(): Locale {
  return DEFAULT_LOCALE
}
