# Features and roadmap

The site is planned as ten user flows, built in releases. This page is the state as of
18.10.2026.

## Built

| Release | Flow                              | On the site                                                                                                                                                            |
| ------- | --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1       | Search                            | `/cautare`: institutions and companies by name or CUI                                                                                                                  |
| 1       | Institution (money out only)      | `/institutii/{CUI}`: contracts awarded and direct purchases                                                                                                            |
| 1       | Company                           | `/furnizori/{CUI}`: contracts won alone and in association, direct sales                                                                                               |
| 1       | Award notice and direct purchase  | `/contracte/{ID}`, `/achizitii-directe/{ID}`                                                                                                                           |
| 2       | Programme trace (Anghel Saligny)  | `/programe/anghel-saligny` and one page per project                                                                                                                    |
| 2       | Rankings and patterns             | `/clasamente`: five tabs, CPV and EU funds filters, one pattern                                                                                                        |
| 2       | Sources, methodology, corrections | `/surse`: sources held, "Erori" per source, "Cum numărăm", corrections, error report form, source panel on every record                                                |
| 2       | Exports                           | CSV of contracts (all, or per institution or company) and of the pattern                                                                                               |
| 3       | Institution "money in"            | On `/institutii/{CUI}` of a town hall or county council: its 2024 budget, the Anghel Saligny payments to it, the gap panel with periods; the funder of any institution |
| 3       | Localities and counties           | `/localitati`, `/localitati/{judet}`, `/localitati/{judet}/{uat}`: budgets, payments, contracts and projects of every place; localities in search                      |

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

| Release | Flow                                                                                     | What it needs                                                                                                                     |
| ------- | ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Later   | "Money in" for institutions other than town halls and county councils                    | Budget execution per institution (Forexebug): its portal asks for a captcha, so a bulk request to the Finance Ministry is planned |
| 4       | EU funded projects                                                                       | MIPE project lists, SMIS codes found in contract titles                                                                           |
| 4       | From a gap to a Law 544 request: request missing documents, track the answer, publish it | The request tracker; the project team sends every request                                                                         |
| On hold | Available versus unused funds, and who answers for them                                  | Dated EU absorption snapshots, budget commitments, office holders and their dates                                                 |
| Later   | Politicians and parties                                                                  | Not researched yet                                                                                                                |

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
