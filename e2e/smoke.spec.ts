import { expect, test } from '@playwright/test'

// Smoke tests: each page opens in a real browser and shows the figures the API gave.
// The data is the handful of records in e2e/stub/answers.json: one town hall, one
// hospital, two suppliers, one refused offer, one purchase above the legal limit, and
// three award notices with five contracts between them.

const TOWN_HALL = 'Comuna Țânțăreni (Primăria Țânțăreni)'

test('the home page shows the totals, their period and their source', async ({
  page,
}) => {
  await page.goto('/')

  await expect(page).toHaveTitle('Date România')
  const main = page.getByRole('main')
  await expect(
    main.getByRole('heading', {
      name: 'Urmărește banii publici, de la buget la contract.',
    }),
  ).toBeVisible()
  await expect(main.getByText('4.200 lei').first()).toBeVisible()
  await expect(main.getByText('05.10.2026 – 07.10.2026')).toBeVisible()
  // The purchase above the limit is told apart, as a fact and not as an accusation.
  await expect(
    main.getByText('Nu este inclusă în total: 5.000.000 lei'),
  ).toBeVisible()
  await expect(main.getByText('Tipar observat, nu o acuzație')).toBeVisible()
  await expect(main.getByText('Sursa: SEAP · preluat 07.10.2026')).toBeVisible()
})

test('the home page says what data the site is built on', async ({ page }) => {
  await page.goto('/')
  const main = page.getByRole('main')

  await expect(
    main.getByRole('heading', { name: 'Ce date avem' }),
  ).toBeVisible()
  const direct = main.getByRole('row').filter({ hasText: 'achiziții directe' })
  await expect(direct).toContainText('SEAP · achiziții directe')
  await expect(direct).toContainText('05.10–07.10.2026')
  await expect(direct).toContainText('completă')
  await expect(direct).toContainText('07.10.2026')
  // Notices are held in full; the contracts of the period in them never are.
  const awards = main
    .getByRole('row')
    .filter({ hasText: 'anunțuri de atribuire' })
  await expect(awards).toContainText('listă incompletă')
  // How the site itself is doing is not something a reader came for.
  await expect(main.getByText('Starea sistemului')).toHaveCount(0)
})

test('the top bar lists only what exists, and searches from every page but home', async ({
  page,
}) => {
  await page.goto('/')
  const bar = page.getByRole('navigation', { name: 'Secțiuni' })
  await expect(bar.getByRole('link')).toHaveCount(3)
  // In the order of the design, which does not change as sections join.
  await expect(bar.getByRole('link')).toHaveText([
    'Clasamente',
    'Programe',
    'Surse',
  ])
  await expect(bar.getByRole('link', { name: 'Programe' })).toBeVisible()
  await expect(bar.getByRole('link', { name: 'Surse' })).toBeVisible()
  await expect(bar.getByRole('link', { name: 'Clasamente' })).toBeVisible()
  // On the home page the large search box is the page.
  await expect(page.getByRole('textbox', { name: 'Caută' })).toHaveCount(1)
  await expect(page.getByRole('link', { name: 'Caută' })).toHaveCount(0)

  await bar.getByRole('link', { name: 'Clasamente' }).click()
  await expect(bar.getByRole('link', { name: 'Clasamente' })).toHaveAttribute(
    'aria-current',
    'page',
  )
  const compact = page
    .getByRole('banner')
    .getByRole('textbox', { name: 'Caută' })
  await compact.fill('tantareni')
  await compact.press('Enter')
  await expect(page).toHaveURL(/\/cautare\?q=tantareni$/)
  await expect(page.getByText('Un rezultat pentru „tantareni”')).toBeVisible()
})

test('an example on the home page is a search', async ({ page }) => {
  await page.goto('/')
  await expect(
    page.getByRole('main').getByRole('link', { name: 'primăria' }),
  ).toHaveAttribute('href', /\/cautare\?q=prim/)
})

test('a valid CUI opens the page of the institution or of the company', async ({
  page,
}) => {
  await page.goto('/cautare?q=4981310')
  await expect(page).toHaveURL(/\/institutii\/4981310$/)
  await expect(page.getByRole('heading', { name: TOWN_HALL })).toBeVisible()

  await page.goto('/cautare?q=RO17886786')
  await expect(page).toHaveURL(/\/furnizori\/17886786$/)
  await expect(
    page.getByRole('heading', { name: 'ALFA CONSTRUCT S.R.L.' }),
  ).toBeVisible()
})

test('a valid CUI we do not hold stays on the search page', async ({
  page,
}) => {
  await page.goto('/cautare?q=12345674')
  await expect(page).toHaveURL(/\/cautare\?q=12345674$/)
  await expect(
    page.getByText('Niciun rezultat pentru „12345674”'),
  ).toBeVisible()
})

test('search results can be narrowed to one kind', async ({ page }) => {
  await page.goto('/cautare?q=tantareni')
  const main = page.getByRole('main')
  // The page has its own search box, so the top bar does not repeat it.
  await expect(page.getByRole('textbox', { name: 'Caută' })).toHaveCount(1)
  await expect(
    main.getByText(
      'Un CUI valid te duce direct la pagina instituției sau a firmei.',
    ),
  ).toBeVisible()
  await expect(main.getByRole('tab')).toHaveCount(3)
  await expect(main.getByRole('tab', { name: /Instituții/ })).toContainText('1')

  await main.getByRole('tab', { name: /Firme/ }).click()
  await expect(page).toHaveURL(/\/cautare\?q=tantareni&tip=firme$/)
  await expect(main.getByText('Niciun rezultat de acest tip.')).toBeVisible()
  await expect(main.getByRole('link', { name: TOWN_HALL })).toHaveCount(0)
})

test('a search without diacritics finds the town hall and leads to its page', async ({
  page,
}) => {
  await page.goto('/')
  await page.getByRole('textbox', { name: 'Caută' }).fill('tantareni')
  await page.getByRole('button', { name: 'Caută' }).click()

  await expect(page).toHaveURL(/\/cautare\?q=tantareni$/)
  await expect(page).toHaveTitle('Căutare · Date România')
  await expect(page.getByText('Un rezultat pentru „tantareni”')).toBeVisible()

  await page.getByRole('link', { name: TOWN_HALL }).click()

  await expect(page).toHaveURL(/\/institutii\/4981310$/)
  await expect(page.getByRole('heading', { name: TOWN_HALL })).toBeVisible()
})

