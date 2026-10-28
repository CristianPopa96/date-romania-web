# Features and roadmap

The site is planned as ten user flows, built in releases. This page is the state as of
28.10.2026.

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

## The data behind it

Purchases and contracts are held for **every day from 1 January 2026**, and a new day
is collected each morning (as of 20.10.2026).

- **Direct purchases**: 1,808,179, every day complete (1,719,358 accepted, 15.1 billion
  lei).
- **Award notices**: 34,445 notices published or republished in the period, with
  246,883 contracts. Only the 76,281 contracts signed inside the period are counted,
  and the newest days are always incomplete (contracts appear weeks after signing).
- **Anghel Saligny**: six payment files (18 May to 27 August 2026) and SEAP's quarterly
  contract exports from 2021, used only to trace the programme.
- **Places and local budgets**: SIRUTA (every county, town hall and village), the
  Finance Ministry's list of 13,485 public entities, the 2024 executed budget of every
  town hall and county council and the population of every town hall area (Ministry of
  Development), and ANAF's record of all 87,472 institutions and companies held. All
  but two have their county and town hall area.
- **EU money**: MIPE's PNRR dashboard (every financing contract, with the dated
  payments to each beneficiary; the edition of 15.10.2026), and MIPE's lists of
  contracted projects for 13 cohesion programmes (22,326 projects), with the Health
  programme's payments one by one. 57% of the cohesion projects are tied to an
  institution or company held, by tax ID or by name.

## Not built yet

| Release | What it will do                                                                          | What it needs                                                                                                                |
| ------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Later   | "Money in" for institutions other than town halls and county councils                    | The Finance Ministry's per-institution budgets, published behind a verification code; a request for the whole set is planned |
| 4       | From a gap to a Law 544 request: request missing documents, track the answer, publish it | The request tracker; the project team sends every request                                                                    |
| On hold | Available versus unused funds, and who answers for them                                  | Dated EU absorption snapshots, budget commitments, office holders and their dates                                            |
| Later   | Politicians and parties                                                                  | Not researched yet                                                                                                           |

Also waiting:

- The EU projects of the regional programmes of 2021–2027 (left out for now).
- On a place's page, the EU projects of every institution and company located there,
  not only the town hall's.

- The items bought in each direct purchase, with payment and delivery conditions, below
  100,000 lei (shown as "Încă necolectat"). Accepted purchases of 100,000 lei or more
  are collected, newest first, since October 2026.
- Filters by year, county and institution type in the rankings.
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
