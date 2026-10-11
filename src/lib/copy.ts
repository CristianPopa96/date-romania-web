// The site's name, which no language changes, and how a tab title is built from it.
// Everything else the site says is in src/i18n.

export const SITE_NAME = 'Date România'

// The browser tab title of a page: "Clasamente · Date România".
export function pageTitle(page: string) {
  return `${page} · ${SITE_NAME}`
}