test('a search with no result says where we looked', async ({ page }) => {
  await page.goto('/cautare?q=zzzz')
  await expect(page.getByText('Niciun rezultat pentru „zzzz”')).toBeVisible()
})

test('an institution page keeps contracts and direct purchases apart', async ({
  page,
}) => {
  await page.goto('/institutii/4981310')

  const main = page.getByRole('main')
  // Two figures, never added. The contract figure says its list is incomplete.
  await expect(main.getByText('6,3 mil. lei')).toHaveCount(2)
  await expect(
    main.getByText('2 contracte · semnate 05.10–07.10.2026 · listă incompletă'),
  ).toHaveCount(2)
  await expect(
    main.getByText('3 achiziții · 05.10–07.10.2026 · completă'),
  ).toBeVisible()
  await expect(main.getByText('Lista contractelor nu e completă.')).toHaveCount(
    1,
  )
  await expect(
    main.getByText('Numărăm contractele semnate între 05.10 și 07.10.2026.'),
  ).toBeVisible()
  // Its budget and its Anghel Saligny payments are held: none is dotted.
  await expect(main.getByText('Încă necolectat', { exact: true })).toHaveCount(
    0,
  )
  await expect(
    main.getByText('Sursa contractelor: SEAP · preluat 07.10.2026'),
  ).toBeVisible()
  await expect(
    main.getByText('Sursa achizițiilor directe: SEAP · preluat 07.10.2026'),
  ).toBeVisible()

  // It opens on its contracts; the framework agreement of the notice is not among them.
  await expect(main.getByRole('tab', { name: /Contracte/ })).toHaveAttribute(
    'aria-selected',
    'true',
  )
  await expect(main.getByRole('row')).toHaveCount(3)
  const together = main.getByRole('row').filter({ hasText: 'Contract 101' })
  await expect(together).toContainText('Asociere · 2 membri')
  await expect(together).toContainText('6.120.000 lei')
  await expect(together).toContainText('Procedura simplificata')
  await expect(
    together.getByRole('link', { name: 'Contract 101' }),
  ).toHaveAttribute('href', '/contracte/9001')
  await expect(main.getByRole('link', { name: 'Exportă CSV' })).toHaveAttribute(
    'href',
    '/contracte.csv?institutie=4981310',
  )
  await expect(page.getByRole('button', { name: /Cere/ })).toHaveCount(0)

  await main.getByRole('tab', { name: /Achiziții directe/ }).click()
  await expect(page).toHaveURL(/\/institutii\/4981310\?lista=achizitii$/)
  await expect(
    main.getByRole('heading', { name: 'Achiziții directe (4)' }),
  ).toBeVisible()
})

test('a town hall shows its budget and the payments to it, each with its period', async ({
  page,
}) => {
  await page.goto('/institutii/4981310')
  const main = page.getByRole('main')

  // Where it is, and what we hold for it.
  await expect(main.getByText('Buget 2024', { exact: true })).toBeVisible()
  await expect(main.getByText('Anghel Saligny', { exact: true })).toBeVisible()

  // The gap panel names three periods and draws no difference between the figures.
  await expect(
    main.getByText(
      'Perioadele diferă: execuția e pe 2024, contractele pe 05.10–07.10.2026, plățile pe 18.05–27.08.2026.',
    ),
  ).toBeVisible()
  await expect(main.getByText('2024 · MDLPA · fără beneficiari')).toBeVisible()
  await expect(
    main.getByText('18.05–27.08.2026 · doar plățile Anghel Saligny'),
  ).toBeVisible()
  await expect(main.getByText(/nu poate fi urmărit/)).toHaveCount(0)

  // Revenue in the design's order; the lines add up to the total.
  await expect(
    main.getByRole('heading', { name: 'Venituri · 2024' }),
  ).toBeVisible()
  await expect(main.getByText('Venituri totale: 10,0 mil. lei')).toBeVisible()
  const lines = main.getByRole('listitem').filter({ hasText: /lei$/ })
  await expect(lines.first()).toContainText('Subvenții de la bugetul de stat')
  await expect(lines.first()).toContainText('5.000.000 lei')
  await expect(main.getByText('Cote din impozitul pe venit')).toBeVisible()

  // Spending: capital first, then by chapter.
  await expect(
    main.getByRole('heading', { name: 'Cheltuieli · 2024' }),
  ).toBeVisible()
  await expect(
    main.getByText('investiții, din totalul de 9,8 mil. lei'),
  ).toBeVisible()
  await expect(main.getByText('Transporturi')).toBeVisible()
  await expect(main.getByText('executat la 31.12.2024')).toHaveCount(2)
  await expect(
    main
      .getByText(
        'Sursa: data.gov.ro · MDLPA · Situația veniturilor și cheltuielilor 2024 · preluat 07.10.2026',
      )
      .first(),
  ).toBeVisible()

  // The payments are a card of their own, never added to the subsidies.
  const paid = main.getByRole('heading', {
    name: 'Plăți Anghel Saligny către primărie',
  })
  await expect(paid).toBeVisible()
  await expect(main.getByText('3 plăți · un proiect')).toBeVisible()
  await expect(
    main.getByText(/Nu le adunăm cu subvențiile din 2024/),
  ).toBeVisible()
  await expect(
    main.getByRole('link', { name: 'vezi proiectele' }),
  ).toHaveAttribute('href', /\/programe\/anghel-saligny\?judet=gorj&q=/)
})

test('an institution with no budget held says so, and names who funds it', async ({
  page,
}) => {
  await page.goto('/institutii/4491342')
  const main = page.getByRole('main')

  await expect(
    main
      .getByRole('link', { name: 'Comuna Țânțăreni (Primăria Țânțăreni)' })
      .first(),
  ).toHaveAttribute('href', '/institutii/4981310')
  await expect(main.getByText('Buget 2024', { exact: true })).toHaveCount(0)
  // The budget and named payments: dotted in the gap panel, and in the budget section.
  await expect(main.getByText('Încă necolectat', { exact: true })).toHaveCount(
    3,
  )
  await expect(
    main.getByText(
      /Bugetul celorlalte instituții e publicat de Ministerul Finanțelor/,
    ),
  ).toBeVisible()
  await expect(main.getByText('Ce se vede deocamdată.')).toBeVisible()
})

