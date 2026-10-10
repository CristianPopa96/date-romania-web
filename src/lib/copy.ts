// Site copy that more than one place shows, kept once.

export const SITE_NAME = 'Date România'

export const TAGLINE =
  'Unde merg banii publici: achiziții, contracte și plăți, cu sursa fiecărei cifre.'

// The browser tab title of a page: "Clasamente · Date România".
export function pageTitle(page: string) {
  return `${page} · ${SITE_NAME}`
}
