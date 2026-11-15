// The Romanian text of the home page's national budget (design round 18, ScreenHome,
// SpendingBand and CheckTable). Part of `ro` (see ro.ts for the rules). "Diferență",
// never "lipsă" or "ascuns"; every figure keeps its source line and period.

import { counted } from '#/i18n/ro-plural'

// "după nouă luni din douăsprezece": months as words, as the design writes them.
const MONTHS = [
  'o lună',
  'două luni',
  'trei luni',
  'patru luni',
  'cinci luni',
  'șase luni',
  'șapte luni',
  'opt luni',
  'nouă luni',
  'zece luni',
  'unsprezece luni',
  'douăsprezece luni',
]

export const national = {
  months: (n: number) => MONTHS[n - 1] ?? `${n} luni`,
  span: (from: string, to: string) => `${from}–${to}`,
  // What fills a block whose source is not collected yet: the document that will.
  fills: {
    execution:
      'Se completează din execuția bugetului general consolidat, publicată lunar de Ministerul Finanțelor.',
    planned:
      'Se completează din documentele legii bugetului, cu pagina fiecărei cifre.',
    cofog:
      'Se completează din tabelul gov_10a_exp al Eurostat, cheltuielile administrației publice pe domenii.',
  },

  budget: {
    title: (year: string) => `Bugetul țării în ${year}`,
    titleNone: 'Bugetul țării',
    lead: 'Bugetul general consolidat: tot ce cheltuie statul, de la pensii la drumuri.',
    planned: (year: string) => `Programat pentru ${year}`,
    plannedSource: (act: string, day: string, page: string) =>
      `${act} · MO ${day} · raportul guvernului, p. ${page}`,
    openDocument: 'Deschide documentul',
    spent: (day: string) => `Cheltuit până la ${day}`,
    progress: (share: string, months: string) =>
      `${share} din suma programată, după ${months} din douăsprezece`,
    spentOn: (period: string) => `Pe ce s-a cheltuit, ${period}`,
    categories: {
      social_assistance: 'Asistență socială',
      personnel: 'Cheltuieli de personal',
      goods_services: 'Bunuri și servicii',
      interest: 'Dobânzi',
      pnrr_projects: 'Proiecte PNRR',
      capital: 'Cheltuieli de capital',
      eu_projects: 'Proiecte cu fonduri UE',
      other: 'Alte cheltuieli',
    } as Record<string, string | undefined>,
  },

  traceable: {
    title: 'Ce parte din acești bani putem urmări',
    lead: 'Pensiile, salariile și dobânzile nu se cumpără de la furnizori, așa că nu apar în niciun contract. Doar o parte din bani trece prin achiziții publice.',
    segments: {
      not_procurement: {
        label: 'Nu trec prin achiziții',
        holds: 'asistență socială, salarii, dobânzi',
      },
      procurement: {
        label: 'Pot trece prin achiziții',
        holds: 'bunuri și servicii, investiții, proiecte UE și PNRR',
      },
      rest: {
        label: 'Restul',
        holds: 'subvenții, transferuri și alte cheltuieli',
      },
    },
    value: (amount: string, share: string) => `${amount} · ${share}`,
    // The band for a screen reader, in one sentence.
    aria: (
      total: string,
      period: string,
      never: string,
      can: string,
      rest: string,
    ) =>
      `Din ${total} cheltuiți în ${period}: ${never} nu trec prin achiziții, ${can} pot trece prin achiziții, restul de ${rest} sunt subvenții, transferuri și alte cheltuieli.`,
    canTitle: 'Partea care poate trece prin achiziții',
    canText: (amount: string, period: string) =>
      `${amount} plătiți în ${period} pe bunuri și servicii, investiții și proiecte UE și PNRR.`,
    callout: (months: string) =>
      `Sumele nu se scad una din alta. Execuția arată bani plătiți, cu TVA, în ${months}. Contractele arată valori semnate, fără TVA, plătite adesea pe mai mulți ani. Le punem alături, nu calculăm o diferență.`,
    oursTitle: 'Ce avem noi',
    ours: {
      contracts: (year: string) => `Contracte semnate în ${year}`,
      direct_purchases: (year: string) =>
        `Achiziții directe acceptate în ${year}`,
      anghel_saligny: () => 'Plăți Anghel Saligny către primării',
      institution_payments: () => 'Plăți pe instituție, către furnizori',
    } as Record<string, ((year: string) => string) | undefined>,
    oursLine: {
      contracts: (period: string) =>
        `SEAP · fără TVA · semnate ${period} · listă incompletă`,
      direct_purchases: (period: string) => `SEAP · fără TVA · ${period}`,
      anghel_saligny: (period: string) => `MDLPA · fișierele din ${period}`,
    } as Record<string, ((period: string) => string) | undefined>,
    institutionPayments: 'execuția pe instituție nu numește furnizorul',
  },

  checks: {
    title: 'Cifrele oficiale, verificate cu ale noastre',
    lead: 'Unde cifra oficială și a noastră măsoară același lucru în aceeași perioadă, arătăm diferența și de unde vine. Unde nu, le punem alături și spunem de ce.',
    columns: {
      check: 'Verificare',
      official: 'Cifra oficială',
      ours: 'Cifra noastră',
      period: 'Perioada',
      difference: 'Diferența',
      why: 'De ce',
    },
    names: {
      local_budgets: [
        'Bugetele locale',
        'cheltuieli, toate primăriile și consiliile județene',
      ],
      local_domains: [
        'Cheltuieli locale pe domenii',
        'administrația locală, pe zece domenii',
      ],
      anghel_saligny: ['Anghel Saligny', 'credite față de plăți'],
      pnrr: ['Proiecte PNRR', 'plăți'],
      eu_funds: ['Proiecte cu fonduri UE', 'plăți'],
    } as Record<string, [string, string] | undefined>,
    officialSource: {
      local_budgets: (month: string) =>
        `MF · execuția BGC, ${month}, bugete locale`,
      local_domains: () => 'Eurostat · COFOG, administrația locală',
      anghel_saligny: () => 'Legea bugetului · credite pentru program',
      pnrr: (month: string) =>
        `MF · execuția BGC la ${month}, granturi și împrumuturi PNRR`,
      eu_funds: (month: string) =>
        `MF · execuția BGC la ${month}, proiecte cu finanțare UE`,
    } as Record<string, ((month: string) => string) | undefined>,
    oursSource: {
      local_budgets: (places: string) =>
        `MDLPA · ${places} primării și consilii județene`,
      local_domains: () => 'MDLPA · capitolele bugetelor locale',
      anghel_saligny: (period: string) =>
        `MDLPA · fișierele de plăți, ${period}`,
      pnrr: () => 'MIPE · tabloul de bord PNRR',
      eu_funds: () => 'plățile pe proiect nu sunt colectate',
    } as Record<string, ((detail: string) => string) | undefined>,
    contracts: (n: number, text: string) =>
      counted(n, text, 'un contract', 'contracte'),
    difference: (amount: string, share: string) => `${amount} · ${share}`,
    paid: (share: string) => `plătit ${share} din credite`,
    // Payments above the credits of the law (design D24, Q92).
    overCredits:
      'Plățile depășesc creditele din lege: creditele pot crește în cursul anului, prin rectificare.',
    differentMeasures: 'Nu se compară',
    notYet: 'Nu se compară încă',
    reasons: {
      local_scope:
        'Fișierul nostru ține doar primăriile și consiliile județene; cifra oficială cuprinde toate bugetele locale.',
      accrual_not_cash:
        'Eurostat numără ce s-a datorat în an; noi numărăm ce s-a plătit.',
      credits_for_the_year:
        'Creditele sunt pentru tot anul; plățile sunt până la ultimul fișier publicat.',
      contracts_not_payments:
        'Avem contractele, nu plățile pe proiect: o valoare contractată nu se compară cu bani plătiți.',
      payments_undated:
        'Listele MIPE dau valori contractate și plăți cumulate fără dată, nu plăți pe perioadă.',
    } as Record<string, string | undefined>,
    byDomain: 'Pe domenii, mai jos.',
  },

  domains: {
    title: 'Pe domenii',
    lead: (year: string) =>
      `Cheltuielile statului în ${year}, pe domenii, și cât din fiecare trece prin administrația locală.`,
    local: 'administrația locală',
    rest: 'restul administrației',
    localShare: (share: string) => `administrația locală ${share}`,
    centralOnly: 'doar administrația centrală',
    names: {
      GF01: 'Servicii publice generale',
      GF02: 'Apărare',
      GF03: 'Ordine publică',
      GF04: 'Afaceri economice',
      GF05: 'Mediu',
      GF06: 'Locuințe și utilități',
      GF07: 'Sănătate',
      GF08: 'Cultură, recreere și religie',
      GF09: 'Educație',
      GF10: 'Protecție socială',
    } as Record<string, string | undefined>,
    source: (year: string, total: string, day: string) =>
      `Sursa: Eurostat · gov_10a_exp (COFOG), România, ${year} · total ${total} · actualizat ${day}`,
  },
}
