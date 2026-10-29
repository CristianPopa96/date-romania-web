// The Romanian text of the PNRR pages. Part of `ro` (see ro.ts for the rules).

import { counted } from '#/i18n/ro-plural'

export const pnrr = {
  crumb: 'Programe',
  name: 'PNRR',
  eyebrow: 'Planul Național de Redresare și Reziliență · MIPE',
  title: 'Planul Național de Redresare și Reziliență',
  lead: 'Bani europeni pentru reforme și investiții, împărțiți în componente și măsuri, fiecare coordonată de un minister. Tabloul de bord al MIPE publică fiecare contract de finanțare cu beneficiarul lui și fiecare plată, cu data ei.',
  // The source line names the dashboard edition every figure comes from.
  edition: (record: string, day: string) => `${record}, ediția ${day}`,

  // The programme's figures.
  allocated: 'Alocat',
  allocatedDetail: 'în euro, așa cum îl publică MIPE',
  contracted: 'Contractat',
  contractedDetail: 'fonduri UE, în lei: MIPE nu publică suma și în euro',
  paid: 'Plătit',
  paidDetail: (share: string) => `${share} din alocat`,
  contracts: (n: number, text: string) =>
    counted(n, text, 'un contract de finanțare', 'contracte de finanțare'),

  // Tabs of the programme page.
  measuresTab: 'Măsuri',
  topTab: 'Cei mai mari beneficiari',
  measuresNote: 'Sume în euro, în afară de „Contractat”, publicat doar în lei.',
  measure: 'Măsură',
  ministry: 'Coordonator',
  allocatedEur: 'Alocat (euro)',
  contractedRon: 'Contractat (lei)',
  paidEur: 'Plătit (euro)',
  paidOfAllocated: 'Plătit din alocat',
  topNote: (day: string) =>
    `Cei mai mari destinatari finali, pe care Regulamentul UE 2021/241 cere să fie publicați. Ediția din ${day}.`,
  recipient: 'Beneficiar',
  received: 'Primit',
  lastReceived: 'Ultima plată',

  // A measure's page.
  measureEyebrow: (ministry: string | null) =>
    ministry ? `Măsură PNRR · coordonată de ${ministry}` : 'Măsură PNRR',
  // Lei from the payments file, under a figure in euro from the measures file: not a
  // part of it, so it is said apart.
  paidWithoutContract: (amount: string, n: number, text: string) =>
    `În fișierul de plăți: ${amount} ${n === 1 ? 'într-o plată' : `în ${counted(n, text, 'o plată', 'plăți')}`} către beneficiari fără contract pe această măsură în lista MIPE (companii de stat, transferuri)`,
  naturalPersons: (n: number, text: string) =>
    `Include ${counted(n, text, 'un contract al unei persoane fizice', 'contracte ale unor persoane fizice')}, pe care nu le afișăm nominal.`,
  findTitle: 'Contractele de finanțare',
  contract: 'Contract',
  value: 'Valoare',
  physical: 'Progres fizic',
  byMeasure: 'diferă pe măsuri',

  status: {
    in_progress: 'În implementare',
    under_30: 'În implementare, sub 30 %',
    finished: 'Finalizat',
  },

  // A beneficiary's contracts in the list pattern (DataTable).
  list: {
    title: 'Contractele',
    searchWhat: 'titlu',
    searchWhatMeasure: 'titlu, beneficiar',
    filters: {
      q: 'Căutare',
      masura: 'Măsură',
      judet: 'Județ',
      beneficiar: 'Beneficiar',
      stare: 'Stare',
      valoare: 'Valoare',
      progres: 'Progres fizic',
    },
    valuePresets: {
      small: 'Sub 1.000.000 lei',
      middle: '1.000.000–25.000.000 lei',
      large: '25.000.000 lei sau mai mult',
    },
    progressBands: ['0–25 %', '25–50 %', '50–75 %', '75–99 %', '100 %'],
    progressRange: (min: number, max: number) => `${min}–${max} %`,
    contracts: (n: number, text: string) =>
      counted(n, text, 'un contract', 'contracte'),
    value: (value: string) => `valoare ${value}`,
    of: (whole: string, edition: string) =>
      `din ${whole} ale beneficiarului · ediția din ${edition} a datelor MIPE`,
    ofMeasure: (whole: string, edition: string) =>
      `din ${whole} ale măsurii · ediția din ${edition} a datelor MIPE`,
    natural: (n: number, text: string) =>
      `plus ${counted(n, text, 'un contract al unei persoane fizice', 'contracte ale unor persoane fizice')}, pe care nu le afișăm nominal`,
    differ: (n: number, text: string) =>
      `${counted(n, text, 'unul', 'contracte')} cu măsuri în stări diferite`,
    statusTitle: 'Stare',
    statusUnit: 'contracte, aceleași filtre',
    differPart: 'Diferă pe măsuri',
    progressTitle: 'Progres fizic',
    progressUnit: 'contracte, unde măsurile lor dau același progres',
    beneficiariesTitle: 'Cei mai mari beneficiari',
    beneficiariesUnit: 'lei, aceleași filtre',
    total: (n: number, text: string) =>
      `Total pentru filtrele alese · ${counted(n, text, 'un contract', 'contracte')}`,
  },

  // A contract's page.
  contractTitle: (number: string) => `Contract ${number}`,
  contractEyebrow: (measures: string, ministry: string | null) =>
    `Contract de finanțare PNRR · ${measures}${ministry ? ` · coordonat de ${ministry}` : ''}`,
  fallbackTitle: 'Contract de finanțare PNRR',
  total: 'Valoare totală',
  signed: (day: string) => `contract semnat ${day}`,
  eu: 'Din care fonduri UE',
  paidSoFar: 'Plătit până acum',
  paidSoFarDetail: (n: number, text: string, day: string | null) =>
    `${counted(n, text, 'o plată', 'plăți')}${day ? ` · ultima ${day}` : ''}`,
  paidOnContract: 'Plătit pe acest contract',
  cannotSay: 'Nu putem spune',
  cannotSayDetail: 'plățile numesc beneficiarul și măsura, nu contractul',
  noPayment: 'Nicio plată găsită',
  progressPhysical: 'Progres fizic',
  progressFinancial: 'Progres financiar',
  // A ministry the dashboard leaves out is named by what it is.
  reportedBy: (ministry: string | null) =>
    `raportat de ${ministry ?? 'minister'}`,
  reportedByDiffers: (ministry: string | null) =>
    `raportat de ${ministry ?? 'minister'} · poate diferi de plățile numărate de noi`,
  progressByMeasure: 'Progresul raportat, pe măsuri',
  progressRow: (physical: string, financial: string) =>
    `fizic ${physical} · financiar ${financial}`,
  number: 'Nr. contract',
  beneficiary: 'Beneficiar',
  component: 'Componentă',
  measures: 'Măsuri',
  funding: 'Finanțare',
  state: 'Stare',
  ends: 'Termen',
  fundings: { grant: 'grant', loan: 'împrumut' } as Record<
    string,
    string | undefined
  >,

  // The payments, per measure of the contract.
  paymentsTitle: 'Plăți',
  paymentsOwn: (beneficiary: string, measure: string) =>
    `plățile către ${beneficiary} pe ${measure}; e singurul ei contract pe această măsură`,
  paymentsNone: (beneficiary: string, measure: string) =>
    `pentru ${beneficiary} pe ${measure}, în fișierul de plăți`,
  paymentsFolded: (count: string, sum: string) => `${count} · ${sum}`,
  paymentsShared: (beneficiary: string, measure: string) =>
    `Plăți către ${beneficiary} pe ${measure}`,
  paymentsSharedDetail: (n: number, text: string, days: string) =>
    `pentru toate cele ${counted(n, text, 'un contract', 'contracte')} de mai jos${days ? ` · ${days}` : ''}`,
  paymentsCount: (n: number, text: string) =>
    counted(n, text, 'o plată', 'plăți'),
  others: 'Contractele beneficiarului pe această măsură',
  thisContract: 'acest contract',
  paidOn: 'Data plății',
  amount: 'Sumă',
  kind: 'Tip',

  notPublicTitle: 'Ce nu este public',
  notPublic:
    'Cererile de plată, facturile decontate și rapoartele de progres nu sunt publicate. Progresul de mai sus e cifra raportată de minister, fără documentele din spatele ei.',
}
