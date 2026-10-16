// The Romanian text of the rankings page. Part of `ro` (see ro.ts for the rules).

import { counted } from '#/i18n/ro-plural'

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
  wonLabel: 'Cum au fost câștigate contractele',
  // A member's place says what the contracts were worth, not what the member received.
  associationNote:
    'Un contract câștigat în asociere apare la fiecare membru, cu valoarea întreagă.',
  bySuppliers: 'Furnizori, după valoarea contractelor câștigate',
  byInstitutions: 'Instituții, după valoarea contractelor atribuite',
  directIntro: 'După valoarea achizițiilor directe acceptate.',
  none: 'Niciun contract semnat în această perioadă nu apare în anunțurile preluate.',
  noneFiltered: 'Nimic nu se potrivește cu filtrele alese.',

  // The filters above every ranking. A trigger names its field: "CPV: toate".
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
      'Anul, județul și tipul instituției nu pot fi alese încă: avem o singură perioadă, iar județul și tipul instituției vin din datele ANAF, pe care nu le-am preluat.',
  },

  // The patterns tab. A pattern is a fact worth asking documents for, never an accusation.
  patterns: {
    intro:
      'Un tipar nu înseamnă o neregulă: e un loc unde merită cerute documentele. Fiecare rând spune ce am măsurat, cu cifrele și sursa lor.',
    observed: 'Tipar observat, nu o acuzație.',
    nearLimit: {
      title: 'Achiziții directe repetate chiar sub plafon',
      rule: (repeats: string, from: string, goods: string, works: string) =>
        `Același cumpărător și același furnizor, cel puțin ${repeats} achiziții directe acceptate, fiecare de la ${from} din plafonul legal al tipului ei până la plafon: ${goods} pentru produse și servicii, ${works} pentru lucrări.`,
      meaning:
        'Ce arată: valori apropiate de plafon, fără să-l depășească. Ce nu arată: că o achiziție a fost împărțită ca să rămână sub plafon. Asta se poate afla doar din documente.',
      annex2:
        'Serviciile din anexa 2 a legii, de exemplu hotelurile și serviciile sociale, au un plafon mai mare. Nu le deosebim încă, așa că o pereche de servicii poate fi departe de plafonul ei.',
      unknownType: (n: number, text: string) =>
        `${counted(n, text, 'O achiziție acceptată nu are', 'achiziții acceptate nu au')} tipul contractului în datele SEAP preluate și nu ${n === 1 ? 'e verificată' : 'sunt verificate'}.`,
      pairs: (n: number, text: string) =>
        `${counted(n, text, 'O pereche', 'perechi')} cumpărător–furnizor`,
      shown: (shown: string, all: string) =>
        `Arătăm primele ${shown} din ${all}.`,
      none: 'Nicio pereche nu se potrivește cu ce ai ales.',
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
        reason: 'Starea firmei și data înființării vin de la ANAF.',
        notCollected: true,
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
      {
        title: 'Valoarea contractului departe de valoarea proiectului',
        reason:
          'În programul Anghel Saligny, legătura dintre plată și contract e doar probabilă. Raportul e pe pagina fiecărui proiect.',
      },
    ],
  },
}