test('an institution page counts only accepted purchases', async ({ page }) => {
  await page.goto('/institutii/4981310?lista=achizitii')

  await expect(page).toHaveTitle(`${TOWN_HALL} · Date România`)
  const main = page.getByRole('main')
  await expect(main.getByText('3.500 lei').first()).toBeVisible()
  await expect(
    main.getByRole('heading', { name: 'Achiziții directe (4)' }),
  ).toBeVisible()
  // The refused offer is listed with its value, and marked as not counted.
  const refused = main.getByRole('row').filter({ hasText: 'Purchase 4' })
  await expect(refused).toContainText('Refuzată de furnizor')
  await expect(refused).toContainText('neacceptată, nu intră în total')
  await expect(
    refused.getByRole('link', { name: /DA00000004/ }),
  ).toHaveAttribute(
    'href',
    /e-licitatie\.ro\/pub\/direct-acquisition\/view\/4$/,
  )
})

test('sorting by value keeps the choice in the address', async ({ page }) => {
  await page.goto('/institutii/4981310?lista=achizitii')
  await page.getByRole('radio', { name: 'Cele mai mari acceptate' }).click()

  await expect(page).toHaveURL(
    /\/institutii\/4981310\?lista=achizitii&ordine=valoare$/,
  )
  const main = page.getByRole('main')
  await expect(
    main.getByRole('heading', { name: 'Achiziții directe acceptate (3)' }),
  ).toBeVisible()
  await expect(main.getByRole('row').nth(1)).toContainText('Purchase 2')
  await expect(main.getByText('Purchase 4')).toHaveCount(0)
})

test('a supplier page keeps the purchase above the limit out of the total', async ({
  page,
}) => {
  await page.goto('/furnizori/17886786?lista=achizitii')

  const main = page.getByRole('main')
  await expect(
    main.getByRole('heading', { name: 'ALFA CONSTRUCT S.R.L.' }),
  ).toBeVisible()
  await expect(main.getByText('3.000 lei').first()).toBeVisible()
  const above = main.getByRole('row').filter({ hasText: 'Purchase 5' })
  await expect(above).toContainText('peste plafon, nu intră în total')
  await expect(
    above.getByRole('link', { name: 'SPITALUL JUDETEAN DE URGENTA CLUJ' }),
  ).toHaveAttribute('href', '/institutii/4491342')
})

test('a supplier page never adds what was won alone to what was won together', async ({
  page,
}) => {
  await page.goto('/furnizori/17886786')

  const main = page.getByRole('main')
  await expect(main.getByText('Câștigate singur')).toBeVisible()
  await expect(main.getByText('210.000 lei').first()).toBeVisible()
  await expect(
    main.getByText('un contract · semnate 05.10–07.10.2026 · listă incompletă'),
  ).toHaveCount(2)
  await expect(main.getByText('Câștigate în asociere')).toBeVisible()
  await expect(main.getByText('6,1 mil. lei')).toBeVisible()
  await expect(
    main.getByText('valoarea întreagă a contractelor, nedivizată între membri'),
  ).toBeVisible()
  await expect(main.getByText('Achiziții directe acceptate')).toBeVisible()
  // No sum of the two, and no gap panel: that one is about an institution's budget.
  await expect(main.getByText('6,3 mil. lei')).toHaveCount(0)
  await expect(main.getByText('Încă necolectat')).toHaveCount(0)

  const alone = main.getByRole('row').filter({ hasText: 'Contract 103' })
  await expect(alone).toContainText('singur')
  await expect(alone.getByRole('link', { name: TOWN_HALL })).toHaveAttribute(
    'href',
    '/institutii/4981310',
  )
  const together = main.getByRole('row').filter({ hasText: 'Contract 101' })
  await expect(together).toContainText('Asociere · 2 membri')
  await expect(main).not.toContainText('lider')
  await expect(main.getByRole('link', { name: 'Exportă CSV' })).toHaveAttribute(
    'href',
    '/contracte.csv?furnizor=17886786',
  )
})

test('the rankings open on the largest contracts', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Vezi clasamentele' }).click()

  await expect(page).toHaveURL(/\/clasamente$/)
  await expect(page).toHaveTitle('Clasamente · Date România')
  const main = page.getByRole('main')
  await expect(
    main.getByText('nu spune nimic despre corectitudinea achizițiilor'),
  ).toBeVisible()
  await expect(
    main.getByText('Lista contractelor nu e completă.'),
  ).toBeVisible()
  // Largest first, with the buyer and every winner; the framework agreement is not listed.
  const first = main.getByRole('row').nth(1)
  await expect(first).toContainText('Contract 101')
  await expect(first).toContainText('6.120.000 lei')
  await expect(first).toContainText(TOWN_HALL)
  await expect(first).toContainText('ALFA CONSTRUCT S.R.L., Beta Birotică SRL')
  await expect(main.getByRole('row')).toHaveCount(4)
  await expect(main.getByText('Contract 102')).toHaveCount(0)
  await expect(page.getByRole('button', { name: /Cere/ })).toHaveCount(0)
  // The filters say which ones exist and why the others cannot be chosen yet.
  await expect(main.getByRole('combobox', { name: 'CPV' })).toHaveText(
    'CPV: toate',
  )
  await expect(main.getByRole('combobox', { name: 'Fonduri UE' })).toHaveText(
    'Fonduri UE: toate',
  )
  await expect(
    main.getByText('Anul, județul și tipul instituției nu pot fi alese încă'),
  ).toBeVisible()
})

test('the filters narrow a ranking and stay in the address', async ({
  page,
}) => {
  await page.goto('/clasamente')
  const main = page.getByRole('main')
  await main.getByRole('combobox', { name: 'CPV' }).click()
  await page
    .getByRole('option', { name: '45 · Lucrari de constructii' })
    .click()
  await expect(page).toHaveURL(/\/clasamente\?cpv=45$/)
  await main.getByRole('combobox', { name: 'Fonduri UE' }).click()
  await page.getByRole('option', { name: 'da' }).click()
  await expect(page).toHaveURL(/\/clasamente\?cpv=45&ue=da$/)

  await expect(
    main.getByText('Un anunț care nu spune cum e plătit'),
  ).toBeVisible()
  await expect(main.getByRole('row')).toHaveCount(3)
  await expect(main.getByRole('link', { name: 'Exportă CSV' })).toHaveAttribute(
    'href',
    '/contracte.csv?cpv=45&ue=da',
  )

  // Nothing matches: the page says so, with no figure.
  await page.goto('/clasamente?cpv=30')
  await expect(
    main.getByText('Nimic nu se potrivește cu filtrele alese.'),
  ).toBeVisible()

  // The CPV filter goes with the reader to the direct purchases, the EU one does not.
  await page.goto('/clasamente?clasament=furnizori&cpv=45')
  await expect(main.getByText('1. ALFA CONSTRUCT S.R.L.')).toBeVisible()
  await main.getByRole('tab', { name: 'Achiziții directe' }).click()
  await expect(page).toHaveURL(/\/clasamente\?clasament=achizitii&cpv=45$/)
  await expect(main.getByRole('combobox', { name: 'Fonduri UE' })).toHaveCount(
    0,
  )
})

