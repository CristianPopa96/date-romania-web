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
    rankings: 'Clasamente',
  },

  notFound: {
    title: 'Pagina nu există',
    hint: 'Verifică adresa sau caută instituția ori firma după nume sau CUI.',
  },

  source: {
    line: (parts: string) => `Sursa: ${parts}`,
    fetched: (day: string) => `preluat ${day}`,
    open: 'Vezi la sursă',
  },

  home: {
    directPurchases: 'Achiziții directe',
    acceptedValue: 'Valoare acceptată',
    acceptedPurchases: 'Achiziții acceptate',
    institutions: 'Instituții',
    suppliers: 'Furnizori',
    seeRankings: 'Vezi clasamentele',
    systemStatus: 'Starea sistemului',
    systemStatusHint: 'Legătura dintre site, API și baza de date',
    apiUp: (version: string, database: string) =>
      `API ${version} · bază de date ${database}`,
    apiDown: 'API indisponibil',
  },

  search: {
    title: 'Căutare',
    placeholder: 'Caută o instituție, o firmă sau un CUI',
    tooShort: 'Scrie cel puțin două litere sau cifre.',
    none: (q: string) =>
      `Niciun rezultat pentru „${q}”. Căutăm doar printre instituțiile și firmele care apar în achizițiile directe preluate până acum.`,
    found: (n: number, text: string, q: string) =>
      `${counted(n, text, 'Un rezultat', 'rezultate')} pentru „${q}”`,
  },

  entity: {
    acceptedValue: 'Valoarea achizițiilor directe acceptate',
    accepted: 'Achiziții acceptate',
    finalized: 'Achiziții finalizate, cu orice rezultat',
  },

  partners: {
    institutions: {
      title: 'Furnizori, după valoare',
      none: 'Nicio achiziție acceptată în această perioadă.',
    },
    suppliers: {
      title: 'Instituții cărora le-a vândut, după valoare',
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
      'După valoarea achizițiilor directe acceptate. Un loc în clasament arată doar cât s-a cumpărat sau s-a vândut, nu spune nimic despre corectitudinea achizițiilor.',
    suppliers: 'Furnizori',
    institutions: 'Instituții',
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
}
