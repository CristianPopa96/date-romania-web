// The Romanian text of the list pattern (DataTable, FilterBar, ChartCard), and of the lists
// built on it. Part of `ro` (see ro.ts for the rules).
import { counted } from '#/i18n/ro-plural'

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
  failed: 'Nu am putut încărca lista acum. Încearcă din nou mai târziu.',
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
