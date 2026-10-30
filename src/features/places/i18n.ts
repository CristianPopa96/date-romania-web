// The Romanian text of the locality and county pages (flow 6, design round 8). Part of
// `ro` (see ro.ts for the rules).

import { counted } from '#/i18n/ro-plural'

export const places = {
  title: 'Localități',
  intro:
    'Alege un județ ca să vezi localitățile lui: bugetul primăriilor, contractele instituțiilor de acolo și plățile din programul Anghel Saligny.',
  county: 'Județ',
  uats: 'Localități',
  people: 'Locuitori',
  uatsCount: (n: number, text: string) =>
    counted(n, text, 'o localitate', 'localități'),
  kinds: {
    county: 'Județ',
    municipality: 'Municipiu',
    town: 'Oraș',
    commune: 'Comună',
    sector: 'Sector',
  },
  eyebrowCounty: (county: string) => `jud. ${county}`,
  peopleOn: (people: string, year: string) =>
    `${people} locuitori la 1 ianuarie ${year}`,
  lead: 'Ce știm despre banii publici de aici: bugetul primăriei, contractele instituțiilor de aici și plățile din programul Anghel Saligny. Fiecare cifră are perioada ei; nu le adunăm.',
  leadCounty:
    'Ce știm despre banii publici din județ: bugetele primăriilor și al consiliului județean, contractele instituțiilor de aici și plățile din programul Anghel Saligny. Fiecare cifră are perioada ei; nu le adunăm.',
  village: (village: string, uat: string) =>
    `Localitatea ${village} face parte din ${uat}.`,
  sectors: 'Sectoarele',
  council: 'Consiliul județean',

  // The four overview figures, each with its own period, never added.
  figures: {
    payments: 'Plăți Anghel Saligny către primărie',
    paymentsCounty: 'Plăți Anghel Saligny în județ',
    paymentsSectors: 'Plăți Anghel Saligny, primăria și sectoarele',
    paymentsMissing: 'PNDL: încă necolectat',
    noPayments: 'nicio plată în fișierele programului',
    capital: 'Cheltuieli de capital ale primăriei',
    capitalCounty: 'Cheltuieli de capital, primării și consiliul județean',
    capitalDetail: (year: string) => `${year}, executat · MDLPA`,
    contracts: 'Contracte SEAP, toți cumpărătorii',
    contractsBuyers: (n: number, text: string) =>
      counted(n, text, 'o instituție de aici', 'instituții de aici'),
    local: 'Furnizori din județ',
    localDetail: 'din valoarea contractelor din aceeași perioadă',
    mixed: (share: string) =>
      `asocieri cu membri din mai multe județe: ${share}, numărate separat`,
    noContracts: 'niciun contract semnat în perioadă',
  },

  budgetCard: (year: string) => `Bugetul primăriei · ${year}`,
  budgetMore: 'Vezi bugetul complet al primăriei',
  winners: 'Cine primește contractele',
  winnersNote: 'toți cumpărătorii de aici',
  association: (n: number, text: string) =>
    `Asociere · ${counted(n, text, 'un membru', 'membri')}`,
  noCounty: 'județ necunoscut',

  projects: 'Proiecte în zonă',
  // Under the list: what it holds, what it does not yet, and the town hall's own.
  projectsLead:
    'Un proiect e aici când plata Anghel Saligny e pentru această localitate sau când ANAF își înregistrează beneficiarul aici. Proiectele PNDL: {notCollected}',
  ownProjects: (name: string) => `Proiectele în care ${name} e beneficiar`,
  project: 'Proiect',
  builder: 'Constructor',
  progress: 'Progres, cum îl scrie primăria',
  paid: 'Plătit',
  contract: 'Contract SEAP',

  payments: 'Plăți ale primăriei',
  paymentsTitle: 'Nu avem plățile primăriei.',
  paymentsBody:
    'Vedem cât s-a cheltuit și ce contracte s-au semnat, dar nu cui s-a plătit efectiv. Plățile unei primării pot fi cerute prin Legea 544/2001.',

  institutions: 'Instituții din localitate',
  institutionsNone: 'Nicio instituție de aici nu apare în datele preluate.',
  institution: 'Instituție',
  contractsIn: (range: string) => `Contracte ${range}`,
  contractsHeader: 'Contracte',
  capitalHeader: 'Cheltuieli de capital',
  capitalIn: (year: string) => `Cheltuieli de capital ${year}`,
  townHall: 'primărie',
  noneSigned: 'niciun contract',

  uatTable: 'Localitățile județului',
}
