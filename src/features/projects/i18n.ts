// The Romanian text of the projects of every programme (design D22): the list and the
// frame of a project's page. Part of `ro` (see ro.ts for the rules).

import { counted } from '#/i18n/ro-plural'

export const projects = {
  eyebrow: 'Proiecte',
  title: 'Proiecte cu bani publici',
  lead: 'Fiecare proiect, din fiecare program, cu drumul banilor de la cine îi trimite la cine îi încasează. Sumele programelor nu se adună: fiecare program își publică cifrele la data lui.',
  crumb: 'Proiecte',
  listAll: 'Toate proiectele',
  listTitle: 'Proiectele programului',
  programmesLink: 'Programele, cu cifrele și sursele lor',
  searchWhat: 'proiect, SMIS, nr. contract',

  kinds: {
    anghel_saligny: 'Anghel Saligny',
    pnrr: 'PNRR',
    cohesion: 'Fonduri de coeziune',
  },
  status: {
    in_progress: 'În implementare',
    finished: 'Finalizat',
    terminated: 'Reziliat',
  },
  // How far a road is followed, under the small road of a row.
  reach: {
    beneficiary: 'până la beneficiar',
    payments: 'până la plăți',
    purchases: 'până la achiziții',
    companies: 'până la firme',
  },
  // The seven steps of a road, for a screen reader.
  steps: [
    'finanțator',
    'program',
    'contract de finanțare',
    'beneficiar',
    'plăți',
    'achiziții',
    'firme',
  ],
  roadLabel: (reach: string) => `Drum urmărit ${reach}`,
  roadGap: 'plățile nu pot fi urmărite',

  filters: {
    q: 'Căutare',
    program: 'Program',
    judet: 'Județ',
    beneficiar: 'Beneficiar',
    stare: 'Stare',
    drum: 'Drum urmărit',
    valoare: 'Valoare',
  },
  valuePresets: {
    small: 'Sub 1 mil. lei',
    middle: '1–25 mil. lei',
    large: '25 mil. lei sau mai mult',
  },

  projects: (n: number, text: string) =>
    counted(n, text, 'un proiect', 'proiecte'),
  inKinds: (n: number, text: string) =>
    n === 1
      ? 'într-un program'
      : `în ${counted(n, text, 'un program', 'programe')}`,
  followed: (text: string) => `${text} urmărite până la firme`,
  noSum:
    'sumele nu se adună între programe; alege un program pentru valoarea lui',
  value: (amount: string) => `valoare ${amount}`,
  of: (whole: string) => `din ${whole} de proiecte, din toate programele`,
  naturalPersons: (n: number, text: string) =>
    n === 1
      ? 'Include un proiect al unei persoane fizice, pe care nu îl afișăm nominal.'
      : `Include ${counted(n, text, 'un proiect', 'proiecte')} ale unor persoane fizice, pe care nu le afișăm nominal.`,
  total: (n: number, text: string) =>
    `Valoarea pentru filtrele alese · ${counted(n, text, 'un proiect', 'proiecte')}`,

  byKindTitle: 'Proiecte pe programe',
  byKindUnit: 'număr de proiecte',
  byKindNote:
    'Numărăm proiecte, nu adunăm sume între programe. Clic pe un program îl adaugă la filtre.',
  reachTitle: 'Cât de departe urmărim drumul',
  reachUnit: 'aceleași filtre',
  reachCompanies: 'Până la firmele care au livrat',
  reachNone: 'Fără achiziții legate',
  reachNote:
    'SEAP nu are un câmp pentru proiect: o achiziție ajunge la proiect doar când cumpărătorul îl citează.',

  // An entity page's tab.
  tab: 'Proiecte',
  tabTitle: 'Proiectele cu bani publici',
  tabCompanyTitle: 'Proiectele prin care a fost plătită',
  // How a company is tied to a project, on its page.
  via: {
    header: 'Legătura',
    beneficiary: 'beneficiar',
    builder: 'constructor în fișierul de plăți',
    notice: 'câștigător al unui anunț legat',
    purchase: 'furnizor al unei achiziții legate',
    help: {
      beneficiary: 'Programul o numește beneficiarul proiectului.',
      builder:
        'Fișierul de plăți al ministerului o numește constructorul, cu CUI-ul ei.',
      notice:
        'A câștigat un anunț de atribuire al cărui text citează proiectul. Legătura e făcută de noi, după ce a scris cumpărătorul.',
      purchase:
        'A vândut printr-o achiziție directă al cărei text citează proiectul. Legătura e făcută de noi, după ce a scris cumpărătorul.',
    },
  },
  // The table by programme above an entity's list.
  byProgramme: {
    title: 'Pe programe, fiecare la data lui',
    note: 'Fiecare program își publică cifrele la data lui: sumele nu se adună între programe.',
    programme: 'Program',
    projects: 'Proiecte',
    value: 'Valoare',
    paid: 'Plătit',
    day: 'La data',
    paidAs: {
      files: 'în fișierele MDLPA',
      beneficiary: 'beneficiarului, pe toate măsurile',
      cumulative: 'cumulat, fără dată',
    },
  },
  project: 'Proiect',
  beneficiary: 'Beneficiar',
  valueColumn: 'Valoare',
  road: 'Drum urmărit',
  national: 'național',
  someCounties: (first: string, more: number, text: string) =>
    `${first} și încă ${counted(more, text, 'un județ', 'județe')}`,
  fallbackTitle: 'Proiect fără titlu',
  key: (program: string, key: string) => `${program} · ${key}`,
  smis: (code: string) => `SMIS ${code}`,
  failed: 'Nu am putut încărca proiectele acum. Încearcă din nou mai târziu.',

  // The frame of a project's page (ScreenProject).
  page: {
    eyebrow: (program: string, place: string | null) =>
      place ? `Proiect · ${program} · ${place}` : `Proiect · ${program}`,
    roadTitle: 'Drumul banilor',
    roadLead: 'de la cine trimite banii la cine îi încasează',
    legend: {
      published: 'publicat împreună',
      probable: 'legat de noi, probabil',
      possible: 'legat de noi, posibil',
      unknown: 'pas pe care nu-l putem urmări; drumul continuă',
      gap: 'drumul se oprește',
    },
    beneficiary: 'Beneficiar',
    status: 'Stare',
    deadline: 'Termen',
    linkedTitle: 'Contracte și achiziții legate de proiect',
    notPublicTitle: 'Ce nu este public',
    sourcesTitle: 'Surse',
  },
}
