# Features and roadmap

The site is planned as ten user flows, built in releases. This page is the state as of
15.11.2026.

## Built

| Release | What you can do                                                                                                                           |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| 1       | Search institutions and companies by name or tax ID                                                                                       |
| 1       | See what an institution contracted and bought                                                                                             |
| 1       | See what a company won, alone and with others, and whom it sold to                                                                        |
| 1       | Open any contract notice or direct purchase                                                                                               |
| 2       | Follow the Anghel Saligny programme from the ministry to the builder                                                                      |
| 2       | Browse rankings and the "just under the limit" pattern, filtered by kind of purchase and EU funds                                         |
| 2       | See every source, how figures are counted, corrections, and report an error; check the source of any record                               |
| 2       | Download contracts (all, or one institution's or company's) and the pattern as spreadsheets                                               |
| 3       | See the money coming in for a town hall or county council: its 2024 budget and the Anghel Saligny payments; see who funds any institution |
| 3       | Look up any county, town or commune: its budget, programme money, contracts, projects and institutions; find a village by name            |
| 4       | Follow the EU recovery plan (PNRR): its measures, every financing contract, the payments, the largest recipients                          |
| 4       | Look up any EU cohesion project by programme, status, words or SMIS code, with what was paid up to the day of its list                    |
| 4       | See the SEAP contracts and direct purchases that cite an EU project or a PNRR contract                                                    |
| 4       | See the EU projects and PNRR money of an institution, a company, a town hall or a county council                                          |
| 4       | Filter, sort and chart the direct purchases of an institution or a company, and download them as filtered                                 |
| 4       | Every list (contracts, purchases, projects, rankings) filtered, sorted and charted the same way, and downloaded as filtered               |
| 4       | Browse every project of every programme in one list, each with how far its money is followed, and open each project's page                |
| 4       | See every project of an institution, of a company (with how it was paid through it) and of a commune or county                            |
| 4       | Browse every contract and every accepted direct purchase, and rank companies and institutions by either, filtered by county               |
| 4       | See every company's entry in the trade register (form, registration, state) and the EU projects of the regional programmes                |
| 4       | Follow the road of the data from each public source to the pages, with today's figures ("Drumul datelor")                                 |
| —       | On the home page, set the country's budget (planned and spent so far) beside what our data shows, and see which figures can be compared   |

## The data behind it

Purchases and contracts are held for **every day from 1 January 2026**, and a new day
is collected each morning (as of 15.11.2026).

- **Direct purchases**: 2,013,306 to 14 November 2026, every day complete (1,914,608
  accepted, 16.7 billion lei).
- **Award notices**: 39,396 notices published or republished in the period, with
  343,078 contracts. Only the contracts signed inside the period are counted, and the
  newest days are always incomplete (contracts appear weeks after signing).
- **Anghel Saligny**: eight payment files (18 May to 30 October 2026, 3,955 payments)
  and SEAP's quarterly contract exports from 2021, used only to trace the programme.
- **Places and local budgets**: SIRUTA (every county, town hall and village), the
  Finance Ministry's list of 13,485 public entities, the 2024 executed budget of every
  town hall and county council and the population of every town hall area (Ministry of
  Development), and ANAF's record of the 102,210 institutions and companies held.
- **Companies**: the trade register (ONRC), 2,741,689 companies (the edition of
  19.10.2026), read once a quarter. Natural persons in it are never read.
- **EU money**: MIPE's PNRR dashboard (every financing contract, with the dated
  payments to each beneficiary; the edition of 15.10.2026), MIPE's lists of contracted
  projects for 13 cohesion programmes, with the Health programme's payments one by one,
  and MIPE's map of the 2021–2027 projects, which adds the regional programmes and
  Transport: 29,131 projects in all. 90% are tied to an institution or company, by tax
  ID or by name.
- **The country's budget**: the Finance Ministry's monthly budget execution (every
  month from January 2024 to September 2026), Eurostat's government spending by purpose
  (COFOG, 2015 to 2024), and the 2026 budget law's planned figures, entered by hand with
  the page each is printed on.

## Not built yet

| Release | What it will do                                                                          | What it needs                                                                                                                |
| ------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Later   | "Money in" for institutions other than town halls and county councils                    | The Finance Ministry's per-institution budgets, published behind a verification code; a request for the whole set is planned |
| 4       | From a gap to a Law 544 request: request missing documents, track the answer, publish it | The request tracker; the project team sends every request                                                                    |
| On hold | Available versus unused funds, and who answers for them                                  | Dated EU absorption snapshots, budget commitments, office holders and their dates                                            |
| Later   | Politicians and parties                                                                  | Not researched yet                                                                                                           |

Also waiting:

- The budget rectification of 2026 (OUG 41/2026): the home page's planned figure is the
  budget law's until a document gives the new consolidated total.
- Placing a national beneficiary's projects where the work is, rather than where the
  beneficiary is registered.

- The items bought in each direct purchase, with payment and delivery conditions, below
  100,000 lei (shown as "Încă necolectat"). Accepted purchases of 100,000 lei or more
  are collected, newest first, since October 2026.
- Filters by year and institution type in the rankings, and a ranking as a spreadsheet.
- More patterns: supplier inactive at ANAF or newly founded, public money as most of a
  company's turnover, single-offer procedures (the number of offers is not published by
  SEAP).
- "Descarcă tot" (download everything), once every source exports.
- A way to ask for the removal of personal data.
- A public address: the site is not hosted yet.

## Decisions that shape the site

- Romanian only at launch, built so that other languages can be added. Addresses stay
  Romanian in every language, and data is never translated.
- Dark theme only.
- The top bar lists only sections that exist.
- No "Cere documente" (request documents) button until the request flow exists; the
  list of what is not public stays on each notice.
- One page per role: a CUI that both buys and sells has an institution page and a
  company page.