test('the patterns tab lists purchases just under their limit, as facts', async ({
  page,
}) => {
  await page.goto('/clasamente?clasament=tipare')
  const main = page.getByRole('main')
  await expect(main.getByText('Un tipar nu înseamnă o neregulă')).toBeVisible()
  await expect(
    main.getByRole('heading', {
      name: 'Achiziții directe repetate chiar sub plafon',
    }),
  ).toBeVisible()
  await expect(
    main.getByText('cel puțin 2 achiziții directe acceptate'),
  ).toContainText(
    '270.120 lei pentru produse și servicii, 900.400 lei pentru lucrări',
  )
  await expect(main.getByText('2 perechi cumpărător–furnizor')).toBeVisible()

  const works = main.getByRole('row').filter({ hasText: 'ALFA CONSTRUCT' })
  await expect(works).toContainText(TOWN_HALL)
  await expect(works).toContainText(
    '2 achiziții de lucrări sub plafonul de 900.400 lei',
  )
  await expect(works).toContainText('1.730.000 lei')
  await expect(works.getByRole('link', { name: 'DA00000024' })).toHaveAttribute(
    'href',
    '/achizitii-directe/24',
  )
  // What was checked, and over the days of the purchases checked.
  await expect(
    main.getByText('Verificat: 7 din 13 achiziții directe acceptate.'),
  ).toContainText('6 nu au tipul contractului')
  await expect(
    main.getByText('Achizițiile verificate sunt finalizate în perioada'),
  ).toContainText('05.10.2026 – 07.10.2026')
  await expect(main.getByText('Tipar observat, nu o acuzație.')).toBeVisible()
  // The file holds every pair, one line per purchase, and carries the filter.
  await expect(main.getByRole('link', { name: 'Exportă CSV' })).toHaveAttribute(
    'href',
    '/tipare.csv',
  )

  // The patterns the data cannot give yet, with the reason. ANAF's status is held now;
  // only turnover (ANAF's financial statements) is still to collect.
  const anaf = main.getByText(
    'Furnizor inactiv la ANAF sau înființat de curând',
  )
  await expect(anaf).toBeVisible()
  await expect(main.getByText('Încă necolectat')).toHaveCount(1)
  // The contract against the project's value is on the programme, not in the list.
  await expect(
    main.getByRole('link', { name: 'programul Anghel Saligny' }),
  ).toHaveAttribute('href', '/programe/anghel-saligny')
  await expect(page.getByRole('button', { name: /Cere/ })).toHaveCount(0)

  // Narrowed to one CPV division, the works pair is left out.
  await page.goto('/clasamente?clasament=tipare&cpv=30')
  await expect(main.getByText('O pereche cumpărător–furnizor')).toBeVisible()
  await expect(main.getByRole('combobox', { name: 'CPV' })).toHaveText(
    'CPV: 30',
  )
  await expect(
    main.getByRole('row').filter({ hasText: 'ALFA CONSTRUCT' }),
  ).toHaveCount(0)
  await expect(main.getByRole('link', { name: 'Exportă CSV' })).toHaveAttribute(
    'href',
    '/tipare.csv?cpv=30',
  )
})

test('winners are ranked by what they won alone or in associations', async ({
  page,
}) => {
  await page.goto('/clasamente')
  const main = page.getByRole('main')
  // Every tab has its panel, and an arrow key moves between tabs without opening one.
  await expect(main.getByRole('tabpanel')).toHaveCount(1)
  await main.getByRole('tab', { name: 'Contracte' }).focus()
  await page.keyboard.press('ArrowRight')
  await expect(main.getByRole('tab', { name: 'Furnizori' })).toBeFocused()
  await expect(page).toHaveURL(/\/clasamente$/)
  await page.keyboard.press('Enter')

  await expect(page).toHaveURL(/\/clasamente\?clasament=furnizori$/)
  await expect(main.getByText('1. ALFA CONSTRUCT S.R.L.')).toBeVisible()
  await expect(main.getByText('210.000 lei')).toBeVisible()
  await expect(main.getByText('Beta Birotică SRL')).toHaveCount(0)

  await main.getByRole('radio', { name: 'În asociere' }).click()
  await expect(page).toHaveURL(
    /\/clasamente\?clasament=furnizori&castigate=asociere$/,
  )
  // Every member carries the whole value of the contract, and the page says so.
  await expect(
    main.getByText(
      'Un contract câștigat în asociere apare la fiecare membru, cu valoarea întreagă.',
    ),
  ).toBeVisible()
  await expect(main.getByText('2. Beta Birotică SRL')).toBeVisible()
  await expect(main.getByText('6.120.000 lei')).toHaveCount(2)
})

test('direct purchases and institutions have rankings of their own', async ({
  page,
}) => {
  await page.goto('/clasamente?clasament=achizitii')
  const main = page.getByRole('main')
  await expect(
    main.getByText('După valoarea achizițiilor directe acceptate.'),
  ).toBeVisible()
  await expect(main.getByText('1. ALFA CONSTRUCT S.R.L.')).toBeVisible()
  await expect(main.getByText(`1. ${TOWN_HALL}`)).toBeVisible()
  // No contract figure here, so no note about the list of contracts.
  await expect(main.getByText('Lista contractelor nu e completă.')).toHaveCount(
    0,
  )

  await main.getByRole('tab', { name: 'Instituții' }).click()
  await expect(page).toHaveURL(/\/clasamente\?clasament=institutii$/)
  await expect(main.getByText(`1. ${TOWN_HALL}`)).toBeVisible()
  await expect(main.getByText('6.330.000 lei')).toBeVisible()
  await expect(
    main.getByText('2. SPITALUL JUDETEAN DE URGENTA CLUJ'),
  ).toBeVisible()
})

