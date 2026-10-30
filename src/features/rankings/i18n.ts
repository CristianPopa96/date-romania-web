// The Romanian text of the rankings page. Part of `ro` (see ro.ts for the rules).

import { counted, plural } from '#/i18n/ro-plural'
import type { Role } from '#/lib/api'

export const rankings = {
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
    tipare: 'Tipare',
  },
  wonAlone: 'Singur',
  wonTogether: 'În asociere',
  // A member's place says what the contracts were worth, not what the member received.
  associationNote:
    'Un contract câștigat în asociere apare la fiecare membru, cu valoarea întreagă.',
  none: 'Niciun contract semnat în această perioadă nu apare în anunțurile preluate.',
  noneFiltered: 'Nimic nu se potrivește cu filtrele alese.',

  // The filters above the largest contracts. A trigger names its field: "CPV: toate".
  filters: {
    label: 'Filtre',
    field: (name: string, value: string) => `${name}: ${value}`,
    all: 'toate',
    cpv: 'CPV',
    eu: 'Fonduri UE',
    euYes: 'da',
    euNo: 'nu',
    // Only award notices say how they are paid for, and not all of them do.
    euNote:
      'Fonduri UE după anunțul de atribuire: „da” dacă un lot e plătit din fonduri europene. Un anunț care nu spune cum e plătit apare doar la „toate”.',
    missing:
      'Anul, județul și tipul instituției nu pot fi alese încă: avem o singură perioadă, filtrul după județ nu e construit încă, iar tipul instituției nu îl avem.',
  },

  // A ranking as a list (DataTable): parties, a page at a time, in any column's order.
  list: {
    titles: {
      'contract-suppliers': 'Furnizori, după contractele câștigate',
      'contract-institutions': 'Instituții, după contractele atribuite',
      suppliers: 'Furnizori, după achizițiile directe',
      institutions: 'Instituții, după achizițiile directe',
    },
    searchWhat: 'nume sau CUI',
    filters: {
      q: 'Căutare',
      castigate: 'Câștigat',
      parte: 'Clasament',
      perioada: 'Perioada',
      cpv: 'CPV',
      ue: 'Fonduri UE',
    },
    place: 'Loc',
    name: 'Nume',
    value: 'Valoare',
    contracts: 'Contracte',
    purchases: 'Achiziții',
    cui: (cui: string) => `CUI ${cui}`,
    parties: (role: Role, n: number, text: string) =>
      role === 'suppliers'
        ? `${counted(n, text, 'un furnizor', 'furnizori')} în clasament`
        : `${counted(n, text, 'o instituție', 'instituții')} în clasament`,
    // What the places count, in the order chosen.
    order: {
      value: (contracts: boolean) =>
        contracts
          ? 'locul după valoarea contractelor semnate în perioada pe care o avem'
          : 'locul după valoarea achizițiilor directe acceptate, fără TVA',
      count: (contracts: boolean) =>
        contracts
          ? 'locul după numărul de contracte semnate în perioada pe care o avem'
          : 'locul după numărul de achiziții directe acceptate',
    },
    topTitle: 'Primii 10 și ceilalți',
    topTitleSearch: 'Primii 10 și ceilalți, din cei găsiți',
    topTitleAssociation: 'Primii 10',
    topHintBars: 'clic pe o bară deschide pagina',
    topUnit: 'lei, aceleași filtre',
    topHint: 'clic pe o casetă deschide pagina',
    // The tile of every party after the ten largest, added up.
    rest: (role: Role, n: number, text: string) =>
      role === 'suppliers'
        ? plural(n, {
            one: 'Încă un furnizor',
            few: `Alți ${text} furnizori`,
            other: `Alți ${text} de furnizori`,
          })
        : plural(n, {
            one: 'Încă o instituție',
            few: `Alte ${text} instituții`,
            other: `Alte ${text} de instituții`,
          }),
  },

  // The patterns tab. A pattern is a fact worth asking documents for, never an accusation.
  patterns: {
    intro:
      'Un tipar nu înseamnă o neregulă: e un loc unde merită cerute documentele. Fiecare rând spune ce am măsurat, cu cifrele și sursa lor.',
    observed: 'Tipar observat, nu o acuzație.',
    nearLimit: {
      title: 'Achiziții directe repetate chiar sub plafon',
      rule: (repeats: string, from: string, goods: string, works: string) =>
        `Același cumpărător și același furnizor, cel puțin ${repeats} achiziții directe acceptate, fiecare de la ${from} din plafonul legal al tipului ei până chiar sub plafon (${goods} pentru produse și servicii, ${works} pentru lucrări), oricând în perioada verificată.`,
      meaning:
        'Ce arată: valori apropiate de plafon, fără să-l depășească. Ce nu arată: că o achiziție a fost împărțită ca să rămână sub plafon. Asta se poate afla doar din documente.',
      // Annex 2 of Law 98/2016, told by CPV code: no direct purchase limit to be near.
      annex2: (n: number, text: string) =>
        `Serviciile din anexa 2 a Legii 98/2016 (sănătate, servicii sociale, învățământ, cultură, hoteluri și restaurante și altele) nu au plafon pentru achiziția directă, așa că nu sunt verificate: ${counted(n, text, 'o achiziție acceptată', 'achiziții acceptate')}.`,
      // "verificat: X din Y". The type is missing mostly on quiet days, when SEAP's list
      // did not have to be asked by type.
      checked: (checked: string, n: number, total: string) =>
        `Verificat: ${checked} din ${counted(n, total, 'o achiziție directă acceptată', 'achiziții directe acceptate')}.`,
      unknownType: (n: number, text: string) =>
        `${n === 1 ? 'Una nu are' : `${text} nu au`} tipul contractului în datele SEAP preluate, mai ales în zilele cu puține achiziții, și nu ${n === 1 ? 'poate fi verificată' : 'pot fi verificate'}.`,
      checkedPeriod: (days: string) =>
        `Achizițiile verificate sunt finalizate în perioada ${days}. Sumele sunt fără TVA.`,
      filters: { cpv: 'CPV', tip: 'Tip contract' },
      pairs: (n: number, text: string) =>
        `${counted(n, text, 'O pereche', 'perechi')} cumpărător–furnizor`,
      buyer: 'Cumpărător',
      supplier: 'Furnizor',
      purchases: 'Achiziții',
      value: 'Valoare',
      types: { 1: 'produse', 2: 'servicii', 3: 'lucrări' },
      fact: (n: number, text: string, type: string, limit: string) =>
        `${counted(n, text, 'o achiziție', 'achiziții')} de ${type} sub plafonul de ${limit}`,
      ofLimit: (share: string) => `${share} din plafon`,
    },
    // The patterns of flow 5 the data held cannot give yet, each with its reason.
    laterTitle: 'Tipare pe care nu le putem arăta încă',
    later: [
      {
        title: 'Furnizor inactiv la ANAF sau înființat de curând',
        reason:
          'Starea firmei o avem de la ANAF; data înființării o dă tot ANAF și urmează să o citim. Tiparul nu e construit încă.',
      },
      {
        title:
          'Furnizor la care banii publici sunt cea mai mare parte din cifra de afaceri',
        reason: 'Cifra de afaceri vine din bilanțurile publicate de ANAF.',
        notCollected: true,
      },
      {
        title: 'Proceduri cu o singură ofertă',
        reason: 'Nu am găsit încă numărul de oferte în datele SEAP.',
      },
    ],
    // Kept out of the rankings (the tie between a payment and a contract is only probable),
    // but shown on each project's page.
    elsewhere: {
      title: 'Valoarea contractului față de valoarea proiectului',
      text: 'Nu e un clasament, pentru că legătura dintre plată și contract e doar probabilă. O vezi pe pagina fiecărui proiect din {programme}.',
      programme: 'programul Anghel Saligny',
    },
  },
}
