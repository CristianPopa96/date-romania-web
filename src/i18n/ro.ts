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
    footerApi: 'API',
  },

  nav: {
    label: 'Secțiuni',
    rankings: 'Clasamente',
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
    complete: 'completă',
    incomplete: 'contracte semnate în perioadă · listă incompletă',
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