test('a purchase opens its own page, with what is not collected marked as such', async ({
  page,
}) => {
  await page.goto('/institutii/4981310?lista=achizitii')
  await page.getByRole('link', { name: 'Purchase 4' }).click()

  await expect(page).toHaveURL(/\/achizitii-directe\/4$/)
  await expect(page).toHaveTitle('Purchase 4 · Date România')
  const main = page.getByRole('main')
  await expect(main.getByRole('heading', { name: 'Purchase 4' })).toBeVisible()
  // A refused offer: its value is shown, and marked as not counted.
  await expect(main.getByText('9.999 lei fără TVA')).toBeVisible()
  await expect(main.getByText('Neacceptată · nu intră în total')).toBeVisible()
  await expect(main.getByText('Refuzată de furnizor')).toBeVisible()
  // Payment, delivery and what was bought are published by SEAP; we do not hold them yet.
  await expect(main.getByText('Încă necolectat')).toHaveCount(3)
  await expect(main.getByText('Nepublicat')).toHaveCount(0)
  await expect(
    main.getByText('o achiziție directă acceptată · 500 lei · 06.10.2026'),
  ).toBeVisible()
  await expect(
    main.getByText('Sursa: SEAP · DA00000004 · preluat 07.10.2026'),
  ).toBeVisible()
})

test('the source of one record opens a panel; a total says what it is added up from', async ({
  page,
}) => {
  await page.goto('/achizitii-directe/4')
  const main = page.getByRole('main')
  await main
    .getByRole('button', {
      name: 'Sursa: SEAP · DA00000004 · preluat 07.10.2026',
    })
    .click()
  const panel = page.getByRole('dialog')
  await expect(
    panel.getByRole('heading', { name: 'De unde e cifra asta?' }),
  ).toBeVisible()
  await expect(panel).toContainText('d'.repeat(64))
  await expect(panel).toContainText('Versiunea parserului')
  await expect(panel).toContainText('Copia noastră a răspunsului nu e publică')
  await expect(
    panel.getByRole('link', { name: 'Deschide la sursă' }),
  ).toHaveAttribute(
    'href',
    'https://e-licitatie.ro/pub/direct-acquisition/view/4',
  )
  await expect(
    panel.getByRole('link', { name: 'Raportează o eroare' }),
  ).toHaveAttribute('href', '/surse?despre=%2Fachizitii-directe%2F4#raporteaza')

  // A total has no panel: its line counts the answers and leads to the sources page.
  await page.goto('/')
  const home = page.getByRole('main')
  await expect(
    home.getByText(
      'Sursa: SEAP · preluat 07.10.2026 · adunat dintr-un răspuns',
    ),
  ).toBeVisible()
  await expect(
    home.getByRole('link', { name: 'Vezi sursele' }).first(),
  ).toHaveAttribute('href', '/surse')
})

test('a purchase above the limit is stated as a fact', async ({ page }) => {
  await page.goto('/achizitii-directe/5')
  const main = page.getByRole('main')
  await expect(main.getByText('5.000.000 lei fără TVA')).toBeVisible()
  await expect(main.getByText('Peste plafon · nu intră în total')).toBeVisible()
  await expect(main.getByText('Ofertă acceptată')).toBeVisible()
  // Its only purchase with this supplier is not counted, so there is no sum to show.
  await expect(
    main.getByText('Același furnizor, același cumpărător'),
  ).toHaveCount(0)
})

test('a notice lists every contract and keeps the ceiling out of its total', async ({
  page,
}) => {
  await page.goto('/contracte/9001')

  await expect(page).toHaveTitle('Modernizare drum comunal · Date România')
  const main = page.getByRole('main')
  await expect(main.getByText('Procedura simplificata')).toBeVisible()
  await expect(main.getByText('Lucrari · CPV 45233140-2')).toBeVisible()
  await expect(main.getByText('4 contracte', { exact: true })).toBeVisible()
  // Published, then republished: two dates, and which version this is.
  const facts = main.getByRole('term')
  await expect(facts.filter({ hasText: 'Publicat prima dată' })).toBeVisible()
  await expect(main.getByText('20.03.2024')).toBeVisible()
  await expect(main.getByText('06.10.2026 · SEAP republică')).toBeVisible()
  // The notice that opened the procedure, with its day.
  await expect(facts.filter({ hasText: 'Anunț de participare' })).toBeVisible()
  await expect(main.getByText('SCN0000009 · 10.01.2024')).toBeVisible()
  await expect(
    main.getByText(
      '4 · 2 contracte obișnuite, un acord-cadru și un contract subsecvent',
    ),
  ).toBeVisible()
  await expect(
    main.getByText('Program / Proiect · Programul Regional'),
  ).toBeVisible()
  // The framework agreement (1.500.000) is not in the total; the 2024 contract is.
  await expect(
    main.getByText(
      'Total atribuit 7.230.000 lei · contracte obișnuite și subsecvente',
    ),
  ).toBeVisible()
  const framework = main.getByRole('row').filter({ hasText: 'Contract 102' })
  await expect(framework).toContainText(
    'Acord-cadru · plafon · nu intră în total',
  )
  // An association: one value on the row, members in SEAP's order, no leader named.
  const together = main.getByRole('row').filter({ hasText: 'Contract 101' })
  await expect(together).toContainText('Asociere · 2 membri')
  await expect(together).toContainText(
    'ALFA CONSTRUCT S.R.L., Beta Birotică SRL',
  )
  await expect(together).toContainText('6.120.000 lei')
  await expect(together).not.toContainText('lider')
  // Offers and the five documents are not published; the seventh is the legend that
  // explains the word. No request button yet.
  await expect(main.getByText('Nepublicat', { exact: true })).toHaveCount(7)
  await expect(page.getByRole('button', { name: /Cere/ })).toHaveCount(0)
})

