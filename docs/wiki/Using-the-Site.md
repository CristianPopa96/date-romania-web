# A tour of the site

A tour of every page, in the order a visitor usually meets them. The interface is in
Romanian; the Romanian labels are quoted so you can find them on screen, and the
[Glossary](Glossary) translates the rest.

The screenshots below show the site filled with made-up test data, so the names and
amounts in them are not real.

## How the pages connect

Every name of an institution or company is a link to its page, so you can keep
following the money from any page. The top bar on every page holds the sections that
exist today and a search field:

- **"Localități"**: every county, town and commune.
- **"Clasamente"**: rankings of the largest contracts, companies and institutions.
- **"Programe"**: the Anghel Saligny investment programme.
- **"Surse"**: where the data comes from, how it is counted, and corrections.

## Home

![The home page](images/home.png)

What you see: a headline ("Urmărește banii publici, de la buget la contract"), a large
search box with example searches (primăria, consiliul județean, spitalul județean,
universitatea), the headline figures for direct purchases (accepted value, number of
accepted purchases, institutions, suppliers), and "Ce date avem", a table of each source
held with its period, number of records and the day it was last read.

What you can do: search, or jump to the rankings or the sources.

## Search

![Search results](images/search.png)

Type part of a name or a tax ID (CUI). Diacritics and small typos are forgiven
("Barzava" finds "Bârzava"). Results are split in tabs: "Toate", "Instituții",
"Firme".

- A **valid CUI** takes you straight to its page: the institution page if that CUI buys
  through SEAP, otherwise the company page.
- Search only knows institutions and companies that appear in the data held (direct
  purchases and award notices), and places: a commune, town or municipality by its name,
  or by the name of one of its villages ("Localități" tab).

## Institution page

![An institution page](images/institution.png)

The page of a public body as a **buyer** (a town hall, a hospital, a ministry…).

1. **Header**: name and CUI, its county, the institution that funds it ("subordonată
   …", a link), and which sources are held for it ("SEAP", "Buget 2024", "Anghel
   Saligny").
2. **"Cele două capete ale banilor"** (the two ends of the money): three boxes side by
   side, capital spending executed, contracts awarded, and payments we can name. For a
   town hall or a county council, the first holds its capital spending of 2024 and the
   last the Anghel Saligny payments to it. The three cover different periods, so each
   box names its own, no bars are drawn and no difference is computed: the note under
   them opens "Perioadele diferă: …". A box not held is marked "Încă necolectat".
3. **"Buget"**: for a town hall or a county council, "Venituri · 2024" (revenue in seven
   lines that add up to the total: state subsidies, income tax shares, VAT shares, own
   revenue, EU funds, subsidies from other administrations, other) and "Cheltuieli ·
   2024" (capital spending, then spending by chapter: transport, education…), both
   executed to 31.12.2024, from the Ministry of Development. The Anghel Saligny payments
   to it are a card of their own, never added to the subsidies, with a link to its
   projects. Any other institution (a school, a hospital, a ministry) shows "Încă
   necolectat": the Finance Ministry publishes its budget, but it cannot be collected
   yet.
4. **Figures**: "Contracte atribuite" (contracts awarded, signed in the period held) and
   "Achiziții directe acceptate" (accepted direct purchases). The two are never added
   together.
5. **Two tabs**:
   - "Contracte": the contracts it awarded, with winner, value and signing date, and a
     CSV export.
   - "Achiziții directe": its top suppliers by value, then every direct purchase, sortable
     by newest or largest.

The page opens on the tab that has something to show. The link in your browser keeps
the tab, page and order you chose, so you can share exactly what you see.

## Company page

![A company page](images/company.png)

The same layout, flipped: a company as a **seller**.

- Figures: "Câștigate singur" (contracts won alone), "Câștigate în asociere" (won as part
  of an association, at the full value of the contract) and "Achiziții directe
  acceptate". They sit side by side and are never added, because a contract won in an
  association would otherwise be counted once per member.
- Tabs: its contracts, and the institutions it sold to directly, with every sale.

## Award notice page

![An award notice page](images/notice.png)

One SEAP award notice, which can hold **several contracts**.

- Title, procedure type, CPV code, buyer ("Autoritate contractantă"), financing, the day
  it was first published and last republished, and the "Anunț de participare" (the
  notice that opened the procedure).
- "Contractele din anunț": one row per contract, with its winner(s), value without VAT
  and date. Above the table, the notice's total counts ordinary and subsequent contracts.
- A framework agreement shows muted as "Acord-cadru · plafon · nu intră în total": it is
  a ceiling, not money spent.
- An association shows the badge "Asociere · N membri" with its members in SEAP's
  order.
- "Ce nu este public": a fixed list of what SEAP does not publish (signed contracts and
  addenda, the number of offers, payment orders, subcontractors, reception documents).
- A link to the notice on SEAP ("Vezi la sursă").

## Direct purchase page

![A direct purchase page](images/direct-purchase.png)

A small purchase made without an auction, from SEAP's catalogue.

- Buyer, supplier, value without VAT, state and date.
- A purchase that was not accepted shows its value muted, "Neacceptată · nu intră în
  total"; one published above the legal ceiling shows "Peste plafon · nu intră în total".
- "Ce s-a cumpărat" (the items bought) is marked "Încă necolectat": SEAP publishes it,
  but it is not collected yet.
- "Același furnizor, același cumpărător": how many accepted purchases the same pair made
  in the period, and for how much.

## Localities

![The list of counties](images/localities.png)

The 42 counties (Bucharest is one), each with its number of UATs (communes, towns,
municipalities, Bucharest sectors) and people. A county opens its page.

![A county page](images/county.png)

**A county.** The same figures as a locality,
added up over its UATs and its county council, then a table of every UAT with its
population, capital spending in 2024 (the year of the UATs' budgets, the council's left
out) and contracts signed in the period held.

![A commune page](images/commune.png)

**A town or commune.** One UAT:

1. Its kind, county and population at 1 January 2024, and a lead saying every figure has
   its own period and none is added to another.
2. Four figures, each with its period: the Anghel Saligny payments to its town hall
   (other programmes are not collected yet), the town hall's capital spending in 2024,
   the contracts of every institution located here, and the share of them won by
   suppliers of the county (an association counts only when all its members are; one
   with members in several counties is counted apart).
3. The town hall's budget (its largest revenue lines, and a link to the whole budget on
   its page), and who gets the contracts, each supplier with its county.
