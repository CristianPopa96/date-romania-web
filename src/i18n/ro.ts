// Every piece of interface text, in Romanian. A second language is a file with the same
// shape (`Messages`), so a missing or extra message fails the type check.
//
// Rules: numbers, amounts and dates arrive already formatted (see lib/format.ts), never
// typed into a string here. A message that needs a link or a styled part inside it names
// the place as `{part}` and is filled with `rich()`. Data is never translated.

const rules = new Intl.PluralRules('ro')

type Forms = { one: string; few: string; other: string }

function plural(n: number, forms: Forms) {
  const form = rules.select(n)
  return form === 'one' || form === 'few' ? forms[form] : forms.other
}

// "5 achiziții", "20 de achiziții": Romanian puts "de" after numbers from 20 up.
function counted(n: number, text: string, one: string, many: string) {
  return plural(n, {
    one,
    few: `${text} ${many}`,
    other: `${text} de ${many}`,
  })
}

export const ro = {
  common: {
    search: 'Caută',
    notPublished: 'Nepublicat',
    cui: 'CUI {cui}',
    cpv: 'CPV {code}',
    back: 'Înapoi',
    forward: 'Înainte',
    page: (page: string, pages: string) => `Pagina ${page} din ${pages}`,
    unavailable:
      'Datele nu sunt disponibile acum. Încearcă din nou peste câteva minute.',
    withoutVat: 'fără TVA',
    institution: 'Instituție',
    supplier: 'Furnizor',
    company: 'Firmă',
  },

  money: {
    lei: (amount: string) => `${amount} lei`,
    million: (amount: string) => `${amount} mil. lei`,
    billion: (amount: string) => `${amount} mld. lei`,
  },

  site: {
    tagline:
      'Unde merg banii publici: achiziții, contracte și plăți, cu sursa fiecărei cifre.',
    footerData:
      'Datele provin din surse publice și pot fi refolosite sub licența CC BY 4.0. Fiecare cifră își arată sursa.',
    footerCode: 'Codul este public: {site} și {api}.',
    footerSite: 'site',
    footerReport: 'Ai găsit o greșeală? {link}.',
    footerApi: 'API',
  },

  nav: {
    label: 'Secțiuni',
    rankings: 'Clasamente',
    sources: 'Surse',
  },

  notFound: {
    title: 'Pagina nu există',
    hint: 'Verifică adresa sau caută instituția ori firma după nume sau CUI.',
  },

  source: {
    line: (parts: string) => `Sursa: ${parts}`,
    // Where two sources stand side by side, each says what it is the source of.
    of: {
      contracts: (parts: string) => `Sursa contractelor: ${parts}`,
      purchases: (parts: string) => `Sursa achizițiilor directe: ${parts}`,
    },
    fetched: (day: string) => `preluat ${day}`,
    open: 'Vezi la sursă',
  },

  home: {
    headline: 'Urmărește banii publici, de la buget la contract.',
    // Only what the site holds today; it grows with each source added.
    lead: 'Contracte și achiziții publicate de instituțiile statului, puse cap la cap. Unde datele se opresc, îți arătăm ce lipsește.',
    examples: 'Exemple:',
    // Words that find something in any period: kinds of institution, not names.
    exampleSearches: [
      'primăria',
      'consiliul județean',
      'spitalul județean',
      'universitatea',
    ],
    directPurchases: 'Achiziții directe',
    acceptedValue: 'Valoare acceptată',
    acceptedPurchases: 'Achiziții acceptate',
    institutions: 'Instituții',
    suppliers: 'Furnizori',
    seeRankings: 'Vezi clasamentele',
    seeSources: 'Vezi sursele și cum numărăm',
  },

  // What the site is built on, one row per source.
  datasets: {
    title: 'Ce date avem',
    source: 'Sursa',
    period: 'Perioada',
    records: 'Înregistrări',
    fetched: 'Preluat ultima dată',
    names: {
      'seap-direct': 'achiziții directe',
      'seap-awards': 'anunțuri de atribuire',
    } as Record<string, string | undefined>,
    name: (publisher: string, what: string) => `${publisher} · ${what}`,
    // What the count of a source counts, where the word "records" is not enough.
    counts: {
      'seap-awards': 'contracte semnate în perioadă',
    } as Record<string, string | undefined>,
    complete: 'completă',
    incomplete: 'listă incompletă',
  },

  // The sources page: what we hold, what is still to come, how the data may be used.
  sources: {
    eyebrow: 'Surse și metodologie',
    title: 'De unde vin datele',
    lead: 'Fiecare cifră de pe site are o sursă publică. Aici vezi ce am preluat, pentru ce zile, când am citit sursa ultima dată și ce nu știm.',
    tabSources: (count: string) => `Surse (${count})`,
    tabMethod: 'Metodologie',
    heldTitle: 'Surse preluate',
    source: 'Sursa',
    period: 'Perioada',
    fetched: 'Preluat ultima dată',
    rows: 'Ce avem',
    limits: 'Limite cunoscute',
    brings: {
      'seap-direct': 'cumpărări sub pragul de licitație, cu furnizor și CUI',
      'seap-awards': 'contracte atribuite prin proceduri de achiziție',
    } as Record<string, string | undefined>,
    limitsOf: {
      'seap-direct': [
        'fără linie bugetară',
        'fără produsele cumpărate și condițiile de plată, încă',
      ],
      'seap-awards': [
        'fără linie bugetară',
        'numărul de oferte nu e publicat',
        'contractele apar la săptămâni după semnare',
      ],
    } as Record<string, Array<string> | undefined>,
    daysRead: (full: string, expected: number, expectedText: string) =>
      `${full} din ${counted(expected, expectedText, 'o zi', 'zile')} citite complet`,
    daysPartial: (n: number, text: string) =>
      `${counted(n, text, 'o zi', 'zile')} citite parțial`,
    daysMissing: (n: number, text: string) =>
      `${counted(n, text, 'o zi', 'zile')} necitite`,
    purchases: (n: number, text: string) =>
      counted(n, text, 'o achiziție', 'achiziții'),
    accepted: (count: string) => `${count} acceptate`,
    notices: (n: number, text: string) =>
      counted(n, text, 'un anunț', 'anunțuri'),
    contractsHeld: (contracts: string, signed: string) =>
      `${contracts}, din care ${signed} semnate în perioadă`,
    frozen:
      'Am preluat doar zilele din perioada arătată. Deocamdată nu preluăm alte zile.',
    toComeTitle: 'Surse pe care nu le-am preluat încă',
    toComeLead:
      'Aceste surse sunt publice și intră în plan. Până le preluăm, cifrele care depind de ele apar pe site ca „Încă necolectat”.',
    toCome: [
      {
        name: 'Execuția bugetară (Forexebug)',
        brings: 'cât a cheltuit fiecare instituție, pe capitole de buget',
      },
      {
        name: 'MDLPA · plăți Anghel Saligny',
        brings: 'plăți către primării, cu constructorul și CUI-ul lui',
      },
      {
        name: 'MIPE · fonduri europene',
        brings: 'cât s-a plătit din fiecare program',
      },
      {
        name: 'ANAF',
        brings: 'județul și localitatea instituțiilor și firmelor',
      },
      {
        name: 'TED',
        brings: 'anunțurile publicate în Jurnalul Oficial al UE',
      },
    ],
    reuseTitle: 'Cum poți folosi datele',
    reuse:
      'Datele pot fi refolosite sub licența CC BY 4.0, cu menționarea sursei. Fiecare rând exportat își păstrează sursa și data la care a fost preluat.',
    exportContracts: 'Exportă contractele din perioadă (CSV)',
  },

  // The form a reader uses to say something is wrong.
  report: {
    link: 'Raportează o eroare',
    title: 'Raportează o eroare',
    lead: 'Dacă o cifră sau un nume de pe site nu se potrivește cu sursa, spune-ne. O persoană citește fiecare raportare înainte să schimbăm ceva.',
    page: 'Pagina',
    pageHint: 'adresa paginii, de exemplu /contracte/123',
    message: 'Ce e greșit',
    messageHint: 'De exemplu: valoarea include TVA, nu e fără TVA.',
    noPersonal: 'Nu scrie date personale în raportare.',
    evidence: 'Sursa care arată valoarea corectă (opțional)',
    evidenceHint: 'link sau document',
    public: 'Corecturile acceptate apar public în fila Corecturi.',
    send: 'Trimite',
    sending: 'Se trimite…',
    sent: 'Am primit raportarea. O citim și, dacă se confirmă, corectura apare în fila Corecturi.',
    tooShort: (min: string) =>
      `Scrie ce e greșit, în cel puțin ${min} caractere.`,
    tooLong: (max: string) =>
      `Textul e prea lung: cel mult ${max} de caractere.`,
    busy: 'Am primit prea multe raportări în ultima oră. Încearcă din nou mai târziu.',
    failed:
      'Nu am putut trimite raportarea. Încearcă din nou peste câteva minute.',
  },

  // What was corrected after a report.
  corrections: {
    tab: 'Corecturi',
    tabCounted: (count: string) => `Corecturi (${count})`,
    title: 'Corecturi',
    lead: 'Erorile raportate de cititori și confirmate, cu ce am schimbat. Textul raportării nu este publicat.',
    none: 'Nicio corectură până acum.',
    day: 'Data',
    page: 'Pagina',
    what: 'Ce am corectat',
  },

  // How the figures are counted, in words. The rules live in the API.
  method: {
    title: 'Cum numărăm',
    acceptedTitle: 'Doar achizițiile acceptate sunt bani cheltuiți',
    accepted:
      'O achiziție directă intră în totaluri doar dacă oferta a fost acceptată. Cele refuzate sau anulate apar în liste, dar nu se adună.',
    limitTitle: 'Achiziții peste plafon',
    limit: (limit: string) =>
      `O achiziție acceptată publicată peste ${limit}, cel mai mare plafon legal pentru o achiziție directă, nu intră în totaluri și e arătată separat. Este ceea ce publică SEAP; nu spunem că e o greșeală.`,
    noticeTitle: 'Un anunț nu este un contract',
    notice:
      'Un anunț de atribuire poate avea mai multe contracte, iar SEAP îl republică de fiecare dată când se adaugă unul. Numărăm contractele după data semnării, nu după ziua publicării anunțului.',
    frameworkTitle: 'Acordurile-cadru nu se adună',
    associationTitle: 'Asocieri',
    association:
      'La o firmă arătăm separat ce a câștigat singură și ce a câștigat în asociere și nu adunăm cele două cifre.',
    apartTitle: 'Contracte și achiziții directe',
    apart:
      'Nu le adunăm niciodată. Au cifre separate, liste separate și clasamente separate.',
    vatTitle: 'Sume fără TVA',
    vat: 'Toate sumele sunt în lei, fără TVA, așa cum le publică SEAP.',
    personalTitle: 'Date personale',
    personal:
      'O persoană fizică autorizată poate apărea în SEAP cu codul numeric personal. Îl ascundem înainte de a salva rândul: pe site apare ca [CNP].',
    rawTitle: 'Păstrăm originalul',
    raw: (n: number, text: string) =>
      `Fiecare răspuns primit de la o sursă e păstrat neschimbat, cu amprenta lui, înainte de a fi citit. Până acum sunt ${counted(n, text, 'un răspuns', 'răspunsuri')}.`,
    gapTitle: 'De ce nu se vede tot drumul banilor',
    gap: 'Bugetul, contractele și plățile sunt publicate de sisteme diferite, care nu au un identificator comun. Contractele nu spun din ce linie de buget sunt plătite, iar plățile către firme nu sunt publicate, cu puține excepții. De aceea arătăm capetele pe care le putem citi și spunem ce lipsește între ele.',
  },

  search: {
    title: 'Căutare',
    placeholder: 'Caută o instituție, o firmă sau un CUI',
    placeholderShort: 'Caută instituție, firmă, CUI…',
    tooShort: 'Scrie cel puțin două litere sau cifre.',
    none: (q: string) =>
      `Niciun rezultat pentru „${q}”. Căutăm doar printre instituțiile și firmele care apar în achizițiile directe și în anunțurile de atribuire preluate.`,
    cuiHint: 'Un CUI valid te duce direct la pagina instituției sau a firmei.',
    all: 'Toate',
    institutions: 'Instituții',
    companies: 'Firme',
    noneOfKind: 'Niciun rezultat de acest tip.',
    found: (n: number, text: string, q: string) =>
      `${counted(n, text, 'Un rezultat', 'rezultate')} pentru „${q}”`,
  },

  // Which period a figure covers and whether the list behind it is complete (PeriodNote
  // in the design system). The dates always come from the data held.
  period: {
    range: (from: string, to: string) => `${from}–${to}`,
    signed: (count: string, range: string) =>
      `${count} · semnate ${range} · listă incompletă`,
    complete: (count: string, range: string) =>
      `${count} · ${range} · completă`,
    incompleteTitle: 'Lista contractelor nu e completă.',
    incomplete: (from: string, to: string) =>
      `Numărăm contractele semnate între ${from} și ${to}. SEAP publică multe contracte la câteva săptămâni după semnare, așa că o parte din cele semnate în această perioadă lipsesc.`,
  },

  entity: {
    awarded: 'Contracte atribuite',
    wonAlone: 'Câștigate singur',
    wonTogether: 'Câștigate în asociere',
    undivided: 'valoarea întreagă a contractelor, nedivizată între membri',
    directAccepted: 'Achiziții directe acceptate',
    withoutVat: 'Sumele sunt fără TVA.',
    lists: 'Contracte și achiziții',
    tabContracts: 'Contracte',
    tabPurchases: 'Achiziții directe',
    purchasesCount: (n: number, text: string) =>
      counted(n, text, 'o achiziție', 'achiziții'),
  },

  // The two ends of public money on an institution's page (GapPanel in the design
  // system). Only the middle is held today.
  gap: {
    title: 'Cele două capete ale banilor',
    spent: 'Cheltuieli de capital executate',
    awarded: 'Contracte atribuite',
    awardedNote: 'SEAP · fără linie bugetară',
    paid: 'Plăți pe care le putem numi',
    whyTitle: 'Ce se vede deocamdată.',
    why: 'Contractele arată cui s-au atribuit banii, dar nu din ce linie de buget. Execuția bugetară, care arată cât s-a cheltuit, și plățile publicate cu numele celui plătit există la sursă, dar nu le-am preluat încă.',
  },

  contracts: {
    count: (n: number, text: string) =>
      counted(n, text, 'un contract', 'contracte'),
    object: 'Obiect',
    contract: 'Contract',
    supplier: 'Furnizor',
    buyer: 'Cumpărător',
    winner: 'Câștigător',
    procedure: 'Procedură',
    won: 'Câștigat',
    alone: 'singur',
    value: 'Valoare fără TVA',
    date: 'Data semnării',
    rank: 'Loc',
    none: (range: string) =>
      `Niciun contract semnat în perioada ${range} nu apare în anunțurile de atribuire preluate.`,
    export: 'Exportă CSV',
  },

  partners: {
    institutions: {
      title: 'Furnizori la achiziții directe, după valoare',
      none: 'Nicio achiziție acceptată în această perioadă.',
    },
    suppliers: {
      title: 'Instituții cărora le-a vândut direct, după valoare',
      none: 'Nicio vânzare acceptată în această perioadă.',
    },
    accepted: (n: number, text: string) =>
      counted(n, text, 'o achiziție acceptată', 'achiziții acceptate'),
  },

  purchases: {
    title: 'Achiziții directe',
    titleAccepted: 'Achiziții directe acceptate',
    heading: (title: string, total: string) => `${title} (${total})`,
    newest: 'Cele mai recente',
    largest: 'Cele mai mari acceptate',
    date: 'Data',
    purchase: 'Achiziție',
    state: 'Stare',
    value: 'Valoare',
    // SEAP's states in the words a citizen would use, by SEAP's state id.
    states: {
      3: 'Refuzată de furnizor',
      4: 'Fără răspuns de la furnizor',
      6: 'Refuzată de instituție',
      7: 'Ofertă acceptată',
      8: 'Fără răspuns de la instituție',
    } as Record<number, string | undefined>,
    seapLink: '{code} în SEAP',
    notAccepted: 'neacceptată, nu intră în total',
    aboveLimit: 'peste plafon, nu intră în total',
  },

  rankings: {
    title: 'Clasamente',
    intro:
      'Fapte măsurabile, fiecare cu sursa ei. Un loc în clasament arată doar cât s-a contractat, s-a cumpărat sau s-a vândut, nu spune nimic despre corectitudinea achizițiilor.',
    suppliers: 'Furnizori',
    institutions: 'Instituții',
    tabs: {
      contracte: 'Cele mai mari contracte',
      furnizori: 'Furnizori',
      achizitii: 'Achiziții directe',
      institutii: 'Instituții',
    },
    wonAlone: 'Singur',
    wonTogether: 'În asociere',
    wonLabel: 'Cum au fost câștigate contractele',
    // A member's place says what the contracts were worth, not what the member received.
    associationNote:
      'Un contract câștigat în asociere apare la fiecare membru, cu valoarea întreagă.',
    bySuppliers: 'Furnizori, după valoarea contractelor câștigate',
    byInstitutions: 'Instituții, după valoarea contractelor atribuite',
    directIntro: 'După valoarea achizițiilor directe acceptate.',
    none: 'Niciun contract semnat în această perioadă nu apare în anunțurile preluate.',
  },

  notes: {
    period: (days: string) =>
      `Achiziții directe finalizate în perioada ${days}. Sumele sunt fără TVA.`,
    // Stated as what SEAP publishes, never as an error or a breach.
    aboveLimit: (n: number, text: string, limit: string, value: string) =>
      `${plural(n, {
        one: 'O achiziție acceptată este publicată',
        few: `${text} achiziții acceptate sunt publicate`,
        other: `${text} de achiziții acceptate sunt publicate`,
      })} în SEAP cu o valoare peste ${limit}, plafonul legal cel mai mare pentru o achiziție directă. ${
        n === 1 ? 'Nu este inclusă' : 'Nu sunt incluse'
      } în total: ${value}. Tipar observat, nu o acuzație.`,
  },

  // The two reasons a value is missing, never mixed (DataState in the design system).
  dataState: {
    notPublished: 'Nepublicat',
    notCollected: 'Încă necolectat',
    explain:
      '{notPublished} înseamnă că sursa nu dă informația. {notCollected} înseamnă că sursa există, dar nu am preluat-o încă.',
  },

  notice: {
    fallbackTitle: 'Anunț de atribuire',
    kind: 'Anunț de atribuire',
    typeAndCpv: (type: string, cpv: string) => `${type} · CPV ${cpv}`,
    contractsBadge: (n: number, text: string) =>
      counted(n, text, 'un contract', 'contracte'),
    buyer: 'Autoritate contractantă',
    published: 'Publicat',
    firstPublished: 'Publicat prima dată',
    lastPublished: 'Republicat ultima dată',
    heldVersion: 'versiunea pe care o avem',
    callNotice: 'Anunț de participare',
    latestVersion:
      'SEAP republică anunțul când se adaugă sau se modifică un contract; arătăm ultima versiune',
    contractsIn: 'Contracte în anunț',
    ordinary: (n: number, text: string) =>
      counted(n, text, 'un contract obișnuit', 'contracte obișnuite'),
    frameworks: (n: number, text: string) =>
      counted(n, text, 'un acord-cadru', 'acorduri-cadru'),
    subsequent: (n: number, text: string) =>
      counted(n, text, 'un contract subsecvent', 'contracte subsecvente'),
    contractsBreakdown: (total: string, parts: string) => `${total} · ${parts}`,
    offers: 'Oferte primite',
    financing: 'Finanțare',
    contractsTitle: 'Contractele din anunț',
    total: 'Total atribuit {value} · contracte obișnuite și subsecvente',
    contract: 'Contract',
    winner: 'Câștigător',
    value: 'Valoare fără TVA',
    date: 'Data',
    contractNo: (number: string) => `Contract ${number}`,
    kinds: {
      1: 'contract obișnuit',
      2: 'acord-cadru',
      3: 'contract subsecvent acordului-cadru',
    } as Record<number, string | undefined>,
    ceiling: 'Acord-cadru · plafon · nu intră în total',
    notCounted: 'Nu intră în total',
    foreign: (amount: string, currency: string) => `${amount} ${currency}`,
    noLei: 'SEAP nu dă valoarea în lei',
    association: (members: string) => `Asociere · ${members} membri`,
    moreMembers: (n: number, text: string) =>
      plural(n, {
        one: '+ încă un membru',
        few: `+ încă ${text} membri`,
        other: `+ încă ${text} de membri`,
      }),
    empty:
      'SEAP nu listează niciun contract pentru acest anunț. De obicei, procedura a fost anulată.',
    whyTitle: 'De ce totalul nu e suma rândurilor.',
    whyFramework:
      'Un acord-cadru arată doar plafonul maxim, nu bani cheltuiți; banii apar în contractele subsecvente, pe care le numărăm.',
    whyAssociation:
      'Când câștigă o asociere, SEAP dă o singură valoare pentru tot contractul și nu spune care membru e lider. Arătăm valoarea o dată, pe rândul contractului, cu membrii în ordinea din SEAP.',
    notPublicTitle: 'Ce nu este public',
    notPublic: [
      'Contractele și actele adiționale',
      'Numărul de oferte primite',
      'Ordinele de plată',
      'Lista subcontractorilor',
      'Procesele-verbale de recepție',
    ],
  },

  purchase: {
    fallbackTitle: 'Achiziție directă',
    kind: 'Achiziție directă',
    buyer: 'Cumpărător',
    supplier: 'Furnizor',
    value: 'Valoare',
    valueWithoutVat: (amount: string) => `${amount} fără TVA`,
    state: 'Stare',
    date: 'Data achiziției',
    payment: 'Condiții de plată',
    delivery: 'Livrare',
    notAccepted: 'Neacceptată · nu intră în total',
    aboveLimit: 'Peste plafon · nu intră în total',
    bought: 'Ce s-a cumpărat',
    boughtNotCollected:
      'Produsele și serviciile din această achiziție, cu cantități și prețuri, sunt publicate în SEAP. Nu le-am preluat încă.',
    whatTitle: 'Ce e o achiziție directă.',
    what: 'O cumpărare mică, fără licitație, făcută din catalogul SEAP, sub pragul legal pentru tipul ei de contract. Nu există oferte concurente de comparat.',
    samePair: 'Același furnizor, același cumpărător',
    samePairFigure: (n: number, text: string, value: string, days: string) =>
      `${counted(n, text, 'o achiziție directă acceptată', 'achiziții directe acceptate')} · ${value} · ${days}`,
  },
}
