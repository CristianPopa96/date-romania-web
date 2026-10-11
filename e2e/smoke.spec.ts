import { expect, test } from '@playwright/test'

// Smoke tests: each page opens in a real browser and shows the figures the API gave.
// The data is the handful of purchases in e2e/stub/answers.json: one town hall, one
// hospital, two suppliers, one refused offer and one purchase above the legal limit.

const TOWN_HALL = 'Comuna Țânțăreni (Primăria Țânțăreni)'

test('the home page shows the totals, their period and their source', async ({
  page,
}) => {
  await page.goto('/')

  await expect(page).toHaveTitle('Date România')
  const main = page.getByRole('main')
  await expect(main.getByText('4.200 lei').first()).toBeVisible()
  await expect(main.getByText('05.10.2026 – 07.10.2026')).toBeVisible()
  // The purchase above the limit is told apart, as a fact and not as an accusation.
  await expect(
    main.getByText('Nu este inclusă în total: 5.000.000 lei'),
  ).toBeVisible()
  await expect(main.getByText('Tipar observat, nu o acuzație')).toBeVisible()
  await expect(main.getByText('Sursa: SEAP · preluat 07.10.2026')).toBeVisible()
  await expect(main.getByText('API 0.1.0 · bază de date ok')).toBeVisible()
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

test('an institution page counts only accepted purchases', async ({ page }) => {
  await page.goto('/institutii/4981310')

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
  await page.goto('/institutii/4981310')
  await page.getByRole('radio', { name: 'Cele mai mari acceptate' }).click()

  await expect(page).toHaveURL(/\/institutii\/4981310\?ordine=valoare$/)
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
  await page.goto('/furnizori/17886786')

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

test('the rankings list suppliers and institutions by accepted value', async ({
  page,
}) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Vezi clasamentele' }).click()

  await expect(page).toHaveURL(/\/clasamente$/)
  await expect(page).toHaveTitle('Clasamente · Date România')
  const main = page.getByRole('main')
  await expect(
    main.getByText('nu spune nimic despre corectitudinea achizițiilor'),
  ).toBeVisible()
  await expect(main.getByText('1. ALFA CONSTRUCT S.R.L.')).toBeVisible()
  await expect(main.getByText(`1. ${TOWN_HALL}`)).toBeVisible()
})

test('a purchase opens its own page, with what is not collected marked as such', async ({
  page,
}) => {
  await page.goto('/institutii/4981310')
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