4. "Proiecte în zonă": the town hall's Anghel Saligny projects, with the progress as the
   town hall types it and whether a SEAP contract was found.
5. "Plăți ale primăriei": we do not hold whom the town hall paid; its payments can be
   asked for under Law 544/2001.
6. "Instituții din localitate": every institution located here, with its contracts and,
   for the town hall, its capital spending.

Bucharest's page adds up its six sectors and links to each; its payments figure names
the town hall and its sectors. A village, or a component locality of a town, has no page
of its own: searching it opens its UAT, with the line "Localitatea X face parte din Y."

## Rankings

![The rankings](images/rankings.png)

Five tabs, each a measurable fact with its source:

| Tab                       | What it ranks                                                                                               |
| ------------------------- | ----------------------------------------------------------------------------------------------------------- |
| "Cele mai mari contracte" | The largest contracts signed in the period                                                                  |
| "Furnizori"               | Companies by value of contracts won; switch between won alone ("Singur") and in association ("În asociere") |
| "Achiziții directe"       | Suppliers and institutions by accepted direct purchases, kept apart from contracts                          |
| "Instituții"              | Institutions by value of contracts awarded                                                                  |
| "Tipare"                  | Patterns worth asking documents about (see below)                                                           |

Filters: **CPV** (the category of what was bought, by its first two digits, for example
45 for construction works) on every tab, and **Fonduri UE** (EU funds: yes or no) on the
contract tabs. A note says which filters cannot be offered yet (year, county,
institution type) and why.

![The patterns tab](images/patterns.png)

**"Tipare" (patterns).** One pattern is shown today: **repeated direct purchases just
under the legal ceiling**, the same buyer and the same supplier with at least two
accepted direct purchases, each between 90% of the ceiling for its type and the
ceiling. Each row says what was measured and links to both parties; the list downloads
as a spreadsheet. The page explains what the pattern shows and what it does not: a
value close to the ceiling does not prove a purchase was split. Patterns that the data
cannot give yet are listed with the reason.

## Programme

![The Anghel Saligny programme page](images/programme.png)

The Anghel Saligny national investment programme: the ministry (MDLPA) pays town halls
for roads, water, sewage and gas works.

- Headline figures: amount paid in the payment files held, number of projects, town
  halls and county councils paid, and the share of the money that could be tied,
  probably, to one SEAP contract.
- "Cum s-au legat plățile": how a payment is tied to a contract, in plain words.
- "Urmărește un proiect": a finder with a county select, a match-state filter and a
  search on the town hall or the works.
- The list of payment files held, with how many name the builder's CUI.

![An Anghel Saligny project page](images/project.png)

**Project page**: the ministry's financing
contract, total value, the state budget share, progress, designer and builder, and
"Drumul banilor", the chain **ministry → town hall → project → builder → SEAP
contract**. Each hop says where it comes from and how sure it is. The project's payments
are listed below. A project has one of four states:

| State                              | Meaning                                                              |
| ---------------------------------- | -------------------------------------------------------------------- |
| "Probabil un singur contract"      | One contract fits; the chain is complete                             |
| "Mai multe contracte posibile"     | Several contracts fit; all are shown, none is picked                 |
| "Niciun contract găsit"            | The chain stops at the builder; likely reasons are listed            |
| "Constructor numit doar cu numele" | The file gives only the builder's name, no CUI, so no search is made |

From a project you can open the builder's page, the town hall's page, the SEAP notice,
or every project of the same builder.

## Sources

![The sources page](images/sources.png)

Three tabs:

- **"Surse"**: one row per source held, with the period, the day it was last read, what
  is held in the source's own units, "Erori" (rows that could not be read: logged, kept,
  never counted) and its known limits. A second table lists public sources not collected
  yet. A link exports every contract of the period as CSV.
- **"Metodologie"**: "Cum numărăm", the counting rules in plain words. See
  [Reading the figures](Reading-the-Figures).
- **"Corecturi"**: corrections made after readers' reports.

**Reporting an error.** Every page's footer has "Raportează o eroare". The form takes
the page address, what is wrong and, optionally, a link to evidence. A person reads each
report before anything changes; only the reviewer's description of an accepted
correction is published, never the reader's text. A reader can send at most 5 reports
an hour.

## Downloads

Every list of contracts has a download button that gives a CSV file (it opens in Excel
or any spreadsheet program): all contracts of the period from "Surse", or one
institution's or one company's contracts from its page. The purchases behind the "just
under the ceiling" pattern download from the "Tipare" tab.

Each row keeps its source and the day it was read. The data is free to reuse under CC BY
4.0, naming Date România and the original source.
