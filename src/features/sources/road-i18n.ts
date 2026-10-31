// The Romanian text of the "Drumul datelor" tab on /surse. Part of `ro` (see ro.ts for the
// rules). Each step says in plain words what happens; `tech` names, one layer below, the
// tables, files and rules a technical reader can check in the code.

import { counted } from '#/i18n/ro-plural'

export const road = {
  tab: 'Drumul datelor',
  title: 'De la sursa publică la pagina de pe site',
  lead: 'Ce se întâmplă cu fiecare răspuns pe care îl primim de la o sursă publică: îl păstrăm așa cum a venit, îl citim, îl legăm de restul datelor și abia apoi îl arătăm. Cifrele de mai jos sunt cele de acum.',
  lanes: 'Urmărește o sursă',
  all: 'Toate',
  lane: {
    seap: 'SEAP',
    anghelSaligny: 'Anghel Saligny',
    pnrr: 'PNRR',
    eu: 'Fonduri europene',
    register: 'Firme și localități',
  },
  techSwitch: 'Arată detaliile tehnice',

  steps: {
    sources: {
      title: 'Surse publice',
      text: 'Instituțiile publică datele pe site-urile lor. Le citim la ore fixe, fără să trimitem cereri mai repede decât e politicos.',
      tech: 'Programul fiecărei colectări e în infra/crontab; o zi ratată se recuperează la următoarea pornire.',
      count: (n: number, text: string) => counted(n, text, 'o sursă', 'surse'),
    },
    kept: {
      title: 'Păstrăm originalul',
      text: 'Fiecare răspuns e păstrat neschimbat, cu amprenta lui, înainte de a fi citit. Așa putem arăta oricând de unde vine o cifră și o putem citi din nou dacă am greșit ceva.',
      tech: 'Stocare S3, cheia fiecărui fișier e amprenta lui SHA-256; un rând în source_document pentru fiecare. Copia nu este publică.',
      count: (n: number, text: string) =>
        counted(n, text, 'un răspuns', 'răspunsuri'),
      size: (gigabytes: string) => `${gigabytes} GB`,
    },
    read: {
      title: 'Citim',
      text: 'Scoatem din fiecare răspuns ce ne trebuie: achiziții, contracte, plăți, proiecte, firme, localități. Un rând pe care nu îl putem citi e notat și lăsat deoparte, nu ghicit.',
      tech: 'Un cititor (parser) cu versiune pentru fiecare sursă; fiecare rând păstrează documentul din care vine.',
      count: (n: number, text: string) =>
        counted(n, text, 'un rând citit', 'rânduri citite'),
      rejected: (n: number, text: string) =>
        `${counted(n, text, 'un rând necitit', 'rânduri necitite')}, notate`,
      skipped:
        'Persoanele fizice din Registrul Comerțului nu sunt citite deloc.',
    },
    linked: {
      title: 'Legăm',
      text: 'Sursele nu au un cod comun. Le legăm noi, după reguli scrise o singură dată, și spunem la fiecare legătură cât de sigură e.',
      tech: 'Fiecare legătură păstrează metoda și gradul de încredere.',
      sure: 'sigure',
      probable: 'probabile',
      possible: 'posibile',
      facts: (count: string) => count,
    },
    shown: {
      title: 'Pe site',
      text: 'Paginile arată doar ce am citit și legat, cu sursa fiecărei cifre. Unde un pas lipsește, pagina spune ce lipsește.',
      tech: 'API-ul public, doar pentru citire; site-ul îl întreabă din server.',
      projects: (n: number, text: string) =>
        counted(n, text, 'un proiect', 'proiecte'),
      entities: (n: number, text: string) =>
        counted(n, text, 'o instituție sau firmă', 'instituții și firme'),
    },
  },

  // What each table holds, in plain words.
  tables: {
    direct_purchase: 'achiziții directe',
    direct_purchase_detail: 'achiziții directe cu produsele și condițiile lor',
    award_notice: 'anunțuri de atribuire',
    award_contract: 'contracte din anunțuri',
    pnias_payment: 'plăți Anghel Saligny',
    export_contract: 'contracte ale constructorilor, din exporturile SEAP',
    pnrr_contract: 'contracte de finanțare PNRR',
    pnrr_payment: 'plăți PNRR',
    eu_project: 'proiecte cu fonduri de coeziune',
    eu_project_payment: 'plăți din Programul Sănătate',
    place: 'județe, localități și sate',
    public_entity: 'instituții publice, cu finanțatorul lor',
    local_budget: 'linii din bugetele primăriilor',
    anaf_record: 'răspunsuri ANAF despre sediu',
    register_company: 'firme din Registrul Comerțului',
  } as Record<string, string | undefined>,

  // What each rule ties, in plain words.
  rules: {
    'eu-beneficiary': 'proiect european → beneficiarul lui',
    'anghel-saligny-contract': 'plată Anghel Saligny → contractul din SEAP',
    'eu-seap':
      'anunț sau achiziție din SEAP → proiectul european pe care îl citează',
    'pnrr-payment-contract': 'plată PNRR → contractul de finanțare',
    'entity-place': 'instituție sau firmă → localitatea ei',
  } as Record<string, string | undefined>,
  // A rule that records a fact, with no degree of confidence.
  factNote: {
    'pnrr-payment-contract':
      'doar când beneficiarul are un singur contract pe acea măsură',
    'entity-place':
      'din lista Ministerului Finanțelor, Registrul Comerțului sau ANAF',
  } as Record<string, string | undefined>,

  pages: {
    projects: 'Proiecte',
    rankings: 'Clasamente',
    entities: 'Pagini de instituții și firme',
    places: 'Localități',
    records: 'Anunțuri și achiziții',
  },
  reach: {
    beneficiary: 'până la beneficiar',
    payments: 'până la plăți',
    purchases: 'până la achiziții',
    companies: 'până la firmele plătite',
  } as Record<string, string | undefined>,
  reachTitle: 'Cât de departe urmărim banii unui proiect',
}
