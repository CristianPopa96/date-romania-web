# Features and roadmap

The site is planned as ten user flows, built in releases. This page is the state as of
18.10.2026.

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

## The data behind it

The data is fixed to **1 September to 10 October 2026** (40 days) while the site is
being built; no other days are collected until the maintainer decides to resume.

- **Direct purchases**: 293,712, complete for the period (2.5 billion lei accepted).
- **Award notices**: 6,058 notices published or republished in the period, with 77,401
  contracts. Only the 4,796 contracts signed inside the period (6.3 billion lei) are
  counted, and that list is incomplete for good (contracts appear weeks after signing).
- **Anghel Saligny**: six payment files (18 May to 27 August 2026) and SEAP's quarterly
  contract exports from 2021, used only to trace the programme.
- **Places and local budgets**: SIRUTA (every county, town hall and village), the
  Finance Ministry's list of 13,485 public entities, the 2024 executed budget of every
  town hall and county council and the population of every town hall area (Ministry of
  Development), and ANAF's record of all 49,525 institutions and companies held. All
  but two have their county and town hall area.

## Not built yet

| Release | What it will do                                                                          | What it needs                                                                                                                |
| ------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Later   | "Money in" for institutions other than town halls and county councils                    | The Finance Ministry's per-institution budgets, published behind a verification code; a request for the whole set is planned |
| 4       | EU funded projects                                                                       | The EU funds ministry's project lists, and project codes found in contract titles                                            |
| 4       | From a gap to a Law 544 request: request missing documents, track the answer, publish it | The request tracker; the project team sends every request                                                                    |
| On hold | Available versus unused funds, and who answers for them                                  | Dated EU absorption snapshots, budget commitments, office holders and their dates                                            |
| Later   | Politicians and parties                                                                  | Not researched yet                                                                                                           |

Also waiting:

- The items bought in each direct purchase, payment and delivery conditions (shown as
  "Încă necolectat").
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