test('a notice not yet read in detail, and one without contracts, say so', async ({
  page,
}) => {
  await page.goto('/contracte/9002')
  const main = page.getByRole('main')
  // First publication and financing wait for the detail (dotted, not dashed); the
  // third is the legend that explains the words.
  await expect(main.getByText('Încă necolectat', { exact: true })).toHaveCount(
    3,
  )
  await expect(main.getByText('ATU1 Lab GmbH')).toBeVisible()
  await expect(main.getByText('Anunț de participare')).toHaveCount(0)
  // With no versions read, the page does not claim the notice was republished.
  await expect(main.getByText('Republicat ultima dată')).toHaveCount(0)
  await expect(
    main.getByText('07.10.2026 · versiunea pe care o avem'),
  ).toBeVisible()

  // A page past the end of the list lands on the last page that has rows.
  await page.goto('/contracte/9002?pagina=7')
  await expect(page).toHaveURL(/\/contracte\/9002$/)
  await expect(main.getByText('ATU1 Lab GmbH')).toBeVisible()

  await page.goto('/contracte/9003')
  await expect(
    main.getByText('SEAP nu listează niciun contract pentru acest anunț.'),
  ).toBeVisible()
  await expect(main.getByText('Total atribuit')).toHaveCount(0)
})

for (const path of [
  '/institutii/12345674',
  '/institutii/abc',
  '/nimic',
  '/contracte/9999',
  '/contracte/abc',
  '/achizitii-directe/999',
]) {
  test(`${path} answers "not found"`, async ({ page }) => {
    const response = await page.goto(path)
    expect(response?.status()).toBe(404)
    await expect(
      page.getByRole('heading', { name: 'Pagina nu există' }),
    ).toBeVisible()
  })
}

test('the sources page says what is held, what is to come and how it is counted', async ({
  page,
}) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Vezi sursele și cum numărăm' }).click()
  await expect(page).toHaveURL(/\/surse$/)
  await expect(page).toHaveTitle('De unde vin datele · Date România')
  const main = page.getByRole('main')

  // A notice is not a contract: what is held is more than what the totals count.
  const awards = main
    .getByRole('row')
    .filter({ hasText: 'SEAP · anunțuri de atribuire' })
  await expect(awards).toContainText('3 anunțuri')
  await expect(awards).toContainText(
    '5 contracte, din care 3 semnate în perioadă',
  )
  await expect(awards).toContainText('05.10–07.10.2026')
  await expect(awards).toContainText('3 din 3 zile citite complet')
  await expect(awards).toContainText('numărul de oferte nu e publicat')
  const direct = main
    .getByRole('row')
    .filter({ hasText: 'SEAP · achiziții directe' })
  await expect(direct).toContainText('6 achiziții')
  await expect(direct).toContainText('5 acceptate')
  await expect(direct).toContainText('1 peste plafon, nu intră în total')

  // A source that comes as files says how many, not how many days were read.
  const payments = main
    .getByRole('row')
    .filter({ hasText: 'data.gov.ro · plăți Anghel Saligny' })
  await expect(payments).toContainText('18.05–27.08.2026')
  await expect(payments).toContainText('2 fișiere')
  await expect(payments).toContainText('6 plăți')
  await expect(payments).toContainText('în 4 proiecte')
  await expect(payments).not.toContainText('zile citite')
  const exports = main
    .getByRole('row')
    .filter({ hasText: 'data.gov.ro · exporturi de contracte SEAP' })
  await expect(exports).toContainText('5 rânduri')
  await expect(exports).toContainText('nu intră în totaluri și clasamente')
  await expect(main.getByRole('tab', { name: 'Surse (4)' })).toBeVisible()

  // Rows the parser could not read, per source; not counted yet is the dotted state.
  const errors = (row: typeof direct) => row.getByRole('cell').nth(3)
  await expect(errors(direct)).toHaveText('0')
  await expect(errors(awards)).toHaveText('2')
  await expect(errors(payments)).toHaveText('Încă necolectat')
  await expect(
    main.getByText('Erori: rânduri din răspunsurile preluate'),
  ).toBeVisible()

  // Sources still to come carry the dotted state and no figure. The payments of the
  // programme are held now, so they are no longer among them.
  await expect(main.getByText('MDLPA · plăți Anghel Saligny')).toHaveCount(0)
  const budget = main.getByRole('row').filter({ hasText: 'Forexebug' })
  await expect(budget).toContainText('Încă necolectat')
  await expect(budget).toContainText('cere un cod de verificare')
  // ANAF is held now, so it is no longer among them.
  await expect(main.getByRole('row').filter({ hasText: /^ANAF/ })).toHaveCount(
    0,
  )
  await expect(
    main.getByRole('link', { name: 'Exportă contractele din perioadă (CSV)' }),
  ).toHaveAttribute('href', '/contracte.csv')

  await main.getByRole('tab', { name: 'Metodologie' }).click()
  await expect(page).toHaveURL(/\/surse\?fila=metodologie$/)
  await expect(
    main.getByText('Un anunț nu este un contract', { exact: true }),
  ).toBeVisible()
  await expect(main.getByText('publicată peste 900.400 lei')).toBeVisible()
  await expect(main.getByText('Până acum sunt 5 răspunsuri.')).toBeVisible()
  await expect(main.getByText(/vinovat|ascuns/)).toHaveCount(0)

  await expect(
    page
      .getByRole('navigation', { name: 'Secțiuni' })
      .getByRole('link', { name: 'Surse' }),
  ).toHaveAttribute('aria-current', 'page')
})

