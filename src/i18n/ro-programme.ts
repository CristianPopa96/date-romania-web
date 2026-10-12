// The Romanian text of the Anghel Saligny pages. Part of `ro` (see ro.ts for the rules).

import { counted } from '#/i18n/ro-plural'

export const programme = {
  crumb: 'Programe',
  name: 'Anghel Saligny',
  eyebrow: 'Program național de investiții · MDLPA',
  title: 'Programul Anghel Saligny',
  lead: 'Ministerul Dezvoltării plătește primăriilor lucrări de drumuri, apă, canalizare și gaze. Este singurul program în care plățile numesc constructorul cu CUI, așa că le putem lega de contractele lui din SEAP.',

  // The four headline figures.
  paid: (days: string) => `Plătit, în fișierele din ${days}`,
  paidAll: 'Plătit',
  payments: (n: number, text: string) => counted(n, text, 'o plată', 'plăți'),
  projects: 'Proiecte',
  projectsDetail: 'drumuri, apă, canalizare, gaze',
  townHalls: 'Primării și consilii județene',
  townHallsDetail: 'care au primit plăți',
  tied: 'Legat, probabil, de un singur contract SEAP',
  tiedDetail: (ofCount: string) => `din sumă · ${ofCount} din plăți`,
  tiedOf: (n: number, text: string) =>
    `din ${counted(n, text, 'o plată care numește', 'plăți care numesc')} constructorul cu CUI`,
  tiedSeveral: (n: number, text: string) =>
    `${counted(n, text, 'o plată are', 'plăți au')} mai multe contracte posibile și nu ${n === 1 ? 'e numărată' : 'sunt numărate'} aici`,

  // Finding a project.
  findTitle: 'Urmărește un proiect',
  county: 'Județ',
  allCounties: 'Toate județele',
  searchLabel: 'Caută în proiecte',
  searchPlaceholder: 'Caută primăria sau lucrarea',
  allProjects: 'Toate',
  found: (n: number, text: string) =>
    counted(n, text, 'Un proiect', 'proiecte'),
  noProjects: 'Niciun proiect nu se potrivește cu ce ai ales.',
  byBuilder: 'Proiectele la care lucrează constructorul cu {cui}.',
  showAll: 'Arată toate proiectele',
  project: 'Proiectul',
  townHall: 'Primăria',
  paidColumn: 'Plătit',
  contract: 'Contract SEAP',
  countyOf: (name: string) => `județul ${name}`,

  // Whether a contract was found, in a list and on a project.
  match: {
    one: 'Un singur contract',
    several: 'Mai multe contracte posibile',
    none: 'Niciun contract găsit',
    unnamed: 'Constructor fără CUI',
  },
  // One contract found: how sure the link is goes in front, never left out.
  oneContract: {
    probable: 'Probabil un singur contract',
    possible: 'Posibil un singur contract',
  },
  matchOfProject: {
    one: 'Probabil un singur contract',
    several: 'Mai multe contracte posibile',
    none: 'Niciun contract găsit',
    unnamed: 'Constructor numit doar cu numele',
  },

  // How the payments were tied.
  howTitle: 'Cum s-au legat plățile',
  how: 'O plată e legată de un contract de lucrări când același constructor, după CUI, l-a câștigat în SEAP de la o instituție cu numele primăriei. Nicio legătură nu este sigură: fișierul de plăți nu numește contractul. O numim probabilă când SEAP arată că instituția e din județul proiectului sau când nicio altă instituție nu poartă acel nume.',
  howSearched: (from: string, to: string) =>
    `Am căutat în contractele publicate în SEAP între ${from} și ${to}.`,
  howPossible: (n: number, text: string) =>
    `Pentru ${counted(n, text, 'o plată', 'plăți')}, legătura e doar posibilă: mai multe instituții poartă numele primăriei.`,
  matchDetail: {
    one: 'lanțul complet, până la contract',
    several: 'același constructor, aceeași primărie',
    none: 'lanțul se oprește la constructor',
    unnamed: 'fișierul dă doar numele firmei',
  },
  matchAmount: (count: string, amount: string) => `${count} · ${amount}`,
  whyNoneTitle: 'De ce nu găsim un contract.',
  whyNoneLead: 'Cauze posibile, pe care nu le-am verificat rând cu rând:',
  whyNone: [
    'contractul a fost semnat de o asociație de primării sau de consiliul județean, nu de primărie;',
    'contractul a fost publicat în SEAP înainte de 2021;',
    'lucrarea a fost cumpărată prin achiziție directă, care nu apare în exporturile de contracte;',
    'numele primăriei este scris altfel în SEAP.',
  ],
  whyUnnamedTitle: 'De ce unele plăți nu pot fi legate.',
  whyUnnamed: (day: string) =>
    `Fișierele de plăți publicate înainte de ${day} dau doar numele constructorului, fără CUI. După nume nu legăm o plată de un contract. Într-un proiect, o astfel de plată stă lângă plățile care numesc aceeași firmă cu CUI.`,
  whyUnnamedOlder:
    'Fișierele de plăți mai vechi dau doar numele constructorului, fără CUI. După nume nu legăm o plată de un contract. Într-un proiect, o astfel de plată stă lângă plățile care numesc aceeași firmă cu CUI.',
  whyUnnamedAll:
    'Fișierele de plăți preluate dau doar numele constructorului, fără CUI. După nume nu legăm o plată de un contract.',
  filesTitle: 'Fișierele de plăți',
  fileDay: 'Fișierul din',
  filePayments: 'Plăți',
  fileAmount: 'Sumă',
  fileTaxIds: 'Cu CUI-ul constructorului',

  // One project.
  projectTitle: (id: string) => `Proiectul ${id}`,
  fallbackTitle: 'Proiect Anghel Saligny',
  ministryContract: (number: string, day: string) =>
    `Contract de finanțare MDLPA ${number} din ${day}`,
  totalValue: (value: string) => `valoare totală ${value}`,
  stateBudget: (value: string) => `de la bugetul de stat ${value}`,
  alsoEu: 'finanțat și din fonduri europene (POIM)',
  estimatedEnd: (day: string) => `termen estimat ${day}`,

  // The chain, hop by hop.
  chainTitle: 'Drumul banilor',
  ministry: 'Ministerul',
  ministryName: 'MDLPA',
  countyCouncil: 'Consiliul județean',
  projectHop: (id: string) => `nr. ${id}`,
  progress: (share: string) => `progres ${share}`,
  progressAsWritten: (text: string) => `progres: ${text}`,
  builder: 'Constructorul',
  noTaxId: 'fără CUI în fișier',
  contractHop: 'Contract SEAP',
  contractValue: (value: string, share: string) =>
    `${value} · ${share} din valoarea proiectului`,
  contractsOfNotice: (n: number, text: string) =>
    `${counted(n, text, 'un contract', 'contracte')} în anunț`,
  severalHop: (n: number, text: string) =>
    counted(n, text, 'un anunț posibil', 'anunțuri posibile'),
  severalNote: 'vezi lista de mai jos',
  noneHop: 'Niciun contract găsit',
  noneNote: (from: string, to: string) => `căutat în SEAP, ${from}–${to}`,
  unnamedHop: 'Nu putem căuta',
  unnamedNote: 'constructorul nu are CUI în fișier',
  subcontractors: 'Subcontractori',
  subcontractorsNote: 'SEAP nu îi publică',
  ceiling: (value: string) => `acord-cadru · plafon ${value}`,
  links: 'Legături:',
  linkPublished: 'din fișierul de plăți',
  linkProbable: 'legătură probabilă: CUI constructor + nume primărie',
  linkPossible: 'legătură posibilă: CUI constructor + nume primărie',
  linkNone: 'lanțul se oprește',
  chainOf: (name: string) => `Lanțul pentru ${name}`,

  // The contracts under the chain.
  contractTitle: {
    probable: 'Contractul probabil',
    possible: 'Contractul posibil',
  },
  contractLead:
    'Fișierul de plăți nu numește contractul. Acesta este contractul de lucrări pe care constructorul l-a câștigat de la o instituție cu numele primăriei.',
  contractsTitle: 'Contractele posibile',
  // What a link rests on, by the API's name for it.
  evidence: {
    'builder-cui+town-hall-name+county':
      'Legătură probabilă: același constructor, după CUI; instituția are numele primăriei și e din același județ.',
    'builder-cui+only-town-hall-of-that-name':
      'Legătură probabilă: același constructor, după CUI; nicio altă instituție din SEAP nu poartă numele primăriei.',
    'builder-cui+town-hall-name':
      'Legătură posibilă: același constructor, după CUI; mai multe instituții din SEAP poartă numele primăriei.',
  } as Record<string, string | undefined>,
  confidence: {
    probable: 'Legătură probabilă.',
    possible: 'Legătură posibilă.',
  },
  contractsLead:
    'Constructorul a câștigat mai multe contracte de la aceeași primărie. Fișierul de plăți nu spune pe care îl plătește, iar exporturile SEAP din 2023 încoace nu dau titlul contractului, așa că nu alegem unul.',
  notice: 'Anunț',
  contractNo: 'Contract',
  signed: 'Semnat',
  procedure: 'Procedură',
  value: 'Valoare fără TVA',
  ofProject: 'Din valoarea proiectului',
  association: (names: string) =>
    `Câștigat în asociere cu ${names}. Valoarea este a întregului contract.`,
  associationUnnamed:
    'Câștigat în asociere. Valoarea este a întregului contract.',
  framework: 'Acord-cadru: valoarea este un plafon, nu bani cheltuiți.',
  lot: (lot: string) => `lotul ${lot}`,

  // The payments of the project.
  paymentsTitle: 'Plățile pentru acest proiect',
  paymentsNote:
    'Fișierele nu dau ziua plății. Arătăm ziua fișierului în care apare plata și ziua în care ministerul a înregistrat cererea primăriei.',
  request: 'Cererea',
  requestNo: (id: string) => `ASA4-${id}`,
  registered: 'Înregistrată',
  amount: 'Sumă',
  progressColumn: 'Progres',
  designer: 'Proiectantul',
  otherProjects: 'Vezi toate proiectele acestui constructor',
}
