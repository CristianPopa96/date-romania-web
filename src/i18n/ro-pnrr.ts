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
  measureEyebrow: (ministry: string) =>
    `Măsură PNRR · coordonată de ${ministry}`,
  paidWithoutContract: (amount: string, n: number, text: string) =>
    `Din care ${amount} ${n === 1 ? 'într-o plată' : `în ${counted(n, text, 'o plată', 'plăți')}`} către beneficiari fără contract pe această măsură în lista MIPE (companii de stat, transferuri)`,
  naturalPersons: (n: number, text: string) =>
    `Include ${counted(n, text, 'un contract al unei persoane fizice', 'contracte ale unor persoane fizice')}, pe care nu le afișăm nominal.`,
  findTitle: 'Contractele de finanțare',
  allCounties: 'Toate județele',
  allStatuses: 'Orice stare',
  county: 'Județ',
  searchLabel: 'Caută după titlu sau beneficiar',
  searchPlaceholder: 'Titlu sau beneficiar',
  contract: 'Contract',
  value: 'Valoare',
  physical: 'Progres fizic',
  noContracts: 'Niciun contract nu se potrivește.',
  byMeasure: 'diferă pe măsuri',

  status: {
    in_progress: 'În implementare',
    under_30: 'În implementare, sub 30 %',
    finished: 'Finalizat',
  },

  // A contract's page.
  contractTitle: (number: string) => `Contract ${number}`,
  contractEyebrow: (measures: string, ministry: string) =>
    `Contract de finanțare PNRR · ${measures} · coordonat de ${ministry}`,
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
  reportedBy: (ministry: string) => `raportat de ${ministry}`,
  reportedByDiffers: (ministry: string) =>
    `raportat de ${ministry} · poate diferi de plățile numărate de noi`,
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