test('a reader reports an error from the page it is on', async ({ page }) => {
  await page.goto('/contracte/9001')
  await page
    .getByRole('contentinfo')
    .getByRole('link', { name: 'Raportează o eroare' })
    .click()
  await expect(page).toHaveURL(
    /\/surse\?despre=%2Fcontracte%2F9001#raporteaza$/,
  )
  const main = page.getByRole('main')
  await expect(main.getByLabel('Pagina')).toHaveValue('/contracte/9001')

  // A word is not a report: nothing is sent.
  await main.getByLabel('Ce e greșit').fill('greșit')
  await main.getByRole('button', { name: 'Trimite' }).click()
  await expect(main.getByRole('alert')).toHaveText(
    'Scrie ce e greșit, în cel puțin 10 caractere.',
  )
  // The field says it is the one at fault, and is where the reader is put back.
  await expect(main.getByLabel('Ce e greșit')).toHaveAttribute(
    'aria-invalid',
    'true',
  )
  await expect(main.getByLabel('Ce e greșit')).toBeFocused()
  await expect(main.getByLabel('Ce e greșit')).toHaveAccessibleDescription(
    /Nu scrie date personale.*cel puțin 10 caractere/,
  )

  // The API refuses the text itself: trying again later would not help.
  await main
    .getByLabel('Ce e greșit')
    .fill('Valoarea e greșită (text refuzat).')
  await main.getByRole('button', { name: 'Trimite' }).click()
  await expect(main.getByRole('alert')).toContainText(
    'Nu am putut primi textul așa cum e scris',
  )

  // The queue is full: the reader is told to come back, and keeps what they wrote.
  await main.getByLabel('Ce e greșit').fill('Valoarea e greșită (coada plină).')
  await main.getByRole('button', { name: 'Trimite' }).click()
  await expect(main.getByRole('alert')).toContainText(
    'prea multe raportări în ultima oră',
  )
  await expect(main.getByLabel('Ce e greșit')).toHaveValue(
    'Valoarea e greșită (coada plină).',
  )
  await expect(main.getByLabel('Ce e greșit')).not.toHaveAttribute(
    'aria-invalid',
  )

  await main
    .getByLabel('Ce e greșit')
    .fill('Valoarea include TVA, nu e fără TVA.')
  await main.getByRole('button', { name: 'Trimite' }).click()
  await expect(main.getByRole('status')).toContainText('Am primit raportarea')
  await expect(main.getByLabel('Ce e greșit')).toHaveValue('')
  await expect(main.getByRole('alert')).toHaveCount(0)
})

test('the corrections tab lists what was corrected, in our words', async ({
  page,
}) => {
  await page.goto('/surse')
  const main = page.getByRole('main')
  // On the sources page itself the link names no page.
  await expect(
    page
      .getByRole('contentinfo')
      .getByRole('link', { name: 'Raportează o eroare' }),
  ).toHaveAttribute('href', '/surse#raporteaza')
  await expect(main.getByLabel('Pagina')).toHaveValue('')

  await main.getByRole('tab', { name: 'Corecturi (1)' }).click()
  await expect(page).toHaveURL(/\/surse\?fila=corecturi$/)
  const row = main.getByRole('row').filter({ hasText: '08.10.2026' })
  await expect(row).toContainText(
    'Valoarea contractului 2 era cu TVA; acum e fără TVA, ca în SEAP.',
  )
  await expect(
    row.getByRole('link', { name: '/contracte/9001' }),
  ).toHaveAttribute('href', '/contracte/9001')
  // What the reader wrote is not published, and neither is a report still waiting.
  await expect(main.getByText('include TVA')).toHaveCount(0)
  await expect(main.getByText('/institutii/4981310')).toHaveCount(0)
})

// The Anghel Saligny programme: four projects in the stub, one per match state.
const PROGRAMME = '/programe/anghel-saligny'

test('the programme page adds up the payment files and says how much was tied', async ({
  page,
}) => {
  await page.goto('/')
  await page
    .getByRole('navigation', { name: 'Secțiuni' })
    .getByRole('link', { name: 'Programe' })
    .click()
  await expect(page).toHaveURL(/\/programe\/anghel-saligny$/)
  await expect(page).toHaveTitle('Programul Anghel Saligny · Date România')
  const main = page.getByRole('main')

  await expect(
    main.getByText('Plătit, în fișierele din 18.05–27.08.2026'),
  ).toBeVisible()
  await expect(main.getByText('7,2 mil. lei').first()).toBeVisible()
  // Of the four payments that name the builder by tax ID, two found one contract. The
  // one with two possible contracts is not counted as tied, and the figure says so.
  await expect(
    main.getByText('Legat, probabil, de un singur contract SEAP'),
  ).toBeVisible()
  await expect(main.getByText('70 %', { exact: true })).toBeVisible()
  await expect(main.getByText('din sumă · 50 % din plăți')).toBeVisible()
  await expect(
    main.getByText(
      'o plată are mai multe contracte posibile și nu e numărată aici',
    ),
  ).toBeVisible()
  await expect(
    main.getByText('din 4 plăți care numesc constructorul cu CUI'),
  ).toBeVisible()
  // The figure rests on both sources, and both are named under it.
  await expect(
    main
      .getByText(
        'Sursa plăților: data.gov.ro · MDLPA · Plăți PNIAS 2026-prezent',
      )
      .first(),
  ).toBeVisible()
  await expect(
    main
      .getByText('Sursa contractelor: data.gov.ro · ADR · Achiziții publice')
      .first(),
  ).toBeVisible()
  // No link is sure, and one payment's is only possible.
  await expect(main.getByText('Nicio legătură nu este sigură')).toBeVisible()
  await expect(
    main.getByText('Pentru o plată, legătura e doar posibilă'),
  ).toBeVisible()
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1)

  // One card per outcome, and why two of them stop short.
  await expect(main.getByText('lanțul complet, până la contract')).toBeVisible()
  await expect(main.getByText('De ce nu găsim un contract.')).toBeVisible()
  await expect(
    main.getByText('Fișierele de plăți publicate înainte de 27.08.2026'),
  ).toBeVisible()
  const august = main.getByRole('row').filter({ hasText: '27.08.2026' })
  await expect(august).toContainText('4.260.000 lei')
})

test('a project is found by county, by words and by what was tied', async ({
  page,
}) => {
  await page.goto(PROGRAMME)
  const main = page.getByRole('main')
  await expect(main.getByText('4 proiecte', { exact: true })).toBeVisible()

  await main.getByRole('combobox', { name: 'Județ' }).click()
  await page.getByRole('option', { name: 'Gorj' }).click()
  await expect(page).toHaveURL(/\?judet=gorj$/)
  await expect(main.getByText('2 proiecte', { exact: true })).toBeVisible()
  await expect(main.getByRole('cell', { name: 'TURCENI' })).toBeVisible()

  await page.goto(`${PROGRAMME}?legatura=mai-multe`)
  await expect(main.getByText('Un proiect', { exact: true })).toBeVisible()
  await expect(main.getByText('județul Cluj', { exact: true })).toBeVisible()

  await page.goto(PROGRAMME)
  await main.getByRole('textbox', { name: 'Caută în proiecte' }).fill('turceni')
  await main.getByRole('button', { name: 'Caută' }).click()
  await expect(page).toHaveURL(/\?q=turceni$/)
  await expect(main.getByText('Un proiect', { exact: true })).toBeVisible()

  await page.goto(`${PROGRAMME}?q=zzzz`)
  await expect(
    main.getByText('Niciun proiect nu se potrivește cu ce ai ales.'),
  ).toBeVisible()
  // A filter the address does not know is dropped, not shown as an error; so is a
  // word every object answers to.
  for (const unknown of ['altceva', 'toString']) {
    await page.goto(`${PROGRAMME}?legatura=${unknown}`)
    await expect(main.getByText('4 proiecte', { exact: true })).toBeVisible()
  }
})

