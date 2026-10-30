// Romania's counties as the site names them: the API's two-letter code, the real name, and
// the address's slug, the name in plain letters ('bistrita-nasaud'). Bucharest is a county
// here, as in every list of the API.

const NAMES: Record<string, string> = {
  AB: 'Alba',
  AR: 'Arad',
  AG: 'Argeș',
  BC: 'Bacău',
  BH: 'Bihor',
  BN: 'Bistrița-Năsăud',
  BT: 'Botoșani',
  BR: 'Brăila',
  BV: 'Brașov',
  B: 'București',
  BZ: 'Buzău',
  CL: 'Călărași',
  CS: 'Caraș-Severin',
  CJ: 'Cluj',
  CT: 'Constanța',
  CV: 'Covasna',
  DB: 'Dâmbovița',
  DJ: 'Dolj',
  GL: 'Galați',
  GR: 'Giurgiu',
  GJ: 'Gorj',
  HR: 'Harghita',
  HD: 'Hunedoara',
  IL: 'Ialomița',
  IS: 'Iași',
  IF: 'Ilfov',
  MM: 'Maramureș',
  MH: 'Mehedinți',
  MS: 'Mureș',
  NT: 'Neamț',
  OT: 'Olt',
  PH: 'Prahova',
  SJ: 'Sălaj',
  SM: 'Satu Mare',
  SB: 'Sibiu',
  SV: 'Suceava',
  TR: 'Teleorman',
  TM: 'Timiș',
  TL: 'Tulcea',
  VL: 'Vâlcea',
  VS: 'Vaslui',
  VN: 'Vrancea',
}

// A name in plain letters, for an address: 'Bistrița-Năsăud' is 'bistrita-nasaud'.
export function plainSlug(name: string): string {
  return name
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

// The codes in the order of the names, for a list that offers every county.
export const COUNTY_CODES = Object.keys(NAMES).sort((a, b) =>
  NAMES[a].localeCompare(NAMES[b], 'ro'),
)

export function countyName(code: string): string | undefined {
  return Object.hasOwn(NAMES, code) ? NAMES[code] : undefined
}

export function countySlugOfCode(code: string): string | undefined {
  const name = countyName(code)
  return name === undefined ? undefined : plainSlug(name)
}

export function countyCodeOfSlug(slug: unknown): string | undefined {
  if (typeof slug !== 'string') return undefined
  return Object.keys(NAMES).find((code) => plainSlug(NAMES[code]) === slug)
}
