# What Date România is

## The problem it addresses

Romanian public money is published, but in pieces that do not fit together:

| Step of the money                            | Is it published?                                     | Can it be linked to the next step?                  |
| -------------------------------------------- | ---------------------------------------------------- | --------------------------------------------------- |
| How much each institution gets in its budget | Yes                                                  | Only through budget codes                           |
| What the institution commits to spend        | Only totals                                          | No company or contract is named                     |
| Which company wins a contract (SEAP)         | Yes                                                  | The contract does not say which budget line pays it |
| What is actually paid to the company         | Mostly no; a few institutions publish it voluntarily | Usually no contract reference                       |
| Subcontractors                               | No                                                   |                                                     |

The reasons are structural: payments are processed by the treasury and only totals are
published; the budget, contract and payment systems share no common identifier; and the
right to see documents (Law 544/2001) works on request, not by publication.

So nobody can show the full road of a leu from the budget to the final company using
published data alone. Date România does the next best thing.

## What it does

1. **Shows both ends.** What institutions spend and contract on one side, which
   companies receive the contracts on the other, linked by the tax ID (CUI) wherever
   the data allows.
2. **Ranks.** The largest contracts, the companies that win the most, the institutions
   that spend the most, and patterns worth a closer look.
3. **Marks the gaps.** Where data is missing, the page says what is missing and why.
   Later, the plan is to request the missing documents under Law 544/2001 and publish
   what comes back.

## Who it is for

| Visitor                        | Typical question                                                  | Where they start                              |
| ------------------------------ | ----------------------------------------------------------------- | --------------------------------------------- |
| A citizen                      | "What did my town hall spend, and on whom?"                       | Search on the home page, or a shared link     |
| A journalist or NGO researcher | "Who are the biggest winners of this buyer? Is anything unusual?" | Rankings, a company page                      |
| A local watchdog or councillor | "Where did the Anghel Saligny money for our commune go?"          | The programme page                            |
| A data reuser or developer     | "Can I get this as a file or an API?"                             | The sources page, CSV export buttons, the API |

## What makes it strong

- **Every figure has a source.** Each number carries a line such as
  "Sursa: SEAP · achiziții directe · preluat 10.10.2026". For one record (a purchase, a
  notice, a contract) that line opens a panel with the source address, the day it was
  read, the fingerprint (SHA-256) of the stored answer and the parser version.
- **Nothing is thrown away.** Every answer received from a public source is stored
  untouched before it is read, so any figure can be traced back and any reading can be
  redone.
- **Honest counting.** Only money that was really committed is added up: a refused
  direct purchase is listed but not counted, a framework agreement (a spending ceiling)
  is never added to totals, a contract won by an association of companies is counted
  once and never split, and direct purchases and contracts are never summed together.
  See [Reading the figures](Reading-the-Figures).
- **Links say how sure they are.** When two records are tied together, the site says
  whether the link is sure, probable or possible, and on what evidence.
- **Gaps are shown, not hidden.** "Nepublicat" means the source does not publish the
  value; "Încă necolectat" means the source publishes it and Date România has not
  collected it yet. Neither is ever shown as a zero, a dash or "unknown".
- **Facts, never accusations.** A pattern is labelled "Tipar observat, nu o acuzație"
  (an observed pattern, not an accusation). Colours mark how sure a link is or the state
  of a process, never a judgement on an institution or a company.
- **The one programme that can be traced end to end.** Anghel Saligny payment files
  name the company that builds each project, so the site follows the money from the
  ministry to the town hall, the project, the builder and, probably, the SEAP contract.
- **Shareable and reusable.** Every view, with its filters and page, has its own
  address. Lists export as CSV. Data is under CC BY 4.0, and the code is open source.
- **Readers can report errors.** A form on every page sends a report to a review queue.
  A person checks it, and accepted corrections are published in the "Corecturi" tab.
- **Personal data is protected.** Sole traders can appear in SEAP under their personal
  numeric code (CNP); it is masked as `[CNP]` everywhere on the site.

## What it does not do (yet)

- It does not show budgets or budget execution, EU-funded projects, localities or
  counties: those sources are not collected yet.
- It does not cover every day: the data is fixed to 1 September to 10 October 2026
  while the site is being built.
- It does not know who was paid outside the Anghel Saligny programme, because those
  payments are mostly not published.
- It has nothing yet about politicians or parties; that comes later.

See [Features and roadmap](Features-and-Roadmap).