test('a project is traced from the ministry to its contract', async ({
  page,
}) => {
  await page.goto(PROGRAMME)
  const main = page.getByRole('main')
  await main
    .getByRole('link', {
      name: /Modernizare drumuri comunale în comuna Țânțăreni/,
    })
    .click()
  await expect(page).toHaveURL(/\/programe\/anghel-saligny\/proiecte\/101$/)
  // The link to the contract is ours: the page says "probabil" wherever it shows it.
  await expect(main.getByText('Probabil un singur contract')).toBeVisible()
  await expect(
    main.getByRole('heading', { name: 'Contractul probabil' }),
  ).toBeVisible()
  await expect(
    main.getByText(
      'Legătură probabilă: același constructor, după CUI; instituția are numele primăriei și e din același județ.',
    ),
  ).toBeVisible()
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1)
  await expect(
    main.getByText('Contract de finanțare MDLPA 1872 din 18.05.2023'),
  ).toBeVisible()

  const chain = main.getByRole('list', {
    name: 'Lanțul pentru ALFA CONSTRUCT S.R.L.',
  })
  await expect(chain.getByRole('listitem')).toHaveCount(6)
  // The payment from the file without tax IDs goes with the two that name the builder.
  await expect(chain).toContainText('3 plăți · 5,4 mil. lei')
  await expect(chain.getByRole('link', { name: 'ȚÂNȚĂRENI' })).toHaveAttribute(
    'href',
    '/institutii/4981310',
  )
  await expect(chain).toContainText('progres 64 %')
  await expect(
    chain.getByRole('link', { name: 'ALFA CONSTRUCT S.R.L.' }),
  ).toHaveAttribute('href', '/furnizori/17886786')
  // The notice is one we also hold from SEAP, so it opens on its page.
  await expect(chain.getByRole('link', { name: 'CAN0000001' })).toHaveAttribute(
    'href',
    '/contracte/9001',
  )
  await expect(chain).toContainText(
    '6,1 mil. lei · 72 % din valoarea proiectului',
  )
  // What SEAP does not publish ends the chain; nothing offers to request it yet.
  await expect(chain).toContainText('Nepublicat')
  await expect(main.getByText('Cere lista')).toHaveCount(0)
  // The lines of the chain are drawings; each is also said in words, in the chain for
  // a screen reader and in the legend under it.
  await expect(chain).toContainText(
    'legătură probabilă: CUI constructor + nume primărie: Contract SEAP',
  )
  await expect(
    main
      .getByText('legătură probabilă: CUI constructor + nume primărie')
      .last(),
  ).toBeVisible()

  // Won by two: one value, the partner named, never the word "lider".
  await expect(
    main.getByText(
      'Câștigat în asociere cu GAMA ASFALT. Valoarea este a întregului contract.',
    ),
  ).toBeVisible()
  await expect(main.getByText(/lider/i)).toHaveCount(0)
  const total = main.getByRole('row').filter({ hasText: '3 plăți' })
  await expect(total).toContainText('5.400.000 lei')
  await expect(main.getByText('ASA4-25001')).toBeVisible()
})

test('a project with several contracts lists them and picks none', async ({
  page,
}) => {
  await page.goto(`${PROGRAMME}/proiecte/102`)
  const main = page.getByRole('main')
  await expect(
    main.getByText('Mai multe contracte posibile').first(),
  ).toBeVisible()
  const chain = main.getByRole('list', {
    name: 'Lanțul pentru Delta Drumuri SRL',
  })
  await expect(chain).toContainText('Consiliul județean')
  await expect(chain).toContainText('2 anunțuri posibile')
  // A progress that is not a share is shown as the town hall wrote it.
  await expect(chain).toContainText('progres: PT RECEPTIONAT SI APROBAT')
  await expect(
    main.getByRole('heading', { name: 'Contractele posibile' }),
  ).toBeVisible()
  // Two buyers are named like the county council: the links are only possible.
  await expect(
    main
      .getByText(
        'Legătură posibilă: același constructor, după CUI; mai multe instituții din SEAP poartă numele primăriei.',
      )
      .first(),
  ).toBeVisible()
  await expect(chain).toContainText('legătură posibilă')
  // A framework agreement is a ceiling: it gets no share of the project's value.
  const framework = main.getByRole('row').filter({ hasText: 'CAN1070002' })
  await expect(framework).not.toContainText('%')
  await expect(main.getByText('Modernizare DJ 109, lot 1')).toBeVisible()
  await expect(
    main.getByText('Acord-cadru: valoarea este un plafon, nu bani cheltuiți.'),
  ).toBeVisible()
  // The builder has no page of its own, so its name is not a link.
  await expect(
    chain.getByRole('link', { name: 'Delta Drumuri SRL' }),
  ).toHaveCount(0)
})

test('a chain that stops at the builder says why', async ({ page }) => {
  await page.goto(`${PROGRAMME}/proiecte/103`)
  const main = page.getByRole('main')
  const chain = main.getByRole('list', { name: 'Lanțul pentru Omega Gaz SRL' })
  await expect(chain.getByRole('listitem')).toHaveCount(5)
  await expect(chain).toContainText('Niciun contract găsit')
  await expect(chain).toContainText('căutat în SEAP, 03.06.2021–02.04.2024')
  await expect(main.getByText('De ce nu găsim un contract.')).toBeVisible()
  await expect(
    main.getByText('finanțat și din fonduri europene (POIM)'),
  ).toBeVisible()

  await page.goto(`${PROGRAMME}/proiecte/104`)
  const unnamed = main.getByRole('list', {
    name: 'Lanțul pentru Sigma Canal SRL',
  })
  await expect(unnamed).toContainText('fără CUI în fișier')
  await expect(unnamed).toContainText('Nu putem căuta')
  await expect(
    main.getByText('De ce unele plăți nu pot fi legate.'),
  ).toBeVisible()

  const missing = await page.goto(`${PROGRAMME}/proiecte/999`)
  expect(missing?.status()).toBe(404)
  await expect(main.getByText('Pagina nu există')).toBeVisible()
})
