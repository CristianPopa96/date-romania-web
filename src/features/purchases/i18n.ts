import { counted, plural } from '#/i18n/ro-plural'

export const purchaseList = {
  searchWhat: {
    institutions: 'obiect, furnizor, cod DA',
    suppliers: 'obiect, instituție, cod DA',
  },
  filters: {
    q: 'Căutare',
    perioada: 'Perioada',
    valoare: 'Valoare',
    stare: 'Stare',
    tip: 'Tip',
    furnizor: 'Furnizor',
    institutie: 'Instituție',
    cpv: 'CPV',
  },
  // A state on a chip, after "Stare:".
  stateChip: {
    3: 'refuzate de furnizor',
    4: 'fără răspuns de la furnizor',
    6: 'refuzate de instituție',
    7: 'acceptate',
    8: 'fără răspuns de la instituție',
  } as Record<number, string | undefined>,
  types: {
    1: 'Produse',
    2: 'Servicii',
    3: 'Lucrări',
    0: 'Tip necunoscut',
  } as Record<number, string | undefined>,
  valuePresets: {
    small: 'Sub 10.000 lei',
    middle: '10.000–100.000 lei',
    large: '100.000 lei sau mai mult',
  },
  purchases: (n: number, text: string) =>
    counted(n, text, 'o achiziție directă', 'achiziții directe'),
  acceptedOnly: (n: number, text: string) =>
    counted(n, text, 'o achiziție acceptată', 'achiziții acceptate'),
  acceptedPart: (n: number, text: string, value: string) =>
    `${plural(n, {
      one: 'una acceptată',
      few: `${text} acceptate`,
      other: `${text} de acceptate`,
    })}: ${value} fără TVA`,
  value: (value: string) => `${value} fără TVA`,
  aboveLimit: (n: number, text: string, value: string) =>
    `${counted(n, text, 'una', 'achiziții')} peste plafon, neadunate: ${value}`,
  of: (whole: string, days: string | null) =>
    `din ${whole} achiziții directe${days ? ` · ${days}` : ''}`,
  noDays: 'achiziții finalizate în zilele preluate',
  // The rows the sum counts: accepted, at or under their limit. `apart` when some accepted
  // ones are above it and left out, as the line above the table says.
  total: (n: number, text: string, apart: boolean) =>
    `Total pentru filtrele alese · ${counted(n, text, 'o achiziție', 'achiziții')}${
      apart ? ' în limita plafonului' : ''
    }`,
  timeTitle: {
    month: 'Valoare pe luni',
    day: 'Valoare pe zile',
  },
  timeUnit: 'lei fără TVA, achiziții acceptate în limita plafonului',
  partiesTitle: {
    supplier: 'Cei mai mari furnizori',
    buyer: 'Cele mai mari instituții',
  },
  partyCount: (n: number, text: string) =>
    counted(n, text, 'o achiziție', 'achiziții'),
}
