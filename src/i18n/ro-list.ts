// The Romanian text of the list pattern (DataTable, FilterBar, ChartCard), and of the lists
// built on it. Part of `ro` (see ro.ts for the rules).

import { counted, plural } from '#/i18n/ro-plural'

export const list = {
  search: (what: string) => `Caută în listă: ${what}`,
  searchLabel: 'Caută în listă',
  clear: 'Șterge filtrele',
  chosen: (label: string, value: string) => `${label}: ${value}`,
  chosenMany: (n: string) => `${n} alese`,
  remove: (label: string) => `Scoate filtrul «${label}»`,
  moreFilters: 'Mai multe filtre',
  filtersButton: (n: number) => (n > 0 ? `Filtre (${n})` : 'Filtre'),
  apply: 'Aplică',
  close: 'Închide',

  period: {
    last30: 'Ultimele 30 de zile',
    lastMonth: 'Luna trecută',
    all: 'Tot ce avem',
    from: 'De la',
    to: 'Până la',
    held: (from: string, to: string) => `Datele acoperă ${from} – ${to}.`,
    since: (day: string) => `de la ${day}`,
    until: (day: string) => `până la ${day}`,
  },
  range: {
    min: 'De la (lei)',
    max: 'Sub (lei)',
    between: (min: string, max: string) => `${min}–${max}`,
    from: (min: string) => `de la ${min}`,
    under: (max: string) => `sub ${max}`,
    band: (n: string) => `${n} în această bandă`,
  },
  choice: {
    find: 'Caută o opțiune',
  },
  lookup: {
    entity: 'Nume sau CUI',
    code: 'Cod sau cuvânt',
    none: 'Nimic găsit în listă.',
    searching: 'Se caută…',
    useCode: (code: string) => `Folosește codul ${code}`,
    count: (n: string) => n,
  },

  views: {
    label: 'Ce arată lista',
    charts: 'Tabel și grafic',
    table: 'Doar tabel',
  },
  export: (n: number, text: string) =>
    `Exportă CSV · ${counted(n, text, 'un rând', 'rânduri')}`,

  sort: {
    label: 'Ordonează',
    default: 'Ordinea listei',
    asc: (column: string) => `${column}, crescător`,
    desc: (column: string) => `${column}, descrescător`,
  },

  pager: {
    range: (first: string, last: string, total: string) =>
      `${first}–${last} din ${total}`,
    perPage: (n: number) => `${n} pe pagină`,
    perPageLabel: 'Rânduri pe pagină',
    previous: 'Pagina anterioară',
    next: 'Pagina următoare',
    page: (n: string) => `Pagina ${n}`,
    label: 'Paginile listei',
  },

  empty: 'Nimic nu se potrivește cu filtrele alese.',
  without: (label: string, count: string) =>
    `Fără filtrul «${label}» ar fi ${count}.`,

  chart: {
    clickHint: 'clic pe o bară o adaugă la filtre',
    openMonth: 'Luna punctată nu e încheiată.',
    openDay: 'Ziua punctată nu e încheiată.',
    others: (n: string) => `Alți ${n}`,
    sameFilters: 'aceleași filtre',
    tableCaption: (title: string) => `Cifrele graficului: ${title}`,
    period: 'Perioada',
    value: 'Valoare',
  },
}

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
  total: (n: number, text: string) =>
    `Total pentru filtrele alese · ${counted(n, text, 'o achiziție', 'achiziții')}`,
  timeTitle: {
    month: 'Valoare pe luni',
    day: 'Valoare pe zile',
  },
  timeUnit: 'lei fără TVA, achiziții acceptate',
  partiesTitle: {
    supplier: 'Cei mai mari furnizori',
    buyer: 'Cele mai mari instituții',
  },
  partyCount: (n: number, text: string) =>
    counted(n, text, 'o achiziție', 'achiziții'),
}
