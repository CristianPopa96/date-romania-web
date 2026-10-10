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

for (const path of ['/institutii/12345674', '/institutii/abc', '/nimic']) {
  test(`${path} answers "not found"`, async ({ page }) => {
    const response = await page.goto(path)
    expect(response?.status()).toBe(404)
    await expect(
      page.getByRole('heading', { name: 'Pagina nu există' }),
    ).toBeVisible()
  })
}
