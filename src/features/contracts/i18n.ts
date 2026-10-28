import { counted } from '#/i18n/ro-plural'

const contracts = (n: number, text: string) =>
  counted(n, text, 'un contract', 'contracte')

// The contracts of an institution or a company in the list pattern (DataTable).
export const contractList = {
  searchWhat: {
    institutions: 'obiect, câștigător, nr. anunț',
    suppliers: 'obiect, instituție, nr. anunț',
  },
  filters: {
    q: 'Căutare',
    perioada: 'Perioada',
    valoare: 'Valoare',
    furnizor: 'Câștigător',
    institutie: 'Instituție',
    cpv: 'CPV',
    fel: 'Fel',
    ue: 'Fonduri UE',
    castig: 'Câștigat',
  },
  kinds: {
    1: 'Contract',
    3: 'Contract subsecvent',
  } as Record<number, string | undefined>,
  eu: {
    1: 'Cu fonduri UE',
    0: 'Fără fonduri UE',
  } as Record<number, string | undefined>,
  won: { alone: 'singur', association: 'în asociere' },
  valuePresets: {
    small: 'Sub 100.000 lei',
    middle: '100.000–1.000.000 lei',
    large: '1.000.000 lei sau mai mult',
  },
  contracts,
  // "3 contracte câștigate singur", for a company's list.
  wonContracts: (n: number, text: string, how: 'alone' | 'association') =>
    `${contracts(n, text)} ${n === 1 ? 'câștigat' : 'câștigate'} ${
      how === 'alone' ? 'singur' : 'în asociere'
    }`,
  value: (value: string) => `${value} fără TVA`,
  withoutValue: (n: number, text: string) =>
    `${contracts(n, text)} fără valoare în lei`,
  of: (whole: string, range: string | null) =>
    `din ${whole} semnate${range ? ` în ${range}` : ''}; SEAP publică multe contracte la săptămâni după semnare`,
  // A company's contracts won with others: one value each, never split between members.
  wholeValue: 'valoarea întreagă a fiecărui contract, neîmpărțită între membri',
  none: {
    alone: (range: string) =>
      `Niciun contract câștigat singur, semnat în perioada ${range}, nu apare în anunțurile de atribuire preluate.`,
    association: (range: string) =>
      `Niciun contract câștigat în asociere, semnat în perioada ${range}, nu apare în anunțurile de atribuire preluate.`,
  },
  total: (n: number, text: string) =>
    `Total pentru filtrele alese · ${contracts(n, text)}`,
  timeTitle: {
    month: 'Valoare pe luni',
    day: 'Valoare pe zile',
  },
  timeUnit: 'lei fără TVA, contracte semnate în perioadă',
  partiesTitle: {
    supplier: 'Cei mai mari câștigători',
    buyer: 'Cele mai mari instituții',
  },
  partiesUnit: {
    supplier: 'lei fără TVA, contracte câștigate singur',
    buyer: 'lei fără TVA, aceleași filtre',
  },
  // The bar of the contracts won by associations, beside the winners, never added to one.
  associations: (n: number, text: string) =>
    `În asociere · ${contracts(n, text)}`,
}
