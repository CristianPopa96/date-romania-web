// The Romanian text of the EU projects pages (cohesion funds). Part of `ro` (see ro.ts for
// the rules).

import { counted } from '#/i18n/ro-plural'

export const eu = {
  crumb: 'Programe',
  name: 'Fonduri europene',
  eyebrow: 'Fonduri de coeziune · MIPE',
  title: 'Proiecte cu fonduri europene',
  lead: 'Proiectele finanțate din programele operaționale 2014–2020 și din programele naționale 2021–2027, din listele de proiecte contractate pe care le publică MIPE. Fiecare listă dă valoarea proiectului și cât s-a plătit până la data ei, nu și data fiecărei plăți.',
  // The source line of one project names its list and the day it describes.
  listOn: (record: string, day: string) => `${record}, ${day}`,

  // The programmes held.
  programmesTitle: 'Programele',
  programmesNote:
    'Fiecare program are lista lui, la data ei: sumele nu se adună între programe.',
  programme: 'Program',
  period: 'Perioadă',
  projects: 'Proiecte',
  value: 'Valoare',
  paid: 'Plătit',
  cutOff: 'La data',
  notCollectedRegional:
    'Programele regionale 2021–2027 nu sunt încă colectate.',

  // The finder.
  findTitle: 'Proiectele',
  allProgrammes: 'Toate programele',
  allStatuses: 'Orice stare',
  state: 'Stare',
  searchLabel: 'Caută după titlu, beneficiar sau cod SMIS',
  searchPlaceholder: 'Titlu, beneficiar, SMIS',
  project: 'Proiect',
  beneficiary: 'Beneficiar',
  noProjects: 'Niciun proiect nu se potrivește.',
  found: (n: number, text: string) =>
    counted(n, text, 'Un proiect', 'proiecte'),

  status: {
    in_progress: 'În implementare',
    finished: 'Finalizat',
    terminated: 'Reziliat',
  },

  // How a project's beneficiary is tied to an institution or a company we hold.
  tie: {
    cui: 'CUI în listă',
    namePlace: 'Nume și localitate',
    companyName: 'Nume de firmă',
    none: 'Fără legătură',
  },
  tieHelp: {
    cui: 'Lista MIPE dă CUI-ul beneficiarului.',
    namePlace:
      'Legat de noi: lista dă doar numele, iar o singură instituție sau firmă cu acest nume e în același județ sau aceeași localitate.',
    companyName:
      'Legat de noi: lista dă doar numele, iar o singură firmă din țară poartă acest nume; numele firmelor sunt unice în Registrul Comerțului.',
    none: 'Lista dă doar numele, și nu l-am putut lega de o instituție sau firmă.',
  },

  // A project's page.
  smis: (code: string) => `SMIS ${code}`,
  projectEyebrow: (programme: string, period: string) =>
    `Proiect european · ${programme} ${period}`,
  fallbackTitle: 'Proiect european',
  total: 'Valoare totală',
  started: (day: string) => `început ${day}`,
  eu: 'Din care fonduri UE',
  paidUntil: (day: string) => `Plătit până la ${day}`,
  paidAll: 'Plătit',
  paidUntilDetail: 'data listei MIPE · plățile nu au dată',
  // The list's figure and the payment files cover different days: never mixed.
  paidUntilDated: 'data listei MIPE · plățile, cu data lor, sunt mai jos',
  smisCode: 'Cod SMIS',
  partners: 'Parteneri',
  type: 'Tip beneficiar',
  place: 'Loc de implementare',
  rate: 'Cofinanțare UE',
  starts: 'Început',
  ends: 'Termen',

  // The payments one by one (the Health programme).
  paymentsTitle: 'Plăți',
  paymentsNote: (n: number, text: string, sum: string, days: string) =>
    `${counted(n, text, 'o plată', 'plăți')}, ${sum}${days ? ` · ${days}` : ''} · publicate una câte una de Programul Sănătate`,
  paymentsNone: 'Nicio plată pentru acest proiect în fișierele de plăți.',
  paidOn: 'Data plății',
  amount: 'Sumă',
  kind: 'Tip',

  notPublicTitle: 'Ce nu este public',
  notPublic:
    'Cererile de rambursare, facturile decontate și data fiecărei plăți nu sunt publicate. Lista MIPE dă doar suma plătită până la data ei.',
  notPublicDated:
    'Cererile de rambursare și facturile decontate nu sunt publicate. Plățile de mai sus au data și suma, nu și ce s-a decontat din ele.',
}
