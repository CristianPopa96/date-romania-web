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

  // The list's columns.
  state: 'Stare',
  project: 'Proiect',
  beneficiary: 'Beneficiar',

  status: {
    in_progress: 'În implementare',
    finished: 'Finalizat',
    terminated: 'Reziliat',
  },

  // A beneficiary's projects in the list pattern (DataTable). A programme's figures are
  // never added to another's: a sum is shown only when one programme is chosen.
  list: {
    title: 'Proiectele',
    searchWhat: 'titlu, beneficiar, cod SMIS',
    filters: {
      q: 'Căutare',
      program: 'Program',
      stare: 'Stare',
      valoare: 'Valoare',
    },
    valuePresets: {
      small: 'Sub 1.000.000 lei',
      middle: '1.000.000–25.000.000 lei',
      large: '25.000.000 lei sau mai mult',
    },
    projects: (n: number, text: string) =>
      counted(n, text, 'un proiect', 'proiecte'),
    programme: (value: string, paid: string, day: string | null) =>
      `valoare ${value} · plătit ${paid}${day ? ` până la ${day}` : ''}`,
    of: (whole: string) =>
      `din ${whole} ale beneficiarului; sumele nu se adună între programe, fiecare are data listei lui`,
    otherStatuses: (n: number, text: string) =>
      `${counted(n, text, 'unul', 'proiecte')} cu o stare scrisă altfel în listă`,
    otherStatus: 'Altă stare, scrisă de listă',
    programmesTitle: 'Valoare pe programe',
    programmesUnit: 'lei, fiecare program la data listei lui',
    statusTitle: 'Stare',
    statusUnit: 'proiecte, aceleași filtre',
    total: (programme: string) => `Total ${programme}`,
  },

  // How a project's beneficiary is tied to an institution or a company we hold.
  tie: {
    cui: 'CUI în listă',
    // The design's medium label covers both ties by name and place.
    administration: 'Nume și localitate',
    namePlace: 'Nume și localitate',
    companyName: 'Nume de firmă',
    none: 'Fără legătură',
  },
  tieHelp: {
    cui: 'Lista MIPE dă CUI-ul beneficiarului.',
    administration:
      'Legat de noi: lista dă doar numele unei administrații (de pildă „UAT Comuna Albac”), iar noi l-am legat de primăria sau consiliul județean al acelei localități, din județul proiectului.',
    namePlace:
      'Legat de noi: lista dă doar numele, iar o singură instituție sau firmă dintre cele pe care le avem poartă acest nume în județul sau localitatea proiectului.',
    companyName:
      'Legat de noi: lista dă doar numele, iar o singură firmă dintre cele pe care le avem poartă acest nume. Numele firmelor sunt unice în Registrul Comerțului.',
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
  rateNote: 'partea UE din cheltuielile eligibile',
  // "Drumul banilor" of a cohesion project.
  roadFunder: 'Finanțator',
  roadEu: 'Uniunea Europeană',
  roadFunds: 'fondurile de coeziune',
  roadProgramme: 'Program',
  roadContract: 'Contract de finanțare',
  roadPayments: 'Plăți',
  roadPaymentsCount: (n: number, text: string) =>
    counted(n, text, 'o plată', 'plăți'),
  roadDated: 'publicate una câte una, cu data lor',
  roadUntil: (day: string) => `cumulat până la ${day}, fără dată`,
  roadNoPaid: 'lista nu dă suma plătită',
  roadNoCutOff: 'cumulat, fără dată · lista nu spune până la ce zi',
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

  // The SEAP records whose text cites a project, on both kinds of project page: `smis` a
  // cohesion project, `pnrr` a PNRR financing contract.
  seap: {
    // Only what the tie supports: the buyer's text cites the project, nothing proves it paid.
    // One heading for every programme (round 13); the line beside it says how they were found.
    title: 'Contracte și achiziții legate de proiect',
    note: {
      smis: 'care citează codul SMIS',
      pnrr: 'care citează numărul contractului de finanțare',
    },
    // The road's last two steps.
    hopRecords: 'Achiziții',
    hopNone: 'Nicio achiziție găsită',
    hopNoneNote: {
      smis: 'niciun anunț sau achiziție nu citează codul SMIS',
      pnrr: 'niciun anunț sau achiziție nu citează numărul contractului',
    },
    hopNotices: (n: number, text: string) =>
      counted(n, text, 'un anunț', 'anunțuri'),
    hopPurchases: (n: number, text: string) =>
      counted(n, text, 'o achiziție directă', 'achiziții directe'),
    hopCited: {
      smis: 'care citează codul SMIS',
      pnrr: 'care citează nr. contractului',
    },
    probable: 'Probabil',
    hopCompanies: 'Firme',
    hopCompaniesNote:
      'cea mai mare valoare, contracte și achiziții directe adunate; o asociere, cu toată valoarea contractului',
    hopFailed: 'Nu am putut citi',
    hopFailedNote: 'anunțurile și achizițiile din SEAP, acum',
    andMore: (n: number) => `și încă ${n}`,
    none: {
      smis: 'Niciun anunț de atribuire și nicio achiziție directă dintre cele pe care le avem nu citează codul SMIS al proiectului.',
      pnrr: 'Niciun anunț de atribuire și nicio achiziție directă dintre cele pe care le avem nu citează numărul acestui contract de finanțare.',
    },
    contracts: (n: number, text: string) =>
      counted(
        n,
        text,
        'Un contract din anunțuri de atribuire',
        'contracte din anunțuri de atribuire',
      ),
    purchases: (n: number, text: string) =>
      counted(n, text, 'O achiziție directă', 'achiziții directe'),
    contractsCaption: 'Contractele din anunțurile de atribuire',
    purchasesCaption: 'Achizițiile directe',
    contract: 'Contract',
    purchase: 'Achiziție',
    supplier: 'Furnizor',
    value: 'Valoare fără TVA',
    link: 'Legătură',
    // By the kind of project, then of record: a direct purchase is not a notice.
    badge: {
      smis: { notice: 'SMIS în anunț', purchase: 'SMIS în achiziție' },
      pnrr: {
        notice: 'Nr. finanțare în anunț',
        purchase: 'Nr. finanțare în achiziție',
      },
    },
    failed:
      'Nu am putut citi acum contractele și achizițiile din SEAP. Încearcă din nou mai târziu.',
    help: {
      smis: (cited: string) =>
        `Legat de noi: codul SMIS ${cited} apare în textul scris de cumpărător în SEAP. SEAP nu are un câmp pentru proiect și nu verifică ce scrie cumpărătorul.`,
      pnrr: (cited: string) =>
        `Legat de noi: numărul „${cited}” apare în textul scris de cumpărător în SEAP și este numărul unui contract de finanțare PNRR al aceluiași cumpărător. SEAP nu verifică ce scrie cumpărătorul.`,
    },
    // A partner of the project buys for it too.
    boughtBy: (name: string) => `cumpărat de ${name}`,
    incomplete: {
      smis: 'Lista poate fi incompletă. Codul SMIS apare în SEAP doar când autoritatea l-a scris în anunț; nu e un câmp obligatoriu. Citim doar anunțurile și achizițiile din perioada pe care o avem.',
      pnrr: 'Lista poate fi incompletă. Numărul contractului de finanțare apare în anunț doar când autoritatea l-a scris acolo; nu e un câmp obligatoriu în SEAP. Citim doar anunțurile și achizițiile din perioada pe care o avem.',
    },
  },

  notPublicTitle: 'Ce nu este public',
  notPublic:
    'Cererile de rambursare, facturile decontate și data fiecărei plăți nu sunt publicate. Lista MIPE dă doar suma plătită până la data ei.',
  notPublicDated:
    'Cererile de rambursare și facturile decontate nu sunt publicate. Plățile de mai sus au data și suma, nu și ce s-a decontat din ele.',
}
