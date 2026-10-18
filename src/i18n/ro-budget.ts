// The Romanian text of an institution's budget (flow 1, design round 8). Part of `ro`
// (see ro.ts for the rules).

import { counted } from '#/i18n/ro-plural'

export const budget = {
  title: 'Buget',
  revenue: (year: string) => `Venituri · ${year}`,
  spending: (year: string) => `Cheltuieli · ${year}`,
  executed: (day: string) => `executat la ${day}`,
  // Revenue lines in the order the design sets; they add up to the total.
  lines: {
    state_subsidies: 'Subvenții de la bugetul de stat',
    income_tax: 'Cote din impozitul pe venit',
    vat: 'Sume din TVA',
    own_revenue: 'Venituri proprii',
    eu_funds: 'Fonduri europene',
    other_administrations: 'Subvenții de la alte administrații',
    other: 'Alte venituri',
  },
  revenueTotal: (total: string) => `Venituri totale: ${total}`,
  capital: 'Cheltuieli de capital',
  capitalOf: (total: string) => `investiții, din totalul de ${total}`,
  chapters: {
    general_services: 'Autorități publice și servicii generale',
    defence_order: 'Ordine publică și siguranță',
    education: 'Învățământ',
    health: 'Sănătate',
    culture: 'Cultură, recreere și religie',
    social: 'Asigurări și asistență socială',
    housing: 'Locuințe, servicii și dezvoltare publică',
    environment: 'Protecția mediului',
    economic_affairs: 'Acțiuni economice generale',
    energy: 'Combustibili și energie',
    agriculture: 'Agricultură și silvicultură',
    transport: 'Transporturi',
    other_economic: 'Alte acțiuni economice',
  },
  // Why there is no budget: an institution that is not a town hall or a county council,
  // or one that is, whose budget we do not hold yet.
  notHeld: {
    other:
      'Avem bugetele primăriilor și ale consiliilor județene. Bugetul celorlalte instituții e publicat de Ministerul Finanțelor, dar nu îl putem prelua încă.',
    townHall: 'Bugetul acestei primării nu e preluat încă.',
    county: 'Bugetul acestui consiliu județean nu e preluat încă.',
  },
  payments: {
    townHall: 'Plăți Anghel Saligny către primărie',
    county: 'Plăți Anghel Saligny către consiliul județean',
    detail: (
      payments: number,
      paymentsText: string,
      projects: number,
      projectsText: string,
    ) =>
      `${counted(payments, paymentsText, 'o plată', 'plăți')} · ${counted(projects, projectsText, 'un proiect', 'proiecte')}`,
    projects: 'vezi proiectele',
    why: (year: string) =>
      `Nu le adunăm cu subvențiile din ${year}: perioadele sunt diferite, iar fișierul bugetului nu spune din ce program vine fiecare subvenție.`,
  },
  funder: 'subordonată {funder}',
  county: (name: string) => `jud. ${name}`,
  coverage: 'Date disponibile:',
  coverageSeap: 'SEAP',
  coverageBudget: (year: string) => `Buget ${year}`,
  coverageProgramme: 'Anghel Saligny',
}
